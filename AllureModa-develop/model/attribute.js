
const { prisma } = require('../prisma/client');

const createAttribute = async (data) => {
  const attribute = await prisma.attribute.create({
    data,
  });
  return attribute;
};

const findAllAttributes = async () => {
  const attributes = await prisma.attribute.findMany();
  return attributes;
};

const findAttributeById = async (id) => {
  const attribute = await prisma.attribute.findUnique({
    where: {
      id,
    },
  });
  return attribute;
};

module.exports = {
  createAttribute,
  findAllAttributes,
  findAttributeById,
};
