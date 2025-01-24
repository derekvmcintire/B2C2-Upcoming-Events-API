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
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { eventId, interestedRiders, housingUrl } = req.body;

    if (!eventId) {
      res.status(400).json({ error: 'eventId is required' });
      return;
    }

    const firestore = initializeFirebase();

    const eventRef = firestore.collection('events').doc(eventId);

    // Update or create the document with optional fields
    await eventRef.set(
      {
        ...(interestedRiders && { interestedRiders }), // Add if present
        ...(housingUrl && { housingUrl }), // Add if present
      },
      { merge: true } // Ensures fields are updated without overwriting the document
    );

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
