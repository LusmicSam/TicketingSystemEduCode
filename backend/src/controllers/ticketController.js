const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createTicket = async (req, res) => {
    const { category, description, email, whatsappNumber } = req.body;

    if (!email || !whatsappNumber) {
        return res.status(400).json({ error: "Email and WhatsApp Number are required" });
    }

    try {
        // Ghost User Logic: Find or Create
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({ data: { email, whatsappNumber } });
        } else {
            // Always update WhatsApp if user exists
            await prisma.user.update({
                where: { email },
                data: { whatsappNumber }
            });
        }

        /* 
        // Auto-Assignment Logic: Find least loaded admin for this category
        // 1. Find admins with matching specialization OR 'General'
        const candidateAdmins = await prisma.admin.findMany({
            where: {
                OR: [
                    { specialization: category },
                    { specialization: 'General' }
                ]
            },
            include: {
                _count: {
                    select: { resolvedTickets: { where: { status: 'In Progress' } } }
                }
            }
        });

        // 2. Sort by current load (In Progress tickets)
        let selectedAdminId = null;

        if (candidateAdmins.length > 0) {
            candidateAdmins.sort((a, b) => a._count.resolvedTickets - b._count.resolvedTickets);
            selectedAdminId = candidateAdmins[0].id;
        }
        */


        // Random Assignment Logic:
        // Exclude 'super-admin'
        const allAdmins = await prisma.admin.findMany({
            where: {
                role: { not: 'super-admin' }
            },
            select: { id: true }
        });
        let randomAdminId = null;
        if (allAdmins.length > 0) {
            const randomIndex = Math.floor(Math.random() * allAdmins.length);
            randomAdminId = allAdmins[randomIndex].id;
        }

        const ticket = await prisma.ticket.create({
            data: {
                userId: user.id,
                category,
                description,
                status: 'Open',
                resolvedById: null,
                forwardedById: null,
                pendingTransferToId: randomAdminId
            }
        });

        const ticketJson = JSON.parse(JSON.stringify(ticket, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        res.json(ticketJson);
    } catch (error) {
        console.error("Create Ticket Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

const getTickets = async (req, res) => {
    console.log("🎫 getTickets called");
    console.log("User:", req.user);
    console.log("Query:", req.query);

    try {
        const { page = 1, limit = 10, status = 'All', search = '', sortBy = 'newest' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Build Where Clause
        const where = {};
        if (status !== 'All') {
            where.status = status;
        }
        if (search) {
            where.user = {
                email: { contains: search, mode: 'insensitive' }
            };
        }
        // My Tickets Filter
        const { assignedToMe, pendingForMe } = req.query;
        if (assignedToMe === 'true') {
            where.resolvedById = BigInt(req.user.id);
        }
        // Inbox / Randomly Assigned Filter
        if (pendingForMe === 'true') {
            where.pendingTransferToId = BigInt(req.user.id);
            // We typically want to show only 'Open' tickets here, but status filter might override. 
            // Usually pending acceptance tickets are Open or In Progress (if transferred from another).
            // But for Fresh tickets, they are Open.
        }

        // Build Order By
        const orderBy = { createdAt: sortBy === 'oldest' ? 'asc' : 'desc' };

        // Fetch Data
        const [tickets, total] = await prisma.$transaction([
            prisma.ticket.findMany({
                where,
                include: { user: true, resolvedBy: { select: { name: true } }, pendingTransferTo: { select: { name: true } } },
                orderBy,
                skip,
                take
            }),
            prisma.ticket.count({ where })
        ]);

        const ticketsJson = JSON.parse(JSON.stringify(tickets, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({
            tickets: ticketsJson,
            total,
            pages: Math.ceil(total / take),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTicketHistory = async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        const tickets = await prisma.ticket.findMany({
            where: { user: { email } },
            orderBy: { createdAt: 'desc' }
        });

        const ticketsJson = JSON.parse(JSON.stringify(tickets, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(ticketsJson);
    } catch (error) {
        res.status(500).json({ error: "Error fetching history" });
    }
};

const resolveTicket = async (req, res) => {
    const { id } = req.params;
    console.log(`[DEBUG] Attempting to resolve ticket ${id}`);
    const { status, adminRemark } = req.body;
    const adminId = req.user.id;

    try {
        const ticket = await prisma.ticket.update({
            where: { id },
            data: {
                status,
                adminRemark,
                resolvedById: adminId,
                resolvedAt: new Date()
            }
        });

        // Increment Admin Stat
        await prisma.admin.update({
            where: { id: adminId },
            data: { queriesResolved: { increment: 1 } }
        });

        // Convert BigInt
        const ticketJson = JSON.parse(JSON.stringify(ticket, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(ticketJson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to resolve ticket" });
    }
};

const submitFeedback = async (req, res) => {
    const { id } = req.params;
    console.log(`[DEBUG] Feedback received for ticket ${id}`, req.body);
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
        const ticket = await prisma.ticket.update({
            where: { id },
            data: {
                userRating: rating,
                userFeedback: feedback
            }
        });

        // Update Admin Average Rating
        if (ticket.resolvedById) {
            const aggregations = await prisma.ticket.aggregate({
                _avg: { userRating: true },
                where: {
                    resolvedById: ticket.resolvedById,
                    userRating: { not: null }
                }
            });

            const newAvg = aggregations._avg.userRating || 0;

            await prisma.admin.update({
                where: { id: ticket.resolvedById },
                data: { averageRating: newAvg }
            });
        }

        // Convert BigInt
        const ticketJson = JSON.parse(JSON.stringify(ticket, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(ticketJson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit feedback" });
    }
};

const lockTicket = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id } });

        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status !== 'Open') return res.status(400).json({ error: "Ticket is already locked or resolved" });

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                status: 'In Progress',
                resolvedById: adminId
            },
            include: { user: true, resolvedBy: { select: { name: true } } }
        });

        // Convert BigInt
        const ticketJson = JSON.parse(JSON.stringify(updatedTicket, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(ticketJson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to lock ticket" });
    }
};

const initiateTransfer = async (req, res) => {
    const { id } = req.params;
    const { targetAdminId } = req.body;
    const currentAdminId = req.user.id;

    if (!targetAdminId) return res.status(400).json({ error: "Target Admin ID required" });

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        if (ticket.resolvedById !== BigInt(currentAdminId) && req.user.role !== 'super-admin') {
            return res.status(403).json({ error: "You can only transfer tickets you hold." });
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                pendingTransferToId: targetAdminId
            },
            include: { user: true, resolvedBy: true, forwardedBy: true, pendingTransferTo: true }
        });

        const ticketJson = JSON.parse(JSON.stringify(updatedTicket, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        res.json(ticketJson);
    } catch (error) {
        res.status(500).json({ error: "Transfer initiation failed" });
    }
};

const acceptTransfer = async (req, res) => {
    const { id } = req.params;
    const currentAdminId = req.user.id;

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        if (ticket.pendingTransferToId !== BigInt(currentAdminId)) {
            return res.status(403).json({ error: "This transfer is not meant for you." });
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                resolvedById: currentAdminId,
                forwardedById: ticket.resolvedById, // Old owner is now forwarder
                pendingTransferToId: null,
                status: 'In Progress'
            },
            include: { user: true, resolvedBy: true, forwardedBy: true }
        });

        const ticketJson = JSON.parse(JSON.stringify(updatedTicket, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        res.json(ticketJson);
    } catch (error) {
        res.status(500).json({ error: "Failed to accept transfer" });
    }
};

const rejectTransfer = async (req, res) => {
    const { id } = req.params;
    const currentAdminId = req.user.id;

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        if (ticket.pendingTransferToId !== BigInt(currentAdminId)) {
            return res.status(403).json({ error: "This transfer is not meant for you." });
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                pendingTransferToId: null
            },
            include: { user: true, resolvedBy: true, forwardedBy: true }
        });

        const ticketJson = JSON.parse(JSON.stringify(updatedTicket, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        res.json(ticketJson);
    } catch (error) {
        res.status(500).json({ error: "Failed to reject transfer" });
    }
};

module.exports = { createTicket, getTickets, getTicketHistory, resolveTicket, submitFeedback, lockTicket, initiateTransfer, acceptTransfer, rejectTransfer };
