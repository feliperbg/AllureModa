
const { createReview, findAllReviewsByProductId } = require('../model/review');

const createReviewController = async (req, res) => {
  try {
    const review = await createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findAllReviewsByProductIdController = async (req, res) => {
  try {
    const reviews = await findAllReviewsByProductId(req.params.productId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReviewController,
  findAllReviewsByProductIdController,
};
