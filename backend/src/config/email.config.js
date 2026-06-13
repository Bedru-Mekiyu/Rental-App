// Email Configuration with environment variable support
// Supports: Gmail, SendGrid, AWS SES, and SMTP providers

import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses"
import nodemailer from "nodemailer"

let transporter

export async function initializeEmailService() {
  try {
    // Support multiple email providers
    const provider = process.env.EMAIL_PROVIDER || "smtp" // gmail, sendgrid, ses, smtp

    if (provider === "gmail") {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, // Use app-specific password
        },
      })
    } else if (provider === "sendgrid") {
      transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      })
    } else if (provider === "ses") {
      const sesClient = new SESClient({
        region: process.env.AWS_REGION || "us-east-1",
      })
      transporter = nodemailer.createTransport({
        SES: {
          ses: sesClient,
          aws: { SendRawEmailCommand },
        },
      })
    } else {
      // Generic SMTP
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    }

    // Verify connection
    await transporter.verify()
    console.log("[Email Service] Connected successfully")
    return transporter
  } catch (err) {
    console.error("[Email Service] Initialization failed:", err.message)
    throw err
  }
}

export function getTransporter() {
  if (!transporter) {
    throw new Error("Email service not initialized. Call initializeEmailService() first.")
  }
  return transporter
}
