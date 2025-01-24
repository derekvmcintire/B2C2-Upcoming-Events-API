import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

if (process.env.CI !== 'true') {
  dotenv.config({ path: '.env.test' });
}

/**
 * Middleware function to enforce API key-based authentication for incoming requests.
 *
 * This middleware checks if the incoming request contains a valid API key in the headers.
 * If the API key matches the expected value stored in the environment variable `API_SECRET_KEY`,
 * the request proceeds to the next middleware or handler. Otherwise, an appropriate error
 * response is returned.
 *
 * @param req - The incoming HTTP request object (from Vercel).
 * @param res - The outgoing HTTP response object (from Vercel).
 * @param next - A callback function to pass control to the next middleware or handler.
 *
 * @returns A JSON response with an error message if authentication fails,
 *          or calls `next()` if authentication is successful.
 */
export async function authMiddleware(req: VercelRequest, res: VercelResponse, next: Function) {
  // Extract headers and API key from the incoming request
  const headers = req.headers || {};
  const apiKey = headers['x-api-key'] || headers['X-API-KEY'];
  const expectedApiKey = process.env.API_SECRET_KEY;

  // Check if the server is configured with an API_SECRET_KEY
  if (!expectedApiKey) {
    console.error('API_SECRET_KEY not configured in environment');
    return res.status(500).end(JSON.stringify({ error: 'Server configuration error' }));
  }

  // Check if an API key was provided in the request headers
  if (!apiKey) {
    console.log('No API key provided in headers');
    return res.status(401).end(JSON.stringify({ error: 'API key is required' }));
  }

  // Validate the provided API key against the expected key
  if (apiKey !== expectedApiKey) {
    console.log('Invalid API key provided: ', apiKey);
    return res.status(401).end(JSON.stringify({ error: 'Invalid API key' }));
  }

  // If all checks pass, proceed to the next middleware or handler
  next();
}
