import { type VercelRequest, VercelResponse } from '@vercel/node';
import { initializeFirebase } from '../src/utils/firebase';
import { EventDiscipline } from '../src/types';

type UpdateEventData = {
  eventId: string;
  eventType: EventDiscipline;
  housingUrl?: string | null;
  interestedRiders?: string[];
  description?: string | null;
};

/**
 * Validates the type of a field to ensure it matches the expected type.
 * Responds with a 400 status code if the type is incorrect.
 *
 * @param value - The value to check.
 * @param expectedType - The expected type of the value.
 * @param fieldName - The name of the field being checked.
 * @param res - The response object to send the error message.
 */
const validateFieldType = (
  value: unknown,
  expectedType: string,
  fieldName: string,
  res: VercelResponse
): void => {
  if (value !== undefined && value !== null && typeof value !== expectedType) {
    res.status(400).json({ error: `Provided value for ${fieldName} must be a ${expectedType}` });
  }
};

/**
 * Updates an event in the Firestore database based on the provided event data.
 * Only PATCH requests are allowed, and certain fields are validated before updating.
 * Responds with appropriate status codes based on success or failure.
 *
 * @param req - The request object containing the event data to update.
 * @param res - The response object to send the result of the update operation.
 *
 * @returns A promise that resolves when the update operation completes.
 */
export default async function updateEvent(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { eventId, eventType, interestedRiders, housingUrl, description }: UpdateEventData =
      req.body;

    // Validate input
    if (!eventId || !eventType) {
      res.status(400).json({ error: 'eventId and eventType are required' });
      return;
    }

    // Type checking
    if (interestedRiders !== undefined && !Array.isArray(interestedRiders)) {
      res.status(400).json({ error: 'interestedRiders must be an array' });
      return;
    }

    validateFieldType(housingUrl, 'string', 'housingUrl', res);
    validateFieldType(description, 'string', 'description', res);

    const firestore = initializeFirebase();
    const eventRef = firestore
      .collection('events')
      .doc(eventType)
      .collection('events')
      .doc(eventId);

    // Prepare update object with all possible fields, allowing null/empty values
    const updateData: Partial<UpdateEventData> = {};

    if (interestedRiders !== undefined) updateData.interestedRiders = interestedRiders;
    if (housingUrl !== undefined) updateData.housingUrl = housingUrl;
    if (description !== undefined) updateData.description = description;

    // Perform partial update
    await eventRef.update(updateData);

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
