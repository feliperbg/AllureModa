const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, logout, getMe } = require('../controller/authController');
const { protectRoute } = require('../middleware/authMiddleware');

// Configuração do Rate Limiter para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limita cada IP a 10 requisições por janela
  message: { message: 'Muitas tentativas de login, por favor tente novamente mais tarde.' },
  standardHeaders: true, // Retorna info de limite nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
});

// @route   POST /api/auth/register
// @desc    Registra um novo usuário
// @access  Público
router.post('/register', authLimiter, register);

// @route   POST /api/auth/login
// @desc    Autentica um usuário e retorna um token
// @access  Público
router.post('/login', authLimiter, login);

// @route   POST /api/auth/logout
// @desc    Faz logout do usuário (limpa o cookie)
// @access  Público (ou Privado, dependendo da lógica)
router.post('/logout', logout);

// @route   GET /api/auth/me
// @desc    Retorna os dados do usuário autenticado
// @access  Privado
router.get('/me', protectRoute, getMe);


module.exports = router;
