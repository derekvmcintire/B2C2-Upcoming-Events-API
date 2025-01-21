// src/middleware/auth.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

export async function authMiddleware(req: VercelRequest, res: VercelResponse, next: Function) {
  // Debug logging
  console.log('Full request:', {
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  const headers = req.headers || {};
  const apiKey = headers['x-api-key'] || headers['X-API-KEY'];
  const expectedApiKey = process.env.API_SECRET_KEY;

  console.log('Auth check:', {
    hasApiKey: !!apiKey,
    hasExpectedKey: !!expectedApiKey,
    headersPresent: Object.keys(headers)
  });

  if (!expectedApiKey) {
    console.error('API_SECRET_KEY not configured in environment');
    return res.status(500).end(JSON.stringify({ error: 'Server configuration error' }));
  }

  if (!apiKey) {
    console.log('No API key provided in headers');
    return res.status(401).end(JSON.stringify({ error: 'API key is required' }));
  }

  if (apiKey !== expectedApiKey) {
    console.log('Invalid API key provided');
    return res.status(401).end(JSON.stringify({ error: 'Invalid API key' }));
  }

  next();
}