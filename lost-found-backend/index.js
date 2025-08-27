const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const lostItemsRoutes = require('./routes/lostItemsRoutes');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

// Security & logs
app.use(helmet());
app.use(morgan('dev'));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS (tighten as needed via .env CORS_ORIGIN="http://localhost:5173,http://localhost:3000")
const allowed = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
app.use(cors({ origin: allowed }));

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Serve uploaded images
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/lost-items', lostItemsRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
