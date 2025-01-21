import { type VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';
import { validateEventQuery } from '../src/utils/validation';
import { getCurrentDate } from '../src/utils/dates';
import { fetchEventsByType } from '../src/utils/firebase';
import { type GetEventsQuery } from '../src/types';
import { authMiddleware } from '../src/middleware/auth';

/**
 * Handles the core logic for retrieving events by type.
 * 
 * This function validates query parameters, retrieves events from Firebase, and sends an appropriate response.
 * 
 * @param req - The incoming HTTP request, including query parameters for event filtering.
 * @param res - The HTTP response object for sending results back to the client.
 * @returns A `Promise<void>` that resolves after the request is handled.
 * 
 * ### Query Parameters
 * - `type` (string, required): The type of events to retrieve.
 * - `startDate` (string, optional): The start date for event filtering. Defaults to the current date if not provided.
 * 
 * ### Response Codes
 * - `200`: Events successfully retrieved.
 * - `400`: Invalid query parameters.
 * - `405`: Method not allowed (only `GET` is supported).
 * - `500`: Internal server error.
 * 
 * ### Example Request
 * ```http
 * GET /api/events?type=concert&startDate=2025-01-20 HTTP/1.1
 * Host: localhost
 * ```
 * 
 * ### Example Response
 * ```json
 * {
 *   "events": [
 *     {
 *       "id": "1",
 *       "type": "concert",
 *       "date": "2025-01-20",
 *       "name": "Live Music Festival"
 *     }
 *   ]
 * }
 * ```
 */
export async function handleGetEventsByType(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const query: GetEventsQuery = {
      type: req.query.type as string,
      startDate: (req.query.startDate as string) || getCurrentDate(),
    };

    // Validate query parameters
    const validationError = validateEventQuery(query);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    // Fetch events by type and send response
    const events = await fetchEventsByType(query.type, query.startDate);
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Serverless API handler for retrieving events by type with middleware support.
 * 
 * This endpoint supports the following middleware:
 * - **CORS Middleware** (`corsMiddleware`): Ensures that the endpoint is accessible across domains.
 * - **Authentication Middleware** (`authMiddleware`): Validates the client's authentication before proceeding.
 * 
 * @param req - The incoming HTTP request.
 * @param res - The HTTP response object for sending results back to the client.
 * @returns A `Promise<void>` that resolves after the request is fully handled.
 * 
 * ### Middleware Workflow
 * 1. **CORS Middleware**: Adds CORS headers to the response and proceeds.
 * 2. **Authentication Middleware**: Verifies the client's authentication and proceeds.
 * 3. **Main Handler**: Delegates the request processing to `handleGetEventsByType`.
 */
export default async function getEventsByType(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  corsMiddleware(req, res, async () => {
    await authMiddleware(req, res, async () => {
      await handleGetEventsByType(req, res);
    });
  });
}
