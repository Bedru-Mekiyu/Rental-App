import axios from "axios"

const REQUEST_TIMEOUT_MS = 10000

function buildSmsHeaders() {
  if (process.env.SMS_AUTH_HEADER) {
    return { Authorization: process.env.SMS_AUTH_HEADER }
  }

  return undefined
}

export async function sendSMS(phoneNumber, message) {
  try {
    const response = await axios.post(
      process.env.SMS_API_URL || "https://api.infobip.com/sms/2/text/advanced",
      {
        messages: [
          {
            destinations: [{ to: phoneNumber }],
            text: message,
            from: process.env.SMS_SENDER_ID || "PropertyMgmt",
          },
        ],
      },
      { timeout: REQUEST_TIMEOUT_MS, headers: buildSmsHeaders() },
    )

    return { success: true, messageId: response.data.messages[0].messageId }
  } catch (err) {
    console.error("[v0] SMS send error:", err)
    throw new Error(`SMS failed: ${err.message}`)
  }
}

export async function sendWhatsApp(phoneNumber, message, mediaUrl = null) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: mediaUrl ? "image" : "text",
    }

    if (mediaUrl) {
      payload.image = { link: mediaUrl }
    } else {
      payload.text = { body: message }
    }

    const response = await axios.post(`${process.env.WHATSAPP_API_URL}/messages`, payload, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: REQUEST_TIMEOUT_MS,
    })

    return { success: true, messageId: response.data.messages[0].id }
  } catch (err) {
    console.error("[v0] WhatsApp send error:", err)
    throw new Error(`WhatsApp failed: ${err.message}`)
  }
}

export async function sendBulkSMS(phoneNumbers, message) {
  try {
    const messages = phoneNumbers.map((phone) => ({
      destinations: [{ to: phone }],
      text: message,
      from: process.env.SMS_SENDER_ID || "PropertyMgmt",
    }))

    const response = await axios.post(
      process.env.SMS_API_URL,
      { messages },
      { timeout: REQUEST_TIMEOUT_MS, headers: buildSmsHeaders() },
    )

    return { success: true, count: response.data.messages.length }
  } catch (err) {
    throw new Error(`Bulk SMS failed: ${err.message}`)
  }
}
