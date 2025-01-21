import { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';
import { forwardTokenMiddleware } from '../src/middleware/forwardToken';

export default function hello(req: VercelRequest, res: VercelResponse): void {
  // Apply CORS middleware
  corsMiddleware(req, res, () => {
    forwardTokenMiddleware(req, res, () => {
      const { name = 'World' } = req.query;
      return res.json({
        message: `Hello ${name}!`,
      });
    });
  });
}
