
const { createOrder, findAllOrders, findOrderById } = require('../model/order');

const createOrderController = async (req, res) => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findAllOrdersController = async (req, res) => {
  try {
    const orders = await findAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findOrderByIdController = async (req, res) => {
  try {
    const order = await findOrderById(req.params.id);
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
