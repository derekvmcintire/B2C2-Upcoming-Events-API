import { type VercelRequest, VercelResponse } from '@vercel/node';
import { initializeFirebase } from '../src/utils/firebase';
import { EventDiscipline } from '../src/types';

type UpdateEventData = {
  eventId: string;
  eventType: EventDiscipline;
  housingUrl?: string | null;
  interestedRiders?: string[] | null;
};

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
    const { eventId, eventType, interestedRiders, housingUrl }: UpdateEventData = req.body;

    // Validate input
    if (!eventId || !eventType) {
      res.status(400).json({ error: 'eventId and eventType are required' });
      return;
    }

    // Additional type checking
    if (interestedRiders !== undefined && !Array.isArray(interestedRiders)) {
      res.status(400).json({ error: 'interestedRiders must be an array or null' });
      return;
    }

    const firestore = initializeFirebase();
    const eventRef = firestore
      .collection('events')
      .doc(eventType)
      .collection('events')
      .doc(eventId);

    // Prepare update object supporting removal and updates
    const updateData: Partial<UpdateEventData> = {};
    
    // Allow setting to null to remove field
    if (housingUrl !== undefined) updateData.housingUrl = housingUrl;
    if (interestedRiders !== undefined) updateData.interestedRiders = interestedRiders;

    // Perform partial update
    await eventRef.update(updateData);

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}