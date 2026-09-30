const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const { CLIENT_URL } = require('./config/env');

// Import routes
const authRoutes = require('./routes/authRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const tripRoutes = require('./routes/tripRoutes');
const foodRoutes = require('./routes/foodRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration — allows localhost (dev), CLIENT_URL env, and any *.vercel.app deploy
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any *.vercel.app preview/production deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow explicit allowed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));


// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Wanderlust India Travel & Tourism API v1.0',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/assistant', assistantRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/vendor', vendorRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
