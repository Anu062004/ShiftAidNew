/**
 * Extract the user's IP address from the request
 * Handles various proxy headers and fallbacks
 * @param {express.Request} req - Express request object
 * @returns {string} - User's IP address
 */
export function getUserIP(req) {
  // Check x-forwarded-for header (most common for proxied requests)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  // Check x-real-ip header (alternative proxy header)
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'].trim();
  }

  // Check x-client-ip header
  if (req.headers['x-client-ip']) {
    return req.headers['x-client-ip'].trim();
  }

  // Use Express's req.ip (requires trust proxy to be set)
  if (req.ip && req.ip !== '::1' && req.ip !== '127.0.0.1') {
    return req.ip;
  }

  // Fallback to connection remote address
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }

  // Last resort fallback
  return req.socket?.remoteAddress || '127.0.0.1';
}


