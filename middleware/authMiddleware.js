const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware para proteger rotas que exigem autenticação.
 * Verifica o token JWT nos cookies e anexa req.user.
 */
const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Não autorizado. Token não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: 'Não autorizado. Token inválido.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      res.clearCookie('jwt');
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      res.clearCookie('jwt');
      return res.status(401).json({ message: 'Token expirado.' });
    }

    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * Middleware para verificar se o usuário é admin.
 * Deve ser usado após protectRoute (req.user já preenchido).
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  // Corrigir para comparar com o enum Prisma (upper-case)
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Requer permissão de administrador.' });
  }

  next();
};

module.exports = {
  protectRoute,
  isAdmin,
};
