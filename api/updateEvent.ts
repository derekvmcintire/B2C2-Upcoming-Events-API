import { type VercelRequest, VercelResponse } from '@vercel/node';
import { initializeFirebase } from '../src/utils/firebase';

/**
 * Handles adding or updating event data with new optional fields.
 *
 * @param req - Incoming HTTP request, containing event data in the body.
 * @param res - HTTP response object.
 * @returns A `Promise<void>` that resolves after the request is handled.
 */
export default async function updateEvent(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { eventId, interestedRiders, housingUrl } = req.body;

    // Validate input
    if (!eventId) {
      res.status(400).json({ error: 'eventId is required' });
      return;
    }

    // Additional type checking
    if (interestedRiders && !Array.isArray(interestedRiders)) {
      res.status(400).json({ error: 'interestedRiders must be an array' });
      return;
    }

    if (housingUrl && typeof housingUrl !== 'string') {
      res.status(400).json({ error: 'housingUrl must be a string' });
      return;
    }

    const firestore = initializeFirebase();
    const eventRef = firestore.collection('events').doc(eventId);

    // Prepare update object with only provided fields
    const updateData: Record<string, any> = {};
    if (interestedRiders) updateData.interestedRiders = interestedRiders;
    if (housingUrl) updateData.housingUrl = housingUrl;

    console.log('updating data with: ', updateData)

    // Perform partial update
    await eventRef.update(updateData);

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}