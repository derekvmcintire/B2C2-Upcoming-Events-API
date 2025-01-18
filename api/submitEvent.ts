import { VercelRequest, VercelResponse } from '@vercel/node';
import { validateRequest } from '../src/utils/validation';
import { fetchEventData } from '../src/utils/api';
import { storeEvent } from '../src/utils/firebase';
import { type Event, type SubmitEventRequest } from '../src/types';

export default async function submitEvent(req: VercelRequest, res: VercelResponse) {
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
}
