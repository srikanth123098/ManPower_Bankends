// models/Voucher.js
const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  code: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false }
});

// prevent duplicate same email+code easily at DB level too
VoucherSchema.index({ userEmail: 1, code: 1 }, { unique: false });

module.exports = mongoose.model('Voucher', VoucherSchema);
