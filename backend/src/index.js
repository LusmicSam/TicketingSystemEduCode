const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

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
