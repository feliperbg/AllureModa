
const { prisma } = require('../prisma/client');

const createCartItem = async (data) => {
  const cartItem = await prisma.cartItem.create({
    data,
  });
  return cartItem;
};

const findAllCartItemsByCartId = async (cartId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: {
      cartId,
    },
  });
  return cartItems;
};

const updateCartItem = async (id, data) => {
  const cartItem = await prisma.cartItem.update({
    where: {
      id,
    },
    data,
  });
  return cartItem;
};

const deleteCartItem = async (id) => {
  const cartItem = await prisma.cartItem.delete({
    where: {
      id,
    },
  });
  return cartItem;
};

module.exports = {
  createCartItem,
  findAllCartItemsByCartId,
  updateCartItem,
  deleteCartItem,
};
