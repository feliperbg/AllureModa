
const { prisma } = require('../prisma/client');

const createProductVariantAttributeValue = async (data) => {
  const productVariantAttributeValue = await prisma.productVariantAttributeValue.create({
    data,
  });
  return productVariantAttributeValue;
};

const findAllProductVariantAttributeValues = async () => {
  const productVariantAttributeValues = await prisma.productVariantAttributeValue.findMany();
  return productVariantAttributeValues;
};

const findProductVariantAttributeValueById = async (id) => {
  const productVariantAttributeValue = await prisma.productVariantAttributeValue.findUnique({
    where: {
      id,
    },
  });
  return productVariantAttributeValue;
};

module.exports = {
  createProductVariantAttributeValue,
  findAllProductVariantAttributeValues,
  findProductVariantAttributeValueById,
};
