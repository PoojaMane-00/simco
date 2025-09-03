const mongoose = require('mongoose');
// mongoose.set('debug', true);

const issueSchema = new mongoose.Schema({
  error_code: { type: Number, required: true },
  description: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);
