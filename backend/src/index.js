const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PORT } = require('./config/env');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Singleton Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = global.prisma || new PrismaClient({
    log: ['error'],
});
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

const app = express();

app.use(helmet()); // Secure HTTP Headers
app.use(cors());
app.use(express.json());

// Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', globalLimiter); // Apply to all API routes

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Frictionless Support API Running' });
});

// Export for Vercel
module.exports = app;

// Only listen if running directly (not in Vercel) or if needed for local dev
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
