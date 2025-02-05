// src/utils/firebase.ts
import admin from 'firebase-admin';
import { type EventType } from '../types';

/**
 * Initializes the Firebase Firestore instance if it hasn't been initialized yet.
 *
 * @returns {FirebaseFirestore.Firestore} The Firestore instance.
 */
function initializeFirebase(): FirebaseFirestore.Firestore {
  if (!admin.apps.length) {
    if (process.env.NODE_ENV === 'test' || process.env.USE_FIRESTORE_EMULATOR === 'true') {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIRESTORE_KEY || '{}')),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      if (process.env.FIRESTORE_EMULATOR_HOST) {
        const db = admin.firestore();
        db.settings({
          host: process.env.FIRESTORE_EMULATOR_HOST,
          ssl: false,
        });
        return db;
      }
    }
  }
  return admin.firestore();
}

export { initializeFirebase };

/**
 * Checks if an event exists in the Firestore database.
 *
 * @param {string} eventId - The unique identifier of the event.
 * @param {string} eventType - The type of the event (e.g., road, cx, xc).
 * @returns {Promise<boolean>} A promise that resolves to `true` if the event exists, otherwise `false`.
 */
export async function checkEventExists(eventId: string, eventType: string): Promise<boolean> {
  const db = initializeFirebase();
  const docRef = await db
    .collection('events')
    .doc(eventType)
    .collection('events')
    .doc(eventId)
    .get();

  return docRef.exists;
}

/**
 * Stores a new event in the Firestore database if it does not already exist.
 *
 * @param {EventType} event - The event object to store.
 * @returns {Promise<{ isNew: boolean }>} A promise that resolves to an object indicating if the event is new.
 */
export async function storeEvent(event: EventType): Promise<{ isNew: boolean }> {
  const exists = await checkEventExists(event.eventId, event.eventType);

  if (exists) {
    return { isNew: false };
  }

  const db = initializeFirebase();
  const newEvent = {
    ...event,
    interestedRiders: event.interestedRiders || [], // Default to an empty array
    committedRiders: event.committedRiders || [],
    housingUrl: event.housingUrl || null, // Default to null
    description: event.description || null,
    labels: event.labels || [],
    carpools: event.carpools || [],
    housing: event.housing || {},
  };

  await db
    .collection('events')
    .doc(event.eventType)
    .collection('events')
    .doc(event.eventId)
    .set(newEvent);

  return { isNew: true };
}

/**
 * Fetches events of a specific type that occur on or after the given start date.
 *
 * @param {string} type - The type of the events to fetch (e.g., road, cx, xc).
 * @param {string} startDate - The start date to filter events (formatted as YYYY-MM-DD).
 * @returns {Promise<EventType[]>} A promise that resolves to an array of events matching the criteria.
 */
export async function fetchEventsByType(type: string, startDate: string): Promise<EventType[]> {
  const db = initializeFirebase();

  const eventsRef = db
    .collection('events')
    .doc(type.toLowerCase())
    .collection('events')
    .where('date', '>=', startDate)
    .orderBy('date', 'asc');

  const snapshot = await eventsRef.get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map((doc) => {
    const {
      eventType,
      name,
      date,
      city,
      state,
      eventUrl,
      interestedRiders = [],
      committedRiders = [],
      housingUrl = undefined,
      description = undefined,
      labels = [],
      carpools = [],
      housing = {},
    } = doc.data() as EventType;

    return {
      eventId: doc.id,
      eventType,
      name,
      date,
      city,
      state,
      eventUrl,
      interestedRiders,
      committedRiders,
      housingUrl,
      description,
      labels,
      carpools,
      housing,
    };
  });
}
