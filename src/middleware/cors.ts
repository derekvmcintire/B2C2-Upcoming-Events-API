import { VercelRequest, VercelResponse } from '@vercel/node';

export const corsMiddleware = (req: VercelRequest, res: VercelResponse, next: Function) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins, or use specific origins like 'http://localhost:5173'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow the necessary HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Continue to the next middleware (or the actual API logic)
  next();
};
