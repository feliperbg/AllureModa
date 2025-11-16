const express = require('express');
const router = express.Router();
const { 
  getAllProductsController: getAllProducts, 
  getProductByIdController: getProductById, 
  getProductBySlugController: getProductBySlug,
  createProductController: createProduct,
  updateProductController: updateProduct,
  deleteProductController: deleteProduct
} = require('../controller/productController');
const { protectRoute, isAdmin } = require('../middleware/authMiddleware');

// --- ROTAS PÚBLICAS ---

// @route   GET /api/products
// @desc    Lista todos os produtos (visão geral)
// @access  Público
router.get('/', getAllProducts);
router.get('/featured', getAllProducts); // fallback if controller not wired
// Featured endpoint using controller
const { getFeaturedProductsController } = require('../controller/productController');
router.get('/featured', getFeaturedProductsController);

// @route   GET /api/products/slug/:slug
// @desc    Busca um produto pelo seu slug (URL amigável)
// @access  Público
router.get('/slug/:slug', getProductBySlug);

// @route   GET /api/products/:id
// @desc    Busca um produto pelo seu ID
// @access  Público
router.get('/:id', getProductById);


// --- ROTAS PROTEGIDAS (ADMIN) ---

// @route   POST /api/products
// @desc    Cria um novo produto
// @access  Privado (Admin)
router.post('/', protectRoute, isAdmin, createProduct);

// @route   PUT /api/products/:id
// @desc    Atualiza um produto
// @access  Privado (Admin)
router.put('/:id', protectRoute, isAdmin, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Deleta um produto
// @access  Privado (Admin)
router.delete('/:id', protectRoute, isAdmin, deleteProduct);

module.exports = router;
