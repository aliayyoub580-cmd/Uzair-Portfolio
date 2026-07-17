/**
 * Minimal request logger.
 * Logs: method, path, status, response time.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms   = Date.now() - start;
    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`;
    if (res.statusCode >= 500) console.error(line);
    else if (res.statusCode >= 400) console.warn(line);
    else console.log(line);
  });
  next();
}
