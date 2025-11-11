
const { createWishlistItem, findAllWishlistItemsByUserId, deleteWishlistItem } = require('../model/wishlist');

const createWishlistItemController = async (req, res) => {
  try {
    const wishlistItem = await createWishlistItem(req.body);
    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findAllWishlistItemsByUserIdController = async (req, res) => {
  try {
    const wishlistItems = await findAllWishlistItemsByUserId(req.user.id);
    res.status(200).json(wishlistItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWishlistItemController = async (req, res) => {
  try {
    const wishlistItem = await deleteWishlistItem(req.params.id);
    res.status(200).json(wishlistItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWishlistItemController,
  findAllWishlistItemsByUserIdController,
  deleteWishlistItemController,
};
