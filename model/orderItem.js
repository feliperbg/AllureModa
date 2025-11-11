
const { prisma } = require('../prisma/client');

const createOrderItem = async (data) => {
  const orderItem = await prisma.orderItem.create({
    data,
  });
  return orderItem;
};

const findAllOrderItemsByOrderId = async (orderId) => {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      orderId,
    },
  });
  return orderItems;
};

module.exports = {
  createOrderItem,
  findAllOrderItemsByOrderId,
};
