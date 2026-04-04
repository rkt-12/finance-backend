require('dotenv').config();
const express = require('express');
const { runMigrations }  = require('./db/migrations');
const { errorHandler } = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const recordRoutes = require('./src/routes/records');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

runMigrations();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));