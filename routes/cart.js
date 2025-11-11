
const express = require('express');
const router = express.Router();
const { 
  createCartController: createCart, 
  findCartByUserIdController: findCartByUserId, 
  updateCartController: updateCart 
} = require('../controller/cartController');
const { protectRoute } = require('../middleware/authMiddleware');

// @route   POST /api/cart
// @desc    Create a new cart
// @access  Private
router.post('/', protectRoute, createCart);

// @route   GET /api/cart
// @desc    Get the cart for the authenticated user
// @access  Private
router.get('/', protectRoute, findCartByUserId);

// @route   PUT /api/cart
// @desc    Update the cart for the authenticated user
// @access  Private
router.put('/', protectRoute, updateCart);

module.exports = router;
