/**
 * API handler for the "hello" route.
 * 
 * This function demonstrates how to handle requests with middleware and return a simple JSON response. It uses the
 * following middleware:
 * 
 * 1. **CORS Middleware** (`corsMiddleware`): Ensures Cross-Origin Resource Sharing (CORS) compliance by setting
 *    appropriate headers, allowing requests from external domains.
 * 2. **Authentication Middleware** (`authMiddleware`): Validates authentication headers (e.g., API keys or tokens).
 * 
 * The handler accepts an optional query parameter `name` and returns a greeting message.
 * 
 * ### Example Request
 * ```http
 * GET /api/hello?name=Alice HTTP/1.1
 * Host: localhost
 * ```
 * 
 * ### Example Response
 * ```json
 * {
 *   "message": "Hello Alice!"
 * }
 * ```
 * 
 * ### Middleware Requirements
 * - **corsMiddleware**: Must call `next()` after setting headers to continue to the next middleware.
 * - **authMiddleware**: Validates the request and calls `next()` if valid.
 * 
 * @param req - The incoming HTTP request (Vercel-like).
 * @param res - The HTTP response object (Vercel-like).
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';
import { authMiddleware } from '../src/middleware/auth';

export default function hello(req: VercelRequest, res: VercelResponse): void {
  corsMiddleware(req, res, () => {
    authMiddleware(req, res, () => {
      const { name = 'World' } = req.query;

      // Send a JSON response with a personalized greeting
      return res.json({
        message: `Hello ${name}!`,
      });
    });
  });
}
