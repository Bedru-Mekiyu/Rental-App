import { verifyWebhookSignature, processWebhookEvent } from "../services/webhookService.js"

export async function handleStripeWebhook(req, res) {
  try {
    const signature = req.headers["stripe-signature"]
    const payload = req.rawBody
    const isValid = await verifyWebhookSignature("STRIPE", payload, signature, process.env.STRIPE_WEBHOOK_SECRET)

    if (!isValid) {
      return res.status(401).json({ message: "Invalid signature" })
    }

    const event = JSON.parse(payload)
    const result = await processWebhookEvent("STRIPE", event.type, event)

    res.json({ status: 200, success: true, ...result })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function handleChapaWebhook(req, res) {
  try {
    const signature = req.headers["x-chapa-signature"]
    const payload = req.rawBody || req.body

    const isValid = await verifyWebhookSignature("CHAPA", payload, signature, process.env.CHAPA_WEBHOOK_SECRET)

    if (!isValid) {
      return res.status(401).json({ message: "Invalid signature" })
    }

    const result = await processWebhookEvent("CHAPA", "payment.completed", payload)
    res.json({ status: 200, success: true, ...result })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function handleFlutterwaveWebhook(req, res) {
  try {
    const signature = req.headers["verifi-hash"]
    const payload = req.rawBody || req.body

    const isValid = await verifyWebhookSignature(
      "FLUTTERWAVE",
      payload,
      signature,
      process.env.FLUTTERWAVE_WEBHOOK_SECRET,
    )

    if (!isValid) {
      return res.status(401).json({ message: "Invalid signature" })
    }

    const result = await processWebhookEvent("FLUTTERWAVE", payload.event, payload)
    res.json({ status: 200, success: true, ...result })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}
