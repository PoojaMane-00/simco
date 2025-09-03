const mongoose = require('mongoose');

const mailLogSchema = new mongoose.Schema({
  service_sheet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceSheet' },
  recipient_email: String,
  subject: String,
  message: String,
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  error_message: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MailLog', mailLogSchema);
