import { createServer } from 'http';
import { parse } from 'url';
import { join } from 'path';
import { readdir } from 'fs/promises';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PORT = 5173;

// Create a Vercel-like response object
function createVercelResponse(res: any): VercelResponse {
  return {
    ...res,
    status: (statusCode: number) => {
      res.statusCode = statusCode;
      return res;
    },
    json: (body: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
      return res;
    },
    send: (body: any) => {
      if (typeof body === 'object') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      } else {
        res.end(body);
      }
      return res;
    },
    setHeader: (name: string, value: string) => {
      res.setHeader(name, value);
      return res;
    },
    // Add other Vercel response methods as needed
  } as VercelResponse;
}

// Create a Vercel-like request object
function createVercelRequest(req: any, query: any): VercelRequest {
  return {
    ...req,
    query,
    cookies: {},
    body: null as any, // Will be populated for POST requests
  } as VercelRequest;
}

async function loadHandlers() {
  const apiDir = join(process.cwd(), 'api');
  const files = await readdir(apiDir);
  const handlers = new Map();
  
  for (const file of files) {
    if (file.endsWith('.ts')) {
      const route = '/api/' + file.replace('.ts', '');
      const module = await import('./api/' + file);
      handlers.set(route, module.default);
    }
  }
  
  return handlers;
}

async function startServer() {
  const handlers = await loadHandlers();
  
  const server = createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS requests for CORS
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const { pathname, query } = parse(req.url || '', true);
    const handler = handlers.get(pathname);
    
    if (handler) {
      try {
        // For POST requests, parse the body
        if (req.method === 'POST') {
          const buffers: Buffer[] = []; // Explicitly type the array to hold Buffer objects
          for await (const chunk of req) {
            buffers.push(chunk); // Now this will work because buffers is typed as Buffer[]
          }

          const data = Buffer.concat(buffers).toString();
          try {
            (req as any).body = JSON.parse(data);
          } catch {
            (req as any).body = data;
          }
        }

        // Create Vercel-like request and response objects
        const vercelReq = createVercelRequest(req, query);
        const vercelRes = createVercelResponse(res);

        await handler(vercelReq, vercelRes);
      } catch (error) {
        console.error('Error handling request:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Not Found: ${pathname}` }));
    }
  });
  
  server.listen(PORT, () => {
    console.log(`Development server running on http://localhost:${PORT}`);
    console.log('Available routes:', Array.from(handlers.keys()).join(', '));
  });
}

startServer().catch(console.error);