const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  mobile: { type: String },
  password: { type: String, required: true },
  reset_hash: { type: String },
  reset_at: { type: Date },
  reset_expires: { type: Date },
  activate_hash: { type: String },
  status: { type: String },
  status_message: { type: String },
  active: { type: Boolean, default: false },
  force_pass_reset: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  deleted_at: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
