
const { prisma } = require('../prisma/client');

const createOrder = async (data) => {
  const order = await prisma.order.create({
    data,
  });
  return order;
};

const findAllOrders = async (userId) => {
  const where = {};
  if (userId) {
    where.userId = userId;
  }
  const orders = await prisma.order.findMany({ where });
  return orders;
};

const findOrderById = async (id, userId) => {
  const where = { id };
  if (userId) {
    where.userId = userId;
  }

  // Use findFirst because findUnique only accepts unique fields.
  // Although 'id' is unique, adding 'userId' makes it a composite filter which findUnique doesn't support directly on 'where' unless it's a unique constraint.
  // But wait, if we want to ensure it matches BOTH id and userId, findFirst is the way.
  // However, findUnique is optimized.
  // If we assume ID is globally unique (it is, CUID), we can fetch by ID and then check userId in JS, OR use findFirst.
  // Prisma recommendation for ownership: findFirst({ where: { id, userId } })
  const order = await prisma.order.findFirst({
    where,
  });
  return order;
};

module.exports = {
  createOrder,
  findAllOrders,
  findOrderById,
};
