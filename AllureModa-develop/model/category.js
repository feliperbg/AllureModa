
const { prisma } = require('../prisma/client');

const createCategory = async (data) => {
  const category = await prisma.category.create({
    data,
  });
  return category;
};

const findAllCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
};

const findCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });
  return category;
};

module.exports = {
  createCategory,
  findAllCategories,
  findCategoryById,
};
