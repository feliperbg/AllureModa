
const { prisma } = require('../prisma/client');

const createCart = async (data) => {
  const cart = await prisma.cart.create({
    data,
  });
  return cart;
};

const findCartByUserId = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });
  return cart;
};

const updateCart = async (id, data) => {
  const cart = await prisma.cart.update({
    where: {
      id,
    },
    data,
  });
  return cart;
};

module.exports = {
  createCart,
  findCartByUserId,
  updateCart,
};
