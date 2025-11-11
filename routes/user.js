
const express = require('express');
const router = express.Router();
const { findUserByIdController: findUserById } = require('../controller/userController');
const { protectRoute } = require('../middleware/authMiddleware');

// @route   GET /api/users/me
// @desc    Get the currently authenticated user's information
// @access  Private
router.get('/me', protectRoute, findUserById);

module.exports = router;
