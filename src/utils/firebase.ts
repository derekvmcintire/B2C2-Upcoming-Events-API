import admin from 'firebase-admin';
import { type Event } from '../types';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIRESTORE_KEY || '')),
  });
}

export async function storeEvent(event: Event): Promise<void> {
  const db = admin.firestore();
  await db
    .collection('events')
    .doc(event.eventType)
    .collection('events')
    .doc(event.eventId)
    .set(event);
}
