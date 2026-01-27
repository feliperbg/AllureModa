# Sentinel Journal

## 2024-05-23 - IDOR in Order Management
**Vulnerability:** IDOR (Insecure Direct Object Reference) in `findAllOrders` and `findOrderById`.
**Learning:** `model/order.js` methods were designed to fetch all data without filtering by user, and the controller was blindly calling them even though the route was protected. The `protectRoute` middleware authenticates the user but does not automatically scope data access.
**Prevention:** Always pass `req.user.id` to data access layers for user-specific resources. Use `findFirst` with `{ id, userId }` instead of `findUnique` when enforcing ownership.

## 2024-05-24 - IDOR in Address Management
**Vulnerability:** IDOR in `updateAddress` and `deleteAddress` allowed unauthorized modification of addresses.
**Learning:** Model functions `update` and `delete` relied solely on ID, allowing bypass if the controller failed to verify ownership.
**Prevention:** Modified model signatures to require `userId` and implemented `findFirst` check before mutation.

## 2026-01-27 - IDOR in Wishlist Management
**Vulnerability:** IDOR in `deleteWishlistItem` allowed any user to delete any wishlist item by ID.
**Learning:** This confirms a recurring pattern where controllers delegate trust to models that don't enforce ownership.
**Prevention:** Enforced strict ownership checks in `model/wishlist.js` using `findFirst({ where: { id, userId } })` before deletion, and updated controller to handle the resulting errors securely (returning 404).
