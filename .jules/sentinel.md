# Sentinel Journal

## 2024-05-23 - IDOR in Order Management
**Vulnerability:** IDOR (Insecure Direct Object Reference) in `findAllOrders` and `findOrderById`.
**Learning:** `model/order.js` methods were designed to fetch all data without filtering by user, and the controller was blindly calling them even though the route was protected. The `protectRoute` middleware authenticates the user but does not automatically scope data access.
**Prevention:** Always pass `req.user.id` to data access layers for user-specific resources. Use `findFirst` with `{ id, userId }` instead of `findUnique` when enforcing ownership.

## 2025-01-15 - Permissive CORS Configuration
**Vulnerability:** The CORS configuration used loose checks (`includes('localhost')` and `endsWith('.vercel.app')`) which allowed untrusted origins like `evil-localhost.com` or any malicious Vercel app to interact with the API with credentials.
**Learning:** Checking for substrings in origin URLs is dangerous. Cloud providers (like Vercel) often use shared domains, so wildcarding the suffix allows any other tenant to access your API.
**Prevention:** Use exact string matching for allowed origins or strict regular expressions for development environments (anchored with `^` and `$`). Avoid wildcard suffixes for cloud providers. Use an `ALLOWED_ORIGINS` env var for flexibility.
