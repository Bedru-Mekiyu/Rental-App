import crypto from "crypto"
import mongoose from "mongoose"
import WebhookEvent from "../models/WebhookEvent.js"
import Payment from "../models/Payment.js"

function getWebhookToleranceMs() {
  const configured = Number.parseInt(process.env.WEBHOOK_TOLERANCE_MS || "300000", 10)
  return Number.isNaN(configured) ? 300000 : configured
}

export async function verifyWebhookSignature(provider, payload, signature, secret, timestamp) {
  try {
    if (!secret) {
      console.warn("[SECURITY] Webhook secret not configured")
      return false
    }
    if (!payload || (typeof payload === "string" && payload.length === 0)) {
      return false
    }
    if (timestamp) {
      const payloadTime = Number.parseInt(timestamp, 10) * 1000
      const now = Date.now()
      const timeDiff = Math.abs(now - payloadTime)

      if (!Number.isNaN(payloadTime) && timeDiff > getWebhookToleranceMs()) {
        // 5 minute window
        console.warn(`[SECURITY] Webhook timestamp too old: ${timeDiff}ms`)
        return false
      }
    }

    const safeEqual = (a, b) => {
      const aBuf = Buffer.from(a || "")
      const bBuf = Buffer.from(b || "")
      if (aBuf.length !== bBuf.length) return false
      return crypto.timingSafeEqual(aBuf, bBuf)
    }

    switch (provider) {
      case "STRIPE": {
        if (!signature) return false
        const parts = signature.split(",").reduce(
          (acc, part) => {
            const [key, value] = part.split("=")
            if (!key || !value) return acc
            if (key === "v1") {
              acc.v1.push(value)
            } else {
              acc[key] = value
            }
            return acc
          },
          { v1: [] },
        )
        const stripeTimestamp = parts.t
        if (!stripeTimestamp || parts.v1.length === 0) return false
        const stripeTimestampMs = Number.parseInt(stripeTimestamp, 10) * 1000
        if (Number.isNaN(stripeTimestampMs)) return false
        const stripeTimeDiff = Math.abs(Date.now() - stripeTimestampMs)
        if (stripeTimeDiff > getWebhookToleranceMs()) {
          console.warn(`[SECURITY] Stripe webhook timestamp too old: ${stripeTimeDiff}ms`)
          return false
        }
        const computed = crypto
          .createHmac("sha256", secret)
          .update(`${stripeTimestamp}.${payload}`)
          .digest("hex")
        return parts.v1.some((stripeSig) => safeEqual(computed, stripeSig))
      }

      case "CHAPA": {
        if (!signature) return false
        const body = typeof payload === "string" ? payload : JSON.stringify(payload)
        const computed = crypto.createHmac("sha256", secret).update(body).digest("hex")
        return safeEqual(computed, signature)
      }

      case "FLUTTERWAVE": {
        if (!signature) return false
        const body = typeof payload === "string" ? payload : JSON.stringify(payload)
        const computed = crypto.createHmac("sha256", secret).update(body).digest("hex")
        return safeEqual(computed, signature)
      }

      default:
        return false
    }
  } catch (err) {
    console.error("[v0] Webhook verification failed:", err)
    return false
  }
}

export async function processWebhookEvent(provider, eventType, payload, eventId) {
  try {
    const resolvedEventId = resolveEventId(eventId, payload)
    const existingEvent = await WebhookEvent.findOne({
      externalEventId: resolvedEventId,
      status: { $in: ["PROCESSED", "PROCESSING"] },
    })

    if (existingEvent) {
      console.warn(`[SECURITY] Duplicate webhook event detected: ${eventId}`)
      return { success: true, isDuplicate: true, payment: existingEvent.paymentId }
    }

    const webhookEvent = await WebhookEvent.create({
      provider,
      eventType,
      externalEventId: resolvedEventId,
      rawPayload: payload,
      status: "PROCESSING",
    })

    let paymentUpdate = {}

    switch (provider) {
      case "STRIPE":
        paymentUpdate = await processStripeEvent(payload, eventType)
        break
      case "CHAPA":
        paymentUpdate = await processChapaEvent(payload, eventType)
        break
      case "FLUTTERWAVE":
        paymentUpdate = await processFlutterwaveEvent(payload, eventType)
        break
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }

    const resolvedPaymentId = await resolvePaymentId(paymentUpdate)
    if (resolvedPaymentId) {
      const updated = await Payment.findByIdAndUpdate(
        resolvedPaymentId,
        {
          status: paymentUpdate.status,
          externalTransactionId: paymentUpdate.transactionId,
        },
        { new: true },
      )

      await webhookEvent.updateOne({
        status: "PROCESSED",
        paymentId: resolvedPaymentId,
        processedData: paymentUpdate,
        processedAt: new Date(),
      })

      return { success: true, payment: updated }
    }

    await webhookEvent.updateOne({
      status: "FAILED",
      processingError: "Unable to resolve payment for webhook",
      processedAt: new Date(),
    })
    return { success: false, error: "Payment not resolved" }
  } catch (err) {
    console.error("[v0] Webhook processing error:", err)
    await WebhookEvent.updateOne(
      { externalEventId: resolveEventId(eventId, payload) },
      { status: "FAILED", processingError: err.message },
    )
    return { success: false, error: err.message }
  }
}

function resolveEventId(eventId, payload) {
  const candidate = eventId || payload?.id || payload?.transaction_id || payload?.data?.id
  if (candidate) {
    return String(candidate)
  }

  const body = typeof payload === "string" ? payload : JSON.stringify(payload || {})
  return crypto.createHash("sha256").update(body).digest("hex")
}

async function resolvePaymentId(paymentUpdate) {
  const directId = paymentUpdate?.paymentId
  if (directId && mongoose.Types.ObjectId.isValid(directId)) {
    return directId
  }

  const txId = paymentUpdate?.transactionId
  if (!txId) {
    return null
  }

  const payment = await Payment.findOne({ externalTransactionId: txId })
  return payment?._id || null
}

async function processStripeEvent(payload, eventType) {
  const data = payload.data.object

  if (eventType === "payment_intent.succeeded") {
    return {
      status: "VERIFIED",
      paymentId: data.metadata?.paymentId,
      amountEtb: data.amount / 100,
      transactionId: data.id,
    }
  }

  if (eventType === "payment_intent.payment_failed") {
    return {
      status: "FAILED",
      paymentId: data.metadata?.paymentId,
      transactionId: data.id,
    }
  }

  return {}
}

async function processChapaEvent(payload, eventType) {
  if (payload.status === "success") {
    return {
      status: "VERIFIED",
      paymentId: payload.customizations?.merchant_id || payload.meta?.paymentId,
      amountEtb: payload.charge,
      transactionId: payload.reference,
    }
  }

  return {}
}

async function processFlutterwaveEvent(payload, eventType) {
  if (payload.event === "charge.completed") {
    return {
      status: "VERIFIED",
      paymentId: payload.data?.metadata?.paymentId,
      amountEtb: payload.data.amount,
      transactionId: payload.data.id,
    }
  }

  return {}
}
