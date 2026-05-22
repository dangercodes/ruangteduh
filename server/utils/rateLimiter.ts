// Simple In-Memory Rate Limiter
interface RateLimitInfo {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

export const checkRateLimit = (ip: string, limit: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const info = rateLimitMap.get(ip);

  if (!info) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true; // Allowed
  }

  // If time window has passed, reset
  if (now - info.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true; // Allowed
  }

  // Within window, check limit
  if (info.count >= limit) {
    return false; // Denied
  }

  // Increment
  info.count += 1;
  rateLimitMap.set(ip, info);
  return true; // Allowed
};

// Cleanup routine to prevent memory leaks (runs periodically)
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of rateLimitMap.entries()) {
    if (now - info.lastReset > 60000) { // Default window size
      rateLimitMap.delete(ip);
    }
  }
}, 60000);
