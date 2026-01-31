const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("Token received:", token.substring(0, 10) + "..."); // Debug
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log("Decoded ID:", decoded.id); // Debug

            req.user = await prisma.admin.findUnique({
                where: { id: decoded.id }
            });

            // BigInt handling if generic findUnique returns BigInt
            // But Prisma Client Runtime fixes usually handle this in query results
            // Just ensuring we have the user

            if (!req.user) {
                return res.status(401).json({ error: 'Not authorized, admin not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

const protectClient = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = await prisma.user.findUnique({
                where: { id: decoded.id }
            });

            if (!req.user) {
                return res.status(401).json({ error: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

module.exports = { protectAdmin, protectClient };
