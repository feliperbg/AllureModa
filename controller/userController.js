
const { findUserById, updateUserById } = require('../model/user');

const findUserByIdController = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  findUserByIdController,
  updateUserByIdController: async (req, res) => {
    try {
      const allowed = ['firstName','lastName','phone','cpf','birthDate'];
      const data = {};
      for (const k of allowed) {
        if (req.body[k] !== undefined) data[k] = req.body[k];
      }
      const user = await updateUserById(req.user.id, data);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
