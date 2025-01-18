import { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';

export default function hello(req: VercelRequest, res: VercelResponse): void {
  // Apply CORS middleware
  corsMiddleware(req, res, () => {
    const { name = 'World' } = req.query;
    return res.json({
      message: `Hello ${name}!`,
    });
  });
}
