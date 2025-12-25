
const { prisma } = require('../prisma/client');

const createProductImage = async (data) => {
  const productImage = await prisma.productImage.create({
    data,
  });
  return productImage;
};

const findAllProductImages = async () => {
  const productImages = await prisma.productImage.findMany();
  return productImages;
};

const findProductImageById = async (id) => {
  const productImage = await prisma.productImage.findUnique({
    where: {
      id,
    },
  });
  return productImage;
};

module.exports = {
  createProductImage,
  findAllProductImages,
  findProductImageById,
};
