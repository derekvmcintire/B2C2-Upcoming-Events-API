import { VercelRequest, VercelResponse } from '@vercel/node';

export async function forwardTokenMiddleware(req: VercelRequest, res: VercelResponse, next: Function) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  // Attach the token to the request for later use
  req.headers['Authorization'] = token;

  // Call the next middleware or handler
  next();
}
