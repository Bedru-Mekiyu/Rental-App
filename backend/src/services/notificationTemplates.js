export const SMS_TEMPLATES = {
  PAYMENT_DUE: (tenantName, amount, dueDate) =>
    `Hello ${tenantName}, your rent of ETB ${amount} is due on ${dueDate}. Please pay on time to avoid late fees.`,

  PAYMENT_OVERDUE: (tenantName, amount, daysOverdue) =>
    `Alert ${tenantName}! Your rent payment of ETB ${amount} is ${daysOverdue} days overdue. Please settle immediately.`,

  PAYMENT_RECEIVED: (tenantName, amount, receiptId) =>
    `Payment received! Thank you ${tenantName}. ETB ${amount} received. Receipt: ${receiptId}`,

  LEASE_EXPIRING_30DAYS: (tenantName, expiryDate) =>
    `Hello ${tenantName}, your lease expires on ${expiryDate}. Please contact your property manager for renewal.`,

  LEASE_EXPIRING_7DAYS: (tenantName, expiryDate) =>
    `Reminder: Your lease expires on ${expiryDate}. Contact property manager urgently for renewal or extension.`,

  MAINTENANCE_ASSIGNED: (tenantName, maintenanceType) =>
    `Hello ${tenantName}, a maintenance request for ${maintenanceType} has been assigned. Our team will contact you soon.`,

  MAINTENANCE_COMPLETED: (tenantName, maintenanceType) =>
    `Maintenance completed! ${maintenanceType} at your unit has been fixed. Please verify.`,

  PAYMENT_DISPUTE_OPEN: (tenantName, disputeId) =>
    `Your payment dispute (ID: ${disputeId}) has been received. We will review and respond within 48 hours.`,

  PAYMENT_DISPUTE_RESOLVED: (tenantName, resolution) =>
    `Your payment dispute has been resolved. Resolution: ${resolution}. Thank you for your patience.`,
}
