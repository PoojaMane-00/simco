const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true },
  mobile: Number,
  password: { type: String, required: true },
  reset_hash: String,
  reset_at: Date,
  reset_expires: Date,
  activate_hash: String,
  status: String,
  status_message: String,
  active: { type: Boolean, default: true },
  force_pass_reset: { type: Boolean, default: false },
  created_at: Date,
  updated_at: Date,
  deleted_at: Date
});

module.exports = mongoose.model('User', userSchema);
