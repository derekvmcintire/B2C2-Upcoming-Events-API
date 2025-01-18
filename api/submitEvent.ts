import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import fetch from 'node-fetch';
import { type EventData, SubmitEventRequest } from '../src/types/index';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIRESTORE_KEY || '')),
  });
}

/**
 * Handles the event submission by validating input, fetching data from an external API,
 * and storing the event in Firestore.
 *
 * @param req - The HTTP request object containing the event submission data.
 * @param res - The HTTP response object used to send a response back to the client.
 *
 * @returns A JSON response indicating the success or failure of the event submission.
 *  - Status 200 on success with the eventId.
 *  - Status 400 for invalid input (missing fields or invalid eventType/URL).
 *  - Status 404 if the event was not found from the external API.
 *  - Status 405 for method not allowed.
 *  - Status 500 for internal server errors.
 */
export default async function submitEvent(req: VercelRequest, res: VercelResponse) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract and validate input from the request body
    const { url, eventType }: SubmitEventRequest = req.body;

    if (!url || !eventType || !['road', 'cx', 'xc'].includes(eventType)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Fetch event data from the external GraphQL API
    const response = await fetch('https://outsideapi.com/fed-gw/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetAthleticEventByUrl($url: String!) {
            athleticEventByURL(url: $url) {
              eventId
              name
              date
              city
              state
              eventUrl
            }
          }
        `,
        variables: { url },
      }),
    });

    const result: any = await response.json();

    // If no event data is found, return a 404 error
    if (!result.data?.athleticEventByURL) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Prepare the event data to be stored in Firestore
    const eventData: EventData = {
      ...result.data.athleticEventByURL,
      eventType,
    };

    // Store the event data in Firestore
    const db = admin.firestore();
    await db
      .collection('events')
      .doc(eventType)
      .collection('events')
      .doc(eventData.eventId)
      .set(eventData);

    // Return a success response with the eventId
    return res.status(200).json({ success: true, eventId: eventData.eventId });
  } catch (error) {
    console.error('Error submitting event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
