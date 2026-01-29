const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const NodeCache = require('node-cache');
const statsCache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// Helper: Auto-seed super admin if none exists
const ensureSuperAdmin = async () => {
    const count = await prisma.admin.count();
    if (count === 0) {
        const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.admin.create({
            data: {
                email: 'admin@support.com',
                password: hashedPassword,
                name: 'Super Admin',
                role: 'super-admin',
                specialization: 'General'
            }
        });
        console.log('✅ Default Admin Created: admin@support.com');
        if (!process.env.SUPER_ADMIN_PASSWORD) {
            console.warn('⚠️  WARNING: Using default password "admin123". Please set SUPER_ADMIN_PASSWORD in .env');
        }
    }
};

const login = async (req, res) => {
    await ensureSuperAdmin(); // Ensure at least one admin exists

    const { email, password } = req.body;
    try {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) return res.status(401).json({ error: "Invalid credentials" });

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: Number(admin.id), role: admin.role }, JWT_SECRET, { expiresIn: '1d' });

        // Return admin info without sensitive data
        const { password: _, ...adminData } = admin;
        // Convert BigInt to string for JSON serialization
        const adminForJson = JSON.parse(JSON.stringify(adminData, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({ token, admin: adminForJson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.user.id;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Both old and new passwords are required" });
    }

    try {
        const admin = await prisma.admin.findUnique({ where: { id: adminId } });
        if (!admin) return res.status(404).json({ error: "Admin not found" });

        const isValid = await bcrypt.compare(oldPassword, admin.password);
        if (!isValid) return res.status(400).json({ error: "Incorrect current password" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.admin.update({
            where: { id: adminId },
            data: { password: hashedPassword }
        });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ error: "Failed to update password" });
    }
};

const createSubAdmin = async (req, res) => {
    // Security Check: Only Super Admin can create admins
    if (req.user?.role !== 'super-admin') {
        return res.status(403).json({ error: "Access Denied. Only Super Admin can perform this action." });
    }

    const { name, email, password, specialization } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'admin',
                specialization: specialization || 'General'
            }
        });
        res.json({ message: "Sub-admin created", id: newAdmin.id.toString() });
    } catch (error) {
        res.status(400).json({ error: "Failed to create admin (Email likely exists)" });
    }
};

const getStats = async (req, res) => {
    try {
        // Check Cache
        const cachedStats = statsCache.get("adminStats");
        if (cachedStats) {
            return res.json(cachedStats);
        }

        const admins = await prisma.admin.findMany({
            select: { id: true, name: true, queriesResolved: true, averageRating: true }
        });
        // Serialize BigInt
        const startData = JSON.parse(JSON.stringify(admins, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        // Set Cache
        statsCache.set("adminStats", startData);

        res.json(startData);
    } catch (error) {
        res.status(500).json({ error: "Error fetching stats" });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await prisma.admin.findMany({
            select: { id: true, name: true, email: true }
        });
        const adminsJson = JSON.parse(JSON.stringify(admins, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        res.json(adminsJson);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admins" });
    }
};

module.exports = { login, createSubAdmin, getStats, getAllAdmins, changePassword };
