
const { createOrder, findAllOrders, findOrderById } = require('../model/order');

const createOrderController = async (req, res) => {
  try {
    // Force userId to be the authenticated user's ID
    const orderData = {
      ...req.body,
      userId: req.user.id
    };
    const order = await createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findAllOrdersController = async (req, res) => {
  try {
    // Pass the authenticated user's ID
    const orders = await findAllOrders(req.user.id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findOrderByIdController = async (req, res) => {
  try {
    // Pass the authenticated user's ID
    const order = await findOrderById(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrderController,
  findAllOrdersController,
  findOrderByIdController,
};
