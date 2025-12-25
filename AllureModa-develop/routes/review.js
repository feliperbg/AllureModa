
const express = require('express');
const router = express.Router();
const { 
  createReviewController: createReview, 
  findAllReviewsByProductIdController: findAllReviewsByProductId 
} = require('../controller/reviewController');
const { protectRoute } = require('../middleware/authMiddleware');

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protectRoute, createReview);

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get('/product/:productId', findAllReviewsByProductId);

module.exports = router;
