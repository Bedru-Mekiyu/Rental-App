import axios from "axios"

const REQUEST_TIMEOUT_MS = 10000

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`${name} is not configured`)
  }
}

export async function initiateChapaPayment(amount, reference, customerPhone, customerEmail) {
  try {
    requireEnv("CHAPA_API_URL")
    requireEnv("APP_URL")
    const response = await axios.post(process.env.CHAPA_API_URL, {
      amount: amount,
      currency: "ETB",
      email: customerEmail,
      first_name: customerPhone.substring(0, 10),
      phone_number: customerPhone,
      tx_ref: reference,
      callback_url: `${process.env.APP_URL}/api/webhooks/chapa`,
      return_url: `${process.env.APP_URL}/payments/success`,
      "customization[title]": "Property Rent Payment",
      "customization[description]": `Payment for lease reference ${reference}`,
    }, { timeout: REQUEST_TIMEOUT_MS })

    if (response.data.status === "success") {
      return {
        success: true,
        checkoutUrl: response.data.data.checkout_url,
        transactionId: response.data.data.tx_ref,
      }
    }

    throw new Error(response.data.message || "Payment initiation failed")
  } catch (err) {
    console.error("[v0] Chapa payment error:", err)
    throw new Error(`Chapa payment failed: ${err.message}`)
  }
}

export async function initiateTelebirrPayment(amount, reference, customerPhone) {
  try {
    requireEnv("TELEBIRR_API_URL")
    requireEnv("TELEBIRR_API_KEY")
    requireEnv("TELEBIRR_API_USER")
    requireEnv("APP_URL")
    const payload = {
      apikey: process.env.TELEBIRR_API_KEY,
      apiuser: process.env.TELEBIRR_API_USER,
      msisdn: customerPhone,
      amount: amount,
      denominationid: "1",
      description: `Rent payment ${reference}`,
      reference: reference,
      transactionid: reference,
      callbackurl: `${process.env.APP_URL}/api/webhooks/telebirr`,
      returnurl: `${process.env.APP_URL}/payments/success`,
    }

    const response = await axios.post(process.env.TELEBIRR_API_URL, payload, { timeout: REQUEST_TIMEOUT_MS })

    if (response.data.Status === "0") {
      return {
        success: true,
        transactionId: response.data.TransactionID,
        paymentUrl: response.data.PaymentUrl,
      }
    }

    throw new Error(response.data.Message || "Payment initiation failed")
  } catch (err) {
    console.error("[v0] Telebirr payment error:", err)
    throw new Error(`Telebirr payment failed: ${err.message}`)
  }
}

export async function initiateBellPayment(amount, reference, customerPhone) {
  try {
    requireEnv("BELL_API_URL")
    requireEnv("APP_URL")
    const response = await axios.post(process.env.BELL_API_URL, {
      phone: customerPhone,
      amount: amount,
      reference: reference,
      description: `Rent payment ${reference}`,
      callback: `${process.env.APP_URL}/api/webhooks/bell`,
    }, { timeout: REQUEST_TIMEOUT_MS })

    if (response.data.status === "success") {
      return {
        success: true,
        transactionId: response.data.transaction_id,
        paymentUrl: response.data.payment_url,
      }
    }

    throw new Error("Payment initiation failed")
  } catch (err) {
    console.error("[v0] Bell payment error:", err)
    throw new Error(`Bell payment failed: ${err.message}`)
  }
}
