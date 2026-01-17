# Sentinel Journal

## 2024-05-23 - IDOR in Order Management
**Vulnerability:** IDOR (Insecure Direct Object Reference) in `findAllOrders` and `findOrderById`.
**Learning:** `model/order.js` methods were designed to fetch all data without filtering by user, and the controller was blindly calling them even though the route was protected. The `protectRoute` middleware authenticates the user but does not automatically scope data access.
**Prevention:** Always pass `req.user.id` to data access layers for user-specific resources. Use `findFirst` with `{ id, userId }` instead of `findUnique` when enforcing ownership.

## 2024-05-24 - IDOR in Address Management
**Vulnerability:** IDOR in `updateAddress` and `deleteAddress` allowed unauthorized modification of addresses.
**Learning:** Model functions `update` and `delete` relied solely on ID, allowing bypass if the controller failed to verify ownership.
**Prevention:** Modified model signatures to require `userId` and implemented `findFirst` check before mutation.

## 2024-05-25 - IDOR in Wishlist Management
**Vulnerability:** IDOR in `deleteWishlistItem` allowed authenticated users to delete any wishlist item by guessing the ID.
**Learning:** Similar to Address management, the model function `deleteWishlistItem` only required `id`, assuming the controller would handle authorization. However, the controller was only authenticated, not authorized for the specific resource.
**Prevention:** Enforced ownership check in the model layer by requiring `userId` and using `findFirst` to verify existence and ownership before deletion.
