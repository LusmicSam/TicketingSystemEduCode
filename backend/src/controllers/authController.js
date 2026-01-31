const nodemailer = require('nodemailer');
const { GMAIL_USER, GMAIL_APP_PASSWORD } = require('../config/env');

const otpStore = new Map(); // Simple in-memory store for now

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
});


const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, code);
    console.log(`[DEBUG] OTP for ${email}: ${code}`); // Backup for dev

    try {
        await transporter.sendMail({
            from: `"TheEduCode Support" <${GMAIL_USER}>`,
            to: email,
            subject: 'Your TheEduCode Login Verification',
            text: `Your TheEduCode verification code is: ${code}. Valid for 5 minutes.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>TheEduCode Verification</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color: #4f46e5; letter-spacing: 5px;">${code}</h1>
                    <p>Valid for 5 minutes.</p>
                </div>
            `
        });
        console.log(`[DEV] OTP sent to ${email}`);
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        // console.error('Email Error Details:', JSON.stringify(error, null, 2));
        // console.error('Email Error Message:', error.message);
        // console.error('Email Error Stack:', error.stack);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

const verifyOtp = async (req, res) => {
    const { email, code } = req.body;
    const storedCode = otpStore.get(email);

    if (storedCode && storedCode === code) {
        otpStore.delete(email); // One-time use

        try {
            // Find or Create User
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.user.create({ data: { email } });
            }
            else {
                // Update last login
                await prisma.user.update({
                    where: { email },
                    data: { lastLoginAt: new Date() }
                });
            }

            // Convert BigInt for JSON
            const userJson = JSON.parse(JSON.stringify(user, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));

            // Generate Client Short-lived Token (2 hours)
            const token = jwt.sign({ id: userJson.id, email: userJson.email, role: 'client' }, JWT_SECRET, { expiresIn: '30d' });

            res.json({ message: 'Login successful', user: userJson, token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Database error during login" });
        }
    } else {
        res.status(400).json({ error: 'Invalid or Expired OTP' });
    }
};

module.exports = { sendOtp, verifyOtp };
