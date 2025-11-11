
const express = require('express');
const router = express.Router();
const { 
  createAddressController: createAddress, 
  findAllAddressesByUserIdController: findAllAddressesByUserId, 
  updateAddressController: updateAddress, 
  deleteAddressController: deleteAddress 
} = require('../controller/addressController');
const { protectRoute } = require('../middleware/authMiddleware');

// @route   POST /api/addresses
// @desc    Create a new address
// @access  Private
router.post('/', protectRoute, createAddress);

// @route   GET /api/addresses
// @desc    Get all addresses for the authenticated user
// @access  Private
router.get('/', protectRoute, findAllAddressesByUserId);

// @route   PUT /api/addresses/:id
// @desc    Update an address
// @access  Private
router.put('/:id', protectRoute, updateAddress);

// @route   DELETE /api/addresses/:id
// @desc    Delete an address
// @access  Private
router.delete('/:id', protectRoute, deleteAddress);

module.exports = router;
