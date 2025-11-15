// controllers/voucherController.js
const Voucher = require('../models/Voucher');

const FIXED_VOUCHER = process.env.FIXED_VOUCHER || 'MPGCA2025VCH';

function computeStatusFromDate(submittedAt) {
  if (!submittedAt) return 'Not submitted';
  const now = new Date();
  const diffDays = (now - new Date(submittedAt)) / (1000 * 60 * 60 * 24);
  if (diffDays >= 3) return 'Verified';
  if (diffDays >= 2) return 'Pending';
  return 'Submitted';
}

exports.submit = async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ message: 'Missing email or code' });

    // 1) validate voucher code first (do NOT save invalid codes)
    if (code !== FIXED_VOUCHER) {
      return res.status(400).json({ message: 'Voucher code is not valid' });
    }

    // 2) check duplicate for same user + code
    const exists = await Voucher.findOne({ userEmail: email, code }).sort({ submittedAt: -1 });
    if (exists) {
      return res.status(409).json({ message: 'Voucher already submitted for this user' });
    }

    // 3) save as not verified yet (teacher/automation may change verified later)
    const v = new Voucher({ userEmail: email, code, submittedAt: new Date(), verified: false });
    await v.save();

    res.json({ message: 'Voucher accepted and submitted for verification', submittedAt: v.submittedAt, id: v._id });
  } catch (err) {
    console.error('Voucher submit error:', err);
    res.status(500).json({ message: 'Failed to submit voucher' });
  }
};

exports.status = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: 'Missing email param' });

    const record = await Voucher.findOne({ userEmail: email }).sort({ submittedAt: -1 });
    if (!record) return res.json({ status: 'Not submitted' });

    const status = computeStatusFromDate(record.submittedAt);

    res.json({
      submittedAt: record.submittedAt,
      code: record.code,
      status,
      course: { name: 'Content Analyst Program', duration: '3 months', voucherWorth: '60K' }
    });
  } catch (err) {
    console.error('Voucher status error', err);
    res.status(500).json({ message: 'Failed to fetch voucher status' });
  }
};
    