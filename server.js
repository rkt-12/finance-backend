require('dotenv').config();
const express = require('express');
const { runMigrations }  = require('./db/migrations');
const { errorHandler }   = require('./src/middleware/errorHandler');
const authRoutes         = require('./src/routes/auth');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

runMigrations();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));