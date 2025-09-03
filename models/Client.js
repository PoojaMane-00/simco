const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  client_name: String,
  company_name: String,
  email_address: String,
  mobile: String,
  address: String,
  description: String,
  isactive: { type: String, enum: ['0', '1'], default: '1' }
});

module.exports = mongoose.model('Client', clientSchema);
