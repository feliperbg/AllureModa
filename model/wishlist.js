
const { prisma } = require('../prisma/client');

const createWishlistItem = async (data) => {
  const wishlistItem = await prisma.wishlistItem.create({
    data,
  });
  return wishlistItem;
};

const findAllWishlistItemsByUserId = async (userId) => {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      userId,
    },
  });
  return wishlistItems;
};

const deleteWishlistItem = async (id) => {
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
