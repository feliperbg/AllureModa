
const { createCart, findCartByUserId, updateCart } = require('../model/cart');

const createCartController = async (req, res) => {
  try {
    const cart = await createCart(req.body);
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
    const cart = await updateCart(req.user.id, req.body);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCartController,
  findCartByUserIdController,
  updateCartController,
};
