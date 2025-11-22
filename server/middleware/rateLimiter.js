const clients = new Map();

export function apiRateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const LIMIT = 60 * 1000; // 1 minute
  const MAX = 100;

  if (!clients.has(ip)) {
    clients.set(ip, []);
  }

  const requests = clients.get(ip).filter(timestamp => now - timestamp < LIMIT);
  requests.push(now);
  clients.set(ip, requests);

  if (requests.length > MAX) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  next();
}
