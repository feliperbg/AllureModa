
const { prisma } = require('../prisma/client');

const createCart = async (userId) => {
  const cart = await prisma.cart.create({
    data: { userId },
  });
  return cart;
};

const findCartByUserId = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: { include: { brand: true } },
            },
          },
        },
      },
    },
  });
  return cart;
};

const updateCart = async (userId, data) => {
  const cart = await prisma.cart.update({
    where: { userId },
    data,
  });
  return cart;
};

module.exports = {
  createCart,
  findCartByUserId,
  updateCart,
};
