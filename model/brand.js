
const { prisma } = require('../prisma/client');

const createBrand = async (data) => {
  const brand = await prisma.brand.create({
    data,
  });
  return brand;
};

const findAllBrands = async () => {
  const brands = await prisma.brand.findMany();
  return brands;
};

const findBrandById = async (id) => {
  const brand = await prisma.brand.findUnique({
    where: {
      id,
    },
  });
  return brand;
};

module.exports = {
  createBrand,
  findAllBrands,
  findBrandById,
};
