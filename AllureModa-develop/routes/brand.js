
const express = require('express');
const router = express.Router();
const { 
  createBrandController: createBrand, 
  findAllBrandsController: findAllBrands, 
  findBrandByIdController: findBrandById 
} = require('../controller/brandController');
const { protectRoute, isAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/brands
// @desc    Create a new brand
// @access  Private (Admin)
router.post('/', protectRoute, isAdmin, createBrand);

// @route   GET /api/brands
// @desc    Get all brands
// @access  Public
router.get('/', findAllBrands);

// @route   GET /api/brands/:id
// @desc    Get a brand by ID
// @access  Public
router.get('/:id', findBrandById);

module.exports = router;
