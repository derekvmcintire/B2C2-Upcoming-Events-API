import { createServer } from 'http';
import { parse } from 'url';
import { join } from 'path';
import { readdir } from 'fs/promises';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 4001;

/**
 * Creates a Vercel-like response object from the native HTTP response object.
 *
 * This function augments the response object to mimic Vercel's response methods,
 * such as `status()`, `json()`, `send()`, and `setHeader()`, allowing easier
 * integration with Vercel-like API handlers.
 *
 * @param res - The native HTTP response object.
 * @returns A modified response object with additional methods.
 */
function createVercelResponse(res: any): VercelResponse {
  const vercelRes = {
    ...res,
    status: function (statusCode: number) {
      res.statusCode = statusCode;
      return this; // Return the vercelRes object for chaining
    },
    json: function (body: any) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
      return this;
    },
    send: function (body: any) {
      if (typeof body === 'object') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      } else {
        res.end(body);
      }
      return this;
    },
    setHeader: function (name: string, value: string) {
      res.setHeader(name, value);
      return this;
    },
  } as VercelResponse;

  return vercelRes;
}

/**
 * Creates a Vercel-like request object from the native HTTP request object.
 *
 * This function augments the request object to include properties like `query` (parsed query parameters),
 * `headers`, and an optional `body` field. This allows compatibility with Vercel-style API handlers.
 *
 * @param req - The native HTTP request object.
 * @param query - Parsed query parameters from the request URL.
 * @returns A modified request object with additional properties.
 */
function createVercelRequest(req: any, query: any): VercelRequest {
  return {
    ...req,
    query,
    headers: req.headers || {}, // Explicitly include headers
    cookies: {},
    body: null as any,
  } as VercelRequest;
}

/**
 * Asynchronously loads API route handlers from the `api` directory.
 *
 * This function reads the `api` directory, imports each `.ts` file, and maps
 * route paths to their respective handler functions. Routes are prefixed with `/api/`.
 *
 * @returns A Map where keys are route paths and values are handler functions.
 */
async function loadHandlers() {
  const apiDir = join(process.cwd(), 'api'); // Locate the `api` directory
  const files = await readdir(apiDir);
  const handlers = new Map();

  for (const file of files) {
    if (file.endsWith('.ts')) {
      const route = '/api/' + file.replace('.ts', ''); // Construct route paths
      const module = await import('./api/' + file); // Dynamically import handler modules
      handlers.set(route, module.default); // Map route to handler
    }
  }

  return handlers;
}

/**
 * Starts the development server, dynamically loading API route handlers and serving requests.
 *
 * The server sets up basic CORS headers, handles preflight requests, parses incoming request bodies,
 * and delegates requests to appropriate route handlers. If no handler matches the request path, it responds with a 404 error.
 *
 * @returns A Promise that resolves when the server is started.
 */
async function startServer() {
  const handlers = await loadHandlers(); // Load all API handlers

  const server = createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Specify allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key'); // Specify allowed headers

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const { pathname, query } = parse(req.url || '', true); // Parse request URL
    const handler = handlers.get(pathname); // Find the matching route handler

    if (handler) {
      try {
        // Parse the request body for POST requests
        if (req.method === 'POST') {
          const buffers: Buffer[] = []; // Buffer array to store incoming data chunks
          for await (const chunk of req) {
            buffers.push(chunk);
          }

          const data = Buffer.concat(buffers).toString();
          try {
            (req as any).body = JSON.parse(data); // Parse JSON body if possible
          } catch {
            (req as any).body = data; // Fallback to plain string
          }
        }

        // Create Vercel-like request and response objects
        const vercelReq = createVercelRequest(req, query);
        const vercelRes = createVercelResponse(res);

        // Call the route handler
        await handler(vercelReq, vercelRes);
      } catch (error) {
        console.error('Error handling request:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    } else {
      // Respond with 404 if no handler matches
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Not Found: ${pathname}` }));
    }
  });

  // Start the server and log available routes
  server.listen(PORT, () => {
    console.log(`Development server running on http://localhost:${PORT}`);
    console.log('Available routes:', Array.from(handlers.keys()).join(', '));
  });
}

// Start the server and catch initialization errors
startServer().catch(console.error);
