const mongoose = require('mongoose');

const DocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true }, // saved file on disk
  originalname: { type: String },
  uploadDate: { type: Date, default: Date.now },
  description: { type: String, default: '' }
});

module.exports = mongoose.model('Doc', DocSchema);
