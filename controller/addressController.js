
const { createAddress, findAllAddressesByUserId, updateAddress, deleteAddress } = require('../model/address');

const createAddressController = async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.id };
    const address = await createAddress(payload);
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findAllAddressesByUserIdController = async (req, res) => {
  try {
    const addresses = await findAllAddressesByUserId(req.user.id);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAddressController = async (req, res) => {
  try {
    // Pass user.id to enforce ownership check
    const address = await updateAddress(req.params.id, req.user.id, req.body);
    res.status(200).json(address);
  } catch (error) {
    if (error.message === 'Address not found or access denied') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

const deleteAddressController = async (req, res) => {
  try {
    // Pass user.id to enforce ownership check
    const address = await deleteAddress(req.params.id, req.user.id);
    res.status(200).json(address);
  } catch (error) {
    if (error.message === 'Address not found or access denied') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = {
  createAddressController,
  findAllAddressesByUserIdController,
  updateAddressController,
  deleteAddressController,
};
