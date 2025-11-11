
const { createBrand, findAllBrands, findBrandById } = require('../model/brand');

const createBrandController = async (req, res) => {
  try {
    const brand = await createBrand(req.body);
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findAllBrandsController = async (req, res) => {
  try {
    const brands = await findAllBrands();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findBrandByIdController = async (req, res) => {
  try {
    const brand = await findBrandById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBrandController,
  findAllBrandsController,
  findBrandByIdController,
};
