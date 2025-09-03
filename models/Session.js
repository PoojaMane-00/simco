const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  session_token: { type: String, unique: true },
  created_at: { type: Date, default: Date.now },
  expires_at: Date,
  status: { type: String, enum: ['active', 'logged_out'], default: 'active' }
});

module.exports = mongoose.model('Session', sessionSchema);
