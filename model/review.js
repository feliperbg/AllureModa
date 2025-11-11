
const { prisma } = require('../prisma/client');

const createReview = async (data) => {
  const review = await prisma.review.create({
    data,
  });
  return review;
};

const findAllReviewsByProductId = async (productId) => {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
    },
  });
  return reviews;
};

module.exports = {
  createReview,
  findAllReviewsByProductId,
};
