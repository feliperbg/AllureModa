const express = require('express');
const router = express.Router();
const { getAdminStatsController: getStats, listUsersController: listUsers, listOrdersController: listOrders } = require('../controller/adminController');
const { protectRoute, isAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', protectRoute, isAdmin, getStats);
router.get('/users', protectRoute, isAdmin, listUsers);
router.get('/orders', protectRoute, isAdmin, listOrders);

module.exports = router;
