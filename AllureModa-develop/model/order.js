
const { prisma } = require('../prisma/client');

const createOrder = async (data) => {
  const order = await prisma.order.create({
    data,
  });
  return order;
};

const findAllOrders = async () => {
  const orders = await prisma.order.findMany();
  return orders;
};

const findOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
  });
  return order;
};

module.exports = {
  createOrder,
  findAllOrders,
  findOrderById,
};
