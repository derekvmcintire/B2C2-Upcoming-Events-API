import { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEventQuery, type GetEventsQuery } from '../src/utils/validation';
import { getCurrentDate } from '../src/utils/dates';
import { fetchEventsByType } from '../src/utils/firebase';

export default async function getEventsByType(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const query: GetEventsQuery = {
      type: req.query.type as string,
      startDate: (req.query.startDate as string) || getCurrentDate()
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
}