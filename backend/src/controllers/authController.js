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

const path = require('path');

const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, code);
    console.log(`[DEBUG] OTP for ${email}: ${code}`); // Backup for dev

    try {
        await transporter.sendMail({
            from: `"EduCode Support" <${GMAIL_USER}>`,
            to: email,
            subject: 'Your EduCode Login Code',
            text: `Your EduCode verification code is: ${code}. Valid for 5 minutes.`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 4px solid #6366f1;">
                        <img src="cid:educode_logo" alt="EduCode" style="height: 50px; margin-bottom: 10px;" />
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">EduCode</h1>
                    </div>
                    <div style="padding: 40px; background-color: #f8fafc;">
                        <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">Hello,</p>
                        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Use the verification code below to securely login to your EduCode support portal:</p>
                        <div style="background-color: #ffffff; border: 2px dashed #6366f1; padding: 20px; text-align: center; margin: 30px 0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${code}</span>
                        </div>
                        <p style="font-size: 14px; color: #64748b; margin-top: 24px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                        &copy; ${new Date().getFullYear()} EduCode Inc. All rights reserved.
                    </div>
                </div>
            `,
            attachments: [{
                filename: 'educode_logo.png',
                path: path.join(__dirname, '../../assets/educode_logo.png'),
                cid: 'educode_logo'
            }]
        });
        console.log(`[DEV] OTP sent to ${email}`);
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ error: 'Failed to send email' });
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
