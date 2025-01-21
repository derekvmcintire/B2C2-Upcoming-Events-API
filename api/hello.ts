import { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';
import { authMiddleware } from '../src/middleware/auth';

export default function hello(req: VercelRequest, res: VercelResponse): void {
  corsMiddleware(req, res, () => {
    authMiddleware(req, res, () => {
      const { name = 'World' } = req.query;
      return res.json({
        message: `Hello ${name}!`,
      });
    });
  });
}
