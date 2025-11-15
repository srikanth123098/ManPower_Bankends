// routes/docRoutes.js
const express = require('express');
const router = express.Router();
const docCtrl = require('../controllers/docController');

router.post('/upload', docCtrl.upload);             // form-data: file (PDF), title, description
router.get('/', docCtrl.list);
router.get('/file/:filename', docCtrl.download);

module.exports = router;
