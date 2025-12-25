
const { createCategory, findAllCategories, findCategoryById } = require('../model/category');

const createCategoryController = async (req, res) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findAllCategoriesController = async (req, res) => {
  try {
    const categories = await findAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findCategoryByIdController = async (req, res) => {
  try {
    const category = await findCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategoryController,
  findAllCategoriesController,
  findCategoryByIdController,
};
