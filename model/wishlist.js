
const { prisma } = require('../prisma/client');

const createWishlistItem = async (data) => {
  const wishlistItem = await prisma.wishlistItem.create({
    data,
  });
  return wishlistItem;
};

const findAllWishlistItemsByUserId = async (userId) => {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          brand: true,
          category: true,
          images: { orderBy: { priority: 'asc' } },
        },
      },
    },
  });
  return wishlistItems;
};

const deleteWishlistItem = async (id, userId) => {
  const item = await prisma.wishlistItem.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!item) {
    throw new Error('Wishlist item not found or Access denied');
  }

  const wishlistItem = await prisma.wishlistItem.delete({
    where: {
      id,
    },
  });
  return wishlistItem;
};

module.exports = {
  createWishlistItem,
  findAllWishlistItemsByUserId,
  deleteWishlistItem,
};
