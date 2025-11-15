// controllers/docController.js
const path = require('path');
const fs = require('fs');
const Doc = require('../models/Doc');

const UPLOAD_DIR = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(__dirname, '..', 'uploads');

function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

exports.upload = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file uploaded. Use "file" form-data key.' });
    }

    const file = req.files.file;

    // allow only PDFs (both mimetype and extension)
    const allowed = ['application/pdf'];
    const ext = path.extname(file.name || '').toLowerCase();
    if (!allowed.includes(file.mimetype) || ext !== '.pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed.' });
    }

    // sanitize and create filename
    const safe = safeFilename(file.name);
    const filename = `${Date.now()}-${safe}`;
    const full = path.join(UPLOAD_DIR, filename);

    // move the file to upload dir
    await file.mv(full);

    const title = req.body.title || file.name || 'Document';
    const description = req.body.description || '';

    const doc = new Doc({
      title,
      filename,
      originalname: file.name,
      description
    });

    await doc.save();

    res.json({ message: 'Uploaded', doc });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
};

exports.list = async (req, res) => {
  try {
    const docs = await Doc.find().sort({ uploadDate: -1 });
    res.json({ docs });
  } catch (err) {
    console.error('Docs fetch error', err);
    res.status(500).json({ message: 'Failed to fetch docs' });
  }
};

exports.download = (req, res) => {
  try {
    const filename = req.params.filename;
    const full = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(full)) return res.status(404).json({ message: 'File not found' });
    res.download(full, filename, (err) => { if (err) console.error('Download error', err); });
  } catch (err) {
    console.error('Download error', err);
    res.status(500).json({ message: 'Failed to download file' });
  }
};
