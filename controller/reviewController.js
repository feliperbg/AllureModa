
const { createReview, findAllReviewsByProductId } = require('../model/review');

const createReviewController = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const userId = req.user.id;

    if (!rating || !productId) {
      return res.status(400).json({ message: 'Rating and Product ID are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const review = await createReview({
      rating,
      comment,
      productId,
      userId,
    });
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
