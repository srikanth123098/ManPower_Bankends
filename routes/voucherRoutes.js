// routes/voucherRoutes.js
const express = require('express');
const router = express.Router();
const voucherCtrl = require('../controllers/voucherController');

router.post('/submit', voucherCtrl.submit);          // body: { email, code }
router.get('/status/:email', voucherCtrl.status);

module.exports = router;
