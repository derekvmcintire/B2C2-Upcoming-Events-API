import { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";
import { type Event } from "../src/types/index"

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIRESTORE_KEY || '')),
  });
}

/**
 * Handles fetching events from Firestore based on the event type and optional start date.
 * 
 * @param req - The HTTP request object containing query parameters for event type and start date.
 * @param res - The HTTP response object used to send the event data or error response.
 * 
 * @returns A JSON response with the list of events based on the requested parameters:
 *  - Status 200 with the events array if events are found.
 *  - Status 200 with an empty events array if no events match the query.
 *  - Status 400 if the event type is invalid or the date format is incorrect.
 *  - Status 405 for method not allowed (non-GET requests).
 *  - Status 500 for internal server errors.
 */
export default async function getEventsByType(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, startDate = new Date().toISOString().split('T')[0] } = req.query;

    // Validate type parameter
    if (!type || typeof type !== 'string' || !["road", "cx", "xc"].includes(type.toLowerCase())) {
      return res.status(400).json({ error: "Invalid event type. Must be one of: road, cx, xc" });
    }

    // Validate startDate format if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate.toString())) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const db = admin.firestore();
    
    // Query events collection
    const eventsRef = db
      .collection("events")
      .doc(type.toLowerCase())
      .collection("events")
      .where("date", ">=", startDate)
      .orderBy("date", "asc");

    const snapshot = await eventsRef.get();

    if (snapshot.empty) {
      return res.status(200).json({ events: [] });
    }

    // Convert snapshot to array of events
    const events: Event[] = snapshot.docs.map(doc => ({
      ...(doc.data() as Event),
      eventId: doc.id
    }));

    return res.status(200).json({ events });

  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
