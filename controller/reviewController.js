
const { createReview, findAllReviewsByProductId } = require('../model/review');

const createReviewController = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || rating === undefined) {
      return res.status(400).json({ message: 'ProductId and rating are required.' });
    }

    const reviewData = {
      productId,
      rating,
      comment,
      userId: req.user.id,
    };

    const review = await createReview(reviewData);
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
