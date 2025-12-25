
const express = require('express');
const router = express.Router();
const { 
  createWishlistItemController: createWishlistItem, 
  findAllWishlistItemsByUserIdController: findAllWishlistItemsByUserId, 
  deleteWishlistItemController: deleteWishlistItem 
} = require('../controller/wishlistController');
const { protectRoute } = require('../middleware/authMiddleware');

// @route   POST /api/wishlist
// @desc    Add an item to the wishlist
// @access  Private
router.post('/', protectRoute, createWishlistItem);

// @route   GET /api/wishlist
// @desc    Get all items in the wishlist for the authenticated user
// @access  Private
router.get('/', protectRoute, findAllWishlistItemsByUserId);

// @route   DELETE /api/wishlist/:id
// @desc    Delete an item from the wishlist
// @access  Private
router.delete('/:id', protectRoute, deleteWishlistItem);

module.exports = router;
