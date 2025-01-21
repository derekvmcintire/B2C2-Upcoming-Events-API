import { type VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';
import { validateEventQuery } from '../src/utils/validation';
import { getCurrentDate } from '../src/utils/dates';
import { fetchEventsByType } from '../src/utils/firebase';
import { type GetEventsQuery } from '../src/types';

/**
 * Processes an events retrieval request, performing validation and data fetching.
 *
 * @param {VercelRequest} req - The incoming request with event type query parameters
 * @param {VercelResponse} res - The response object for sending results
 * @returns {Promise<void>}
 *
 * Response Codes:
 * - 200: Events successfully retrieved
 * - 400: Invalid query parameters
 * - 405: Method not allowed
 * - 500: Internal server error
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

    const validationError = validateEventQuery(query);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const events = await fetchEventsByType(query.type, query.startDate);
    res.status(200).json({ events });
    return;
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

/**
 * Serverless endpoint for retrieving events by type with CORS support.
 * Expects a GET request with query parameters:
 * - type: string     (required) Type of events to retrieve
 * - startDate: string (optional) Start date for event filtering
 */
export default function getEventsByType(req: VercelRequest, res: VercelResponse): Promise<void> {
  return new Promise((resolve) => {
    corsMiddleware(req, res, async () => {
      await handleGetEventsByType(req, res);
      resolve();
    });
  });
}
