import { VercelRequest, VercelResponse } from '@vercel/node';

export async function forwardTokenMiddleware(req: VercelRequest, res: VercelResponse, next: Function) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.log('no token found');
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  // Verify it's a Bearer token
  const [type, token] = authHeader.split(' ');
  
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }

  // You might want to validate the token here
  // For Vercel preview deployments, you can verify against process.env.VERCEL_TOKEN
  // if (process.env.VERCEL_TOKEN && token !== process.env.VERCEL_TOKEN) {
  //   return res.status(401).json({ error: 'Invalid token' });
  // }

  next();
}