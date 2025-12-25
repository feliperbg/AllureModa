
const { prisma } = require('../prisma/client');

const createProductVariant = async (data) => {
  const productVariant = await prisma.productVariant.create({
    data,
  });
  return productVariant;
};

const findAllProductVariants = async () => {
  const productVariants = await prisma.productVariant.findMany();
  return productVariants;
};

const findProductVariantById = async (id) => {
  const productVariant = await prisma.productVariant.findUnique({
    where: {
      id,
    },
  });
  return productVariant;
};

module.exports = {
  createProductVariant,
  findAllProductVariants,
  findProductVariantById,
};
