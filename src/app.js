// src/app.js
const express = require('express');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const recordRoutes = require('./routes/records');
const dashboardRoutes = require('./routes/dashboard');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(express.json());
app.use(generalLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

app.use(errorHandler);

module.exports = app;