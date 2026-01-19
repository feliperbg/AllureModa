/**
 * Security Headers Middleware
 * Adds various HTTP headers to enhance application security.
 */
const securityHeaders = (req, res, next) => {
  // HSTS - Force HTTPS
  // Tells the browser to only interact with the server using HTTPS for the next year.
  // includeSubDomains applies this to all subdomains.
  if (process.env.NODE_ENV !== 'development') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Prevent MIME type sniffing
  // Prevents the browser from interpreting files as a different MIME type than what is specified by the Content-Type header.
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection
  // Controls whether the browser should be allowed to render a page in a <frame>, <iframe>, <embed> or <object>.
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS Protection
  // Enables the Cross-Site Scripting (XSS) filter built into most recent web browsers.
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  // Controls how much referrer information (sent via the Referer header) should be included with requests.
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature-Policy)
  // Allows a site to explicitly declare which features and APIs it intends to use.
  // Disabling geolocation, microphone, and camera as a default secure stance.
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

module.exports = { securityHeaders };
