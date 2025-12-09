const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true, // e.g. "AUTH_LOGIN_SUCCESS", "LEASE_CREATE", "PAYMENT_STATUS_UPDATE"
  },
  entityType: {
    type: String, // "USER", "LEASE", "PAYMENT", etc.
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: Object, // arbitrary JSON payload with extra info
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
