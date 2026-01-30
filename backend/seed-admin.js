require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL
        }
    }
});

async function seedAdmin() {
    try {
        console.log('🔍 Checking for existing admin...');
        const existingAdmin = await prisma.admin.findUnique({
            where: { email: 'admin@support.com' }
        });

        if (existingAdmin) {
            console.log('✅ Admin already exists:', existingAdmin.email);
            return;
        }

        console.log('🔐 Hashing password...');
        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'SecurePass2026!', 10);

        console.log('👤 Creating super admin...');
        const admin = await prisma.admin.create({
            data: {
                email: 'admin@support.com',
                password: hashedPassword,
                name: 'Super Admin',
                role: 'super-admin',
                specialization: 'General'
            }
        });

        console.log('✅ Super Admin created successfully!');
        console.log('Email:', admin.email);
        console.log('Password:', process.env.SUPER_ADMIN_PASSWORD || 'SecurePass2026!');
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
