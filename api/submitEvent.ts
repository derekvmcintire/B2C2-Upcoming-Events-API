import { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';
import { validateRequest } from '../src/utils/validation';
import { fetchEventData } from '../src/utils/api';
import { storeEvent } from '../src/utils/firebase';
import { type Event, type SubmitEventRequest } from '../src/types';

/**
 * Handles the submission of an event.
 *
 * This function processes a POST request containing event details, validates the request data,
 * fetches event information from an external API, and stores the event in Firebase. If the event
 * already exists, it responds with a conflict status.
 *
 * @param {VercelRequest} req - The incoming HTTP request from Vercel, expected to be a POST request with event data.
 * @param {VercelResponse} res - The HTTP response object used to send a response back to the client.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 *
 * @example
 * // Request body structure
 * const requestBody = {
 *   url: 'https://example.com/event',
 *   eventType: 'road',
 * };
 *
 * // Response (success)
 * {
 *   success: true,
 *   message: 'Event successfully added',
 *   eventId: '12345',
 * }
 *
 * // Response (failure)
 * {
 *   error: 'Event not found',
 * }
 */
export default async function submitEvent(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Changed return type to `void`
  // Apply CORS middleware
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const requestData: SubmitEventRequest = req.body;

      // Validate request
      const validationError = validateRequest(requestData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Fetch event data
      const eventData = await fetchEventData(requestData.url);
      if (!eventData) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Prepare and store event
      const event: Event = {
        ...eventData,
        eventType: requestData.eventType,
      };

      const { isNew } = await storeEvent(event);

      if (!isNew) {
        return res.status(409).json({
          message: 'Event already exists',
          eventId: event.eventId,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Event successfully added',
        eventId: event.eventId,
      });
    } catch (error) {
      console.error('Error submitting event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
