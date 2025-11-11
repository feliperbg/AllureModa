
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controller/authController');
const { protectRoute } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Registra um novo usuário
// @access  Público
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Autentica um usuário e retorna um token
// @access  Público
router.post('/login', login);

// @route   POST /api/auth/logout
// @desc    Faz logout do usuário (limpa o cookie)
// @access  Público (ou Privado, dependendo da lógica)
router.post('/logout', logout);

// @route   GET /api/auth/me
// @desc    Retorna os dados do usuário autenticado
// @access  Privado
router.get('/me', protectRoute, getMe);


module.exports = router;
