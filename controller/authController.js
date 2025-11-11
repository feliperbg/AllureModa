
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Função para gerar o token e enviá-lo como um cookie HttpOnly
const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15d', // Token expira em 15 dias
  });

  res.cookie('jwt', token, {
    httpOnly: true, // Impede acesso via JavaScript no frontend
    secure: process.env.NODE_ENV !== 'development', // `true` em produção (HTTPS)
    sameSite: 'Strict', // Ajuda a mitigar ataques CSRF
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 dias em milissegundos
  });
};

/**
 * @desc    Registra um novo usuário
 * @route   POST /api/auth/register
 * @access  Público
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validação básica
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Por favor, forneça todos os campos obrigatórios.' });
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Usuário com este e-mail já existe.' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Cria o usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
    });

    // Gera o token e o cookie
    generateTokenAndSetCookie(newUser.id, res);

    // Retorna os dados do usuário (sem a senha)
    res.status(201).json({
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao tentar registrar o usuário.' });
  }
};

/**
 * @desc    Autentica um usuário (login)
 * @route   POST /api/auth/login
 * @access  Público
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, forneça e-mail e senha.' });
    }

    // Encontra o usuário
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Mensagem genérica
    }

    // Compara a senha
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Mensagem genérica
    }

    // Gera o token e o cookie
    generateTokenAndSetCookie(user.id, res);

    // Retorna os dados do usuário (sem a senha)
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login.' });
  }
};

/**
 * @desc    Faz logout do usuário
 * @route   POST /api/auth/logout
 * @access  Público/Privado
 */
const logout = (req, res) => {
  // Limpa o cookie de autenticação
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Define a data de expiração para o passado
  });
  res.status(200).json({ message: 'Logout realizado com sucesso.' });
};

/**
 * @desc    Obtém os dados do usuário autenticado
 * @route   GET /api/auth/me
 * @access  Privado
 */
const getMe = async (req, res) => {
  // O middleware `protectRoute` já anexou o usuário ao `req`
  // Apenas retornamos os dados do usuário que já foram buscados e validados
  res.status(200).json(req.user);
};


module.exports = {
  register,
  login,
  logout,
  getMe,
};
