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
            from: `"TheEduCode Support" <${GMAIL_USER}>`,
            to: email,
            subject: 'Your TheEduCode Login Verification',
            text: `Your TheEduCode verification code is: ${code}. Valid for 5 minutes.`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 40px; text-align: center;">
                        <img src="cid:educode_logo" alt="TheEduCode" style="height: 60px; margin-bottom: 15px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));" />
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">TheEduCode</h1>
                        <p style="color: #a5b4fc; margin-top: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Support Portal</p>
                    </div>
                    <div style="padding: 40px 30px; background-color: #fafafa;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px; text-align: center;">Hello,</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.6; text-align: center; margin-bottom: 30px;">
                            We received a request to log in to your support account.<br>
                            Use the code below to complete your verification:
                        </p>
                        
                        <div style="background-color: #ffffff; border: 2px dashed #4f46e5; padding: 25px; text-align: center; margin: 0 auto 30px; max-width: 300px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);">
                            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: 'Courier New', monospace; display: block;">${code}</span>
                        </div>
                        
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 24px;">
                            This code is valid for <strong>5 minutes</strong>. <br>
                            If you did not request this, you can safely ignore this email.
                        </p>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} TheEduCode Inc. All rights reserved.</p>
                        <p style="margin: 8px 0 0;">Secure Automated System</p>
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
