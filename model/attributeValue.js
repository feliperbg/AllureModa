
const { prisma } = require('../prisma/client');

const createAttributeValue = async (data) => {
  const attributeValue = await prisma.attributeValue.create({
    data,
  });
  return attributeValue;
};

const findAllAttributeValues = async () => {
  const attributeValues = await prisma.attributeValue.findMany();
  return attributeValues;
};

const findAttributeValueById = async (id) => {
  const attributeValue = await prisma.attributeValue.findUnique({
    where: {
      id,
    },
  });
  return attributeValue;
};

module.exports = {
  createAttributeValue,
  findAllAttributeValues,
  findAttributeValueById,
};
