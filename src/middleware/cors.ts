import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Middleware function to enable Cross-Origin Resource Sharing (CORS) for incoming requests.
 *
 * This middleware sets the appropriate CORS headers to allow requests from different origins,
 * specifies the allowed HTTP methods, and permits certain headers in requests. Additionally,
 * it handles preflight requests with the HTTP OPTIONS method.
 *
 * @param req - The incoming HTTP request object (from Vercel).
 * @param res - The outgoing HTTP response object (from Vercel).
 * @param next - A callback function to pass control to the next middleware or handler.
 *
 * @returns For OPTIONS preflight requests, it sends a 200 status response and terminates.
 *          Otherwise, it calls `next()` to proceed to the next middleware or handler.
 */
export const corsMiddleware = (req: VercelRequest, res: VercelResponse, next: () => void): void => {
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows requests from any origin. Replace '*' with a specific origin for stricter security.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Specifies allowed HTTP methods.
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key'); // Lists headers the client is permitted to use.

  // Handle preflight requests (OPTIONS method) used by browsers for CORS checks
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Continue to the next middleware or request handler
  next();
};
