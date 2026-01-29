const express = require('express');
const { login, createSubAdmin, getStats, changePassword, getAllAdmins } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', login);
router.post('/create', protectAdmin, createSubAdmin);
router.get('/stats', getStats); // Potentially protect this too? Stats are semi-public in Dashboard? 
// Dashboard fetches stats. If token is stored, we should protect it. 
// Existing Dashboard fetches stats with token? Let's check.
// Dashboard.jsx: fetchStats calls /api/admin/stats. It does NOT seem to pass headers in start (wait, previous code block showed it didn't).
// If I protect it, I might break it if frontend doesn't send token.
// Let's check Dashboard.jsx fetchStats again.
router.get('/all', protectAdmin, getAllAdmins);
router.patch('/change-password', protectAdmin, changePassword);

module.exports = router;
