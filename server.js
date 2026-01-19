require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { securityHeaders } = require('./middleware/security');

// Verificação de variáveis de ambiente
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET || !process.env.FRONTEND_URL) {
  console.error("FATAL ERROR: As variáveis de ambiente DATABASE_URL, JWT_SECRET e FRONTEND_URL devem ser definidas.");
  process.exit(1); // Encerra a aplicação se variáveis críticas não estiverem definidas
}

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origem (como apps mobile ou curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [process.env.FRONTEND_URL];
    
    // Verifica se a origem está na lista permitida, é uma preview do Vercel ou é localhost
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin); // Log para debug
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Essencial para permitir o envio de cookies
};


app.use(cors(corsOptions));

// Security Headers Middleware
app.use(securityHeaders);
app.disable('x-powered-by'); // Remove X-Powered-By header

// Middlewares essenciais
app.use(cookieParser()); // Para parsear cookies
app.use(express.json()); // Para parsear JSON no corpo das requisições

// --- Importação das Rotas ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const addressRoutes = require('./routes/address');
const brandRoutes = require('./routes/brand');
const cartRoutes = require('./routes/cart');
const categoryRoutes = require('./routes/category');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');
const wishlistRoutes = require('./routes/wishlist');
const adminRoutes = require('./routes/admin');
const attributeRoutes = require('./routes/attribute');


// --- Uso das Rotas ---
// As rotas da API serão prefixadas com /api
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attributes', attributeRoutes);

// Rota de "saúde" da API para verificar se está online
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Middleware de tratamento de erros (exemplo simples)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// Inicialização do Servidor
// Inicialização do Servidor
const PORT = process.env.PORT || 3001;

// Apenas inicia o servidor se não estiver rodando no Vercel (ou outro ambiente serverless que exporta o app)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor de API rodando na porta ${PORT}`);
    console.log(`CORS configurado para aceitar requisições de: ${process.env.FRONTEND_URL}`);
  });
}

module.exports = app;
