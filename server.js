'use strict';
require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// routers
const authRoutes = require('./routes/authRoutes');
const docRoutes = require('./routes/docRoutes');
const voucherRoutes = require('./routes/voucherRoutes');

// config
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;
const UPLOAD_DIR = process.env.UPLOAD_DIR 
  ? path.resolve(process.env.UPLOAD_DIR) 
  : path.join(__dirname, 'uploads');

if (!MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI not set in .env');
  process.exit(1);
}

// ensure upload dir exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// file upload middleware
app.use(fileUpload({
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// serve uploads (download)
app.use('/uploads', express.static(UPLOAD_DIR));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/voucher', voucherRoutes);

// health endpoint
app.get('/health', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = { 
    0: 'disconnected', 
    1: 'connected', 
    2: 'connecting', 
    3: 'disconnecting' 
  };
  res.json({ 
    status: states[state] || 'unknown', 
    readyState: state,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ManPower E-Learning API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    message: err?.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// start after DB connect
(async function start() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { 
      dbName: 'manpower',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`📁 Uploads dir: ${UPLOAD_DIR}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB - exiting', err);
    process.exit(1);
  }
})();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, closing server gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
