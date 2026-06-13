// Core Email Service with retry logic and error handling

import { getTransporter } from "../config/email.config.js"
import EmailLog from "../models/EmailLog.js"

const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds

const TEMPLATE_TYPES = new Set([
  "PAYMENT_VERIFICATION",
  "LEASE_EXPIRATION",
  "OVERDUE_PAYMENT",
  "PAYMENT_RECEIPT",
  "MAINTENANCE_ASSIGNED",
  "GENERIC",
])

function normalizeTemplateType(templateType) {
  const normalized = String(templateType || "GENERIC").toUpperCase()
  return TEMPLATE_TYPES.has(normalized) ? normalized : "GENERIC"
}

async function sendEmailWithRetry(mailOptions, retries = 0) {
  try {
    const transporter = getTransporter()
    const result = await transporter.sendMail(mailOptions)

    // Log successful email
    await EmailLog.create({
      recipient: mailOptions.to,
      subject: mailOptions.subject,
      templateType: normalizeTemplateType(mailOptions.templateType),
      status: "SENT",
      messageId: result.messageId,
    })

    return { success: true, messageId: result.messageId }
  } catch (err) {
    console.error(`[Email Service] Send failed (attempt ${retries + 1}):`, err.message)

    // Log failed email
    await EmailLog.create({
      recipient: mailOptions.to,
      subject: mailOptions.subject,
      templateType: normalizeTemplateType(mailOptions.templateType),
      status: "FAILED",
      error: err.message,
      retryCount: retries,
    })

    // Retry logic
    if (retries < MAX_RETRIES) {
      console.log(`[Email Service] Retrying in ${RETRY_DELAY / 1000}s...`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return sendEmailWithRetry(mailOptions, retries + 1)
    }

    throw err
  }
}

export async function sendEmail({ to, subject, html, template, data, from }) {
  const mailOptions = {
    from: from || process.env.EMAIL_FROM || "noreply@propertymanagement.com",
    to,
    subject,
    templateType: normalizeTemplateType(template),
    html:
      html ||
      `<p>Your code is <strong>${data?.code || ""}</strong></p><p>Expires at ${data?.expiresAt || ""}</p>`,
  }

  return sendEmailWithRetry(mailOptions)
}

export async function sendPaymentVerificationAlert(payment, pm) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@propertymanagement.com",
    to: pm.email,
    subject: `Payment Verification Required - ${payment.leaseId}`,
    templateType: "PAYMENT_VERIFICATION",
    html: `
      <h2>Payment Verification Required</h2>
      <p>A new payment has been submitted and requires your verification.</p>
      <ul>
        <li><strong>Lease ID:</strong> ${payment.leaseId}</li>
        <li><strong>Amount:</strong> ETB ${payment.amountEtb.toFixed(2)}</li>
        <li><strong>Method:</strong> ${payment.paymentMethod}</li>
        <li><strong>Status:</strong> ${payment.status}</li>
      </ul>
      <p><a href="${process.env.APP_URL}/payments/${payment._id}/verify">Review Payment</a></p>
    `,
  }

  return sendEmailWithRetry(mailOptions)
}

export async function sendLeaseExpirationWarning(lease, tenant, daysUntilExpiry) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@propertymanagement.com",
    to: tenant.email,
    subject: `Lease Expiration Notice - ${daysUntilExpiry} Days Remaining`,
    templateType: "LEASE_EXPIRATION",
    html: `
      <h2>Your Lease is Expiring Soon</h2>
      <p>Your lease will expire in <strong>${daysUntilExpiry} days</strong>.</p>
      <ul>
        <li><strong>Property:</strong> ${lease.unitId}</li>
        <li><strong>Expiration Date:</strong> ${new Date(lease.endDate).toLocaleDateString()}</li>
        <li><strong>Monthly Rent:</strong> ETB ${lease.monthlyRentEtb.toFixed(2)}</li>
      </ul>
      <p>Please contact your property manager to renew or discuss your options.</p>
    `,
  }

  return sendEmailWithRetry(mailOptions)
}

export async function sendOverduePaymentNotice(payment, tenant, daysOverdue) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@propertymanagement.com",
    to: tenant.email,
    subject: `Payment Overdue - ${daysOverdue} Days Late`,
    templateType: "OVERDUE_PAYMENT",
    html: `
      <h2>Payment Overdue Notice</h2>
      <p>Your payment is <strong>${daysOverdue} days overdue</strong>.</p>
      <ul>
        <li><strong>Amount Due:</strong> ETB ${payment.amountEtb.toFixed(2)}</li>
        <li><strong>Due Date:</strong> ${new Date(payment.dueDate).toLocaleDateString()}</li>
        <li><strong>Lease ID:</strong> ${payment.leaseId}</li>
      </ul>
      <p>Please make payment immediately to avoid further action.</p>
    `,
  }

  return sendEmailWithRetry(mailOptions)
}

export async function sendPaymentReceiptEmail(payment, tenant, receiptUrl) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@propertymanagement.com",
    to: tenant.email,
    subject: `Payment Receipt - ETB ${payment.amountEtb.toFixed(2)}`,
    templateType: "PAYMENT_RECEIPT",
    html: `
      <h2>Payment Receipt</h2>
      <p>Your payment has been verified and recorded.</p>
      <ul>
        <li><strong>Amount:</strong> ETB ${payment.amountEtb.toFixed(2)}</li>
        <li><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</li>
        <li><strong>Method:</strong> ${payment.paymentMethod}</li>
        <li><strong>Reference:</strong> ${payment.externalTransactionId || "N/A"}</li>
      </ul>
      <p><a href="${receiptUrl}">Download Receipt</a></p>
    `,
  }

  return sendEmailWithRetry(mailOptions)
}

export async function sendMaintenanceAssignedEmail(maintenance, pm) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@propertymanagement.com",
    to: pm.email,
    subject: `Maintenance Request Assigned - ${maintenance.unitId}`,
    templateType: "MAINTENANCE_ASSIGNED",
    html: `
      <h2>Maintenance Request Assigned</h2>
      <p>A maintenance request has been assigned to your property.</p>
      <ul>
        <li><strong>Unit:</strong> ${maintenance.unitId}</li>
        <li><strong>Issue Type:</strong> ${maintenance.issueType}</li>
        <li><strong>Priority:</strong> ${maintenance.priority}</li>
        <li><strong>Description:</strong> ${maintenance.description}</li>
      </ul>
      <p><a href="${process.env.APP_URL}/maintenance/${maintenance._id}">View Details</a></p>
    `,
  }

  return sendEmailWithRetry(mailOptions)
}
