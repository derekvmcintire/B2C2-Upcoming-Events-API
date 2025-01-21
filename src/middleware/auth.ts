import { VercelRequest, VercelResponse } from '@vercel/node';

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
  // Debug logging for the full request object
  console.log('Full request:', {
    headers: req.headers,
    method: req.method,
    url: req.url,
  });

  // Extract headers and API key from the incoming request
  const headers = req.headers || {};
  const apiKey = headers['x-api-key'] || headers['X-API-KEY'];
  const expectedApiKey = process.env.API_SECRET_KEY;

  // Log the authentication check details for debugging purposes
  console.log('Auth check:', {
    hasApiKey: !!apiKey, // Indicates whether an API key was provided
    hasExpectedKey: !!expectedApiKey, // Indicates if the server has a configured key
    headersPresent: Object.keys(headers), // List of headers present in the request
  });

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
    console.log('Invalid API key provided');
    return res.status(401).end(JSON.stringify({ error: 'Invalid API key' }));
  }

  // If all checks pass, proceed to the next middleware or handler
  next();
}
