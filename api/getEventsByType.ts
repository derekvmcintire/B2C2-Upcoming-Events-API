import { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';
import { validateEventQuery } from '../src/utils/validation';
import { getCurrentDate } from '../src/utils/dates';
import { fetchEventsByType } from '../src/utils/firebase';
import { GetEventsQuery } from '../src/types';

/**
 * Handles the retrieval of events by type.
 *
 * This function processes a GET request with query parameters specifying the event type
 * and an optional start date. It validates the query parameters, retrieves events from Firebase,
 * and returns them as a response.
 *
 * @param {VercelRequest} req - The incoming HTTP request, expected to include query parameters.
 * @param {VercelResponse} res - The HTTP response object used to send a response back to the client.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 *
 * @example
 * // Request
 * GET /api/getEventsByType?type=road&startDate=2025-01-01
 *
 * // Response (success)
 * {
 *   events: [
 *     { eventId: '1', name: 'Marathon', date: '2025-01-02', city: 'Boston', state: 'MA', eventType: 'road' },
 *     { eventId: '2', name: '10K Run', date: '2025-01-03', city: 'New York', state: 'NY', eventType: 'road' }
 *   ]
 * }
 *
 * // Response (failure - validation error)
 * {
 *   error: 'Invalid query parameters'
 * }
 */
export default async function getEventsByType(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Return type changed to `void`
  // Apply CORS middleware
  corsMiddleware(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const query: GetEventsQuery = {
        type: req.query.type as string,
        startDate: (req.query.startDate as string) || getCurrentDate(),
      };

      // Validate query parameters
      const validationError = validateEventQuery(query);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Fetch events
      const events = await fetchEventsByType(query.type, query.startDate);

      return res.status(200).json({ events });
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
