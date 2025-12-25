
const express = require('express');
const router = express.Router();
const { 
  createCategoryController: createCategory, 
  findAllCategoriesController: findAllCategories, 
  findCategoryByIdController: findCategoryById 
} = require('../controller/categoryController');
const { protectRoute, isAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin)
router.post('/', protectRoute, isAdmin, createCategory);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', findAllCategories);

// @route   GET /api/categories/:id
// @desc    Get a category by ID
// @access  Public
router.get('/:id', findCategoryById);

module.exports = router;
