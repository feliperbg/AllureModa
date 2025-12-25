
const { prisma } = require('../prisma/client');

const findAllProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });
  return products;
};

const findProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      variants: true,
    },
  });
  return product;
};

module.exports = {
  findAllProducts,
  findProductById,
};
