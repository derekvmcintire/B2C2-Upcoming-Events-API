import { type VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/middleware/cors';
import { validateRequest } from '../src/utils/validation';
import { fetchEventData } from '../src/utils/api';
import { storeEvent } from '../src/utils/firebase';
import { type EventType, SubmitEventRequest } from '../src/types';
import { authMiddleware } from '../src/middleware/auth';

/**
 * Processes an event submission request, performing validation, data fetching, and storage.
 *
 * @param {VercelRequest} req - The incoming request containing event data
 * @param {VercelResponse} res - The response object for sending results
 * @returns {Promise<void>}
 *
 * Response Codes:
 * - 200: Event successfully added
 * - 400: Invalid request data
 * - 404: Event not found
 * - 405: Method not allowed
 * - 409: Event already exists
 * - 500: Internal server error
 */
export async function handleSubmitEvent(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const requestData: SubmitEventRequest = req.body;

    const validationError = validateRequest(requestData);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const eventData = await fetchEventData(requestData.url);
    if (!eventData) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const event: EventType = {
      ...eventData,
      eventType: requestData.eventType,
    };

    const { isNew } = await storeEvent(event);

    if (!isNew) {
      res.status(409).json({
        message: 'Event already exists',
        eventId: event.eventId,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event successfully added',
      eventId: event.eventId,
    });
    return;
  } catch (error) {
    console.error('Error submitting event:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

/**
 * Serverless endpoint for event submission with CORS and authentication support.
 * Expects a POST request with a body containing:
 * {
 *   url: string,      // URL of the event
 *   eventType: string // Type of the event
 * }
 *
 * Middleware:
 * - CORS: Ensures cross-origin request compatibility
 * - Authentication: Validates the request is from an authenticated user
 */
export default function submitEvent(req: VercelRequest, res: VercelResponse): Promise<void> {
  return new Promise((resolve) => {
    corsMiddleware(req, res, async () => {
      authMiddleware(req, res, async () => {
        await handleSubmitEvent(req, res);
        resolve();
      });
    });
  });
}
