const express = require('express');
const { login, createSubAdmin, getStats, changePassword, getAllAdmins } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', login);
router.post('/create', protectAdmin, createSubAdmin);
router.get('/stats', protectAdmin, getStats);
router.get('/all', protectAdmin, getAllAdmins);
router.patch('/change-password', protectAdmin, changePassword);

module.exports = router;
