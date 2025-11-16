
const { prisma } = require('../prisma/client');
const { createCart, findCartByUserId, updateCart } = require('../model/cart');

const createCartController = async (req, res) => {
  try {
    const existing = await findCartByUserId(req.user.id);
    if (existing) {
      return res.status(200).json(existing);
    }
    const cart = await createCart(req.user.id);
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findCartByUserIdController = async (req, res) => {
  try {
    const cart = await findCartByUserId(req.user.id);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCartController = async (req, res) => {
  try {
    const { productVariantId, quantity } = req.body;
    const userId = req.user.id;

    if (!productVariantId || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Dados do item inválidos.' });
    }

    const cart = await findCartByUserId(userId);
    if (!cart) {
      return res.status(404).json({ message: 'Carrinho não encontrado.' });
    }

    const existingItem = cart.items.find(
      (item) => item.productVariantId === productVariantId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > 0) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        await prisma.cartItem.delete({
          where: { id: existingItem.id },
        });
      }
    } else if (quantity > 0) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId,
          quantity,
        },
      });
    }

    const updatedCart = await findCartByUserId(userId);
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar o carrinho.' });
  }
};

module.exports = {
  createCartController,
  findCartByUserIdController,
  updateCartController,
};
