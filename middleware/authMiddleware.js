
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware para proteger rotas que exigem autenticação.
 * Ele verifica o token JWT enviado nos cookies da requisição.
 */
const protectRoute = async (req, res, next) => {
  try {
    // 1. Ler o token dos cookies
    const token = req.cookies.jwt;

    if (!token) {
      // Se não houver token, o acesso é negado
      return res.status(401).json({ message: 'Não autorizado. Token não fornecido.' });
    }

    // 2. Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      // Se o token for inválido ou expirado
      return res.status(401).json({ message: 'Não autorizado. Token inválido.' });
    }

    // 3. Anexar o usuário à requisição (sem a senha)
    // Busca o usuário no banco para garantir que ele ainda existe
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
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Anexa o objeto de usuário ao objeto `req` para uso em rotas subsequentes
    req.user = user;

    next(); // Se tudo estiver OK, passa para o próximo middleware ou controlador

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }

    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * Middleware opcional para verificar se o usuário é um Administrador.
 * Deve ser usado *após* o `protectRoute`.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Usuário é admin, pode prosseguir
  } else {
    // Se não for admin, retorna erro de "proibido"
    return res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
  }
};


module.exports = {
    protectRoute,
    isAdmin
};
