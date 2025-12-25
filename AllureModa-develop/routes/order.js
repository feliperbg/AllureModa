
const express = require('express');
const router = express.Router();
const { 
  createOrderController: createOrder, 
  findAllOrdersController: findAllOrders, 
  findOrderByIdController: findOrderById 
} = require('../controller/orderController');
const { protectRoute } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protectRoute, createOrder);

// @route   GET /api/orders
// @desc    Get all orders for the authenticated user
// @access  Private
router.get('/', protectRoute, findAllOrders);

// @route   GET /api/orders/:id
// @desc    Get an order by ID
// @access  Private
router.get('/:id', protectRoute, findOrderById);

module.exports = router;
