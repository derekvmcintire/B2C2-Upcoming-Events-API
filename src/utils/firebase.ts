import admin from 'firebase-admin';
import { type Event } from '../types';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIRESTORE_KEY || '')),
  });
}

export async function checkEventExists(eventId: string, eventType: string): Promise<boolean> {
  const db = admin.firestore();
  const docRef = await db
    .collection('events')
    .doc(eventType)
    .collection('events')
    .doc(eventId)
    .get();
  
  return docRef.exists;
}

export async function storeEvent(event: Event): Promise<{ isNew: boolean }> {
  const exists = await checkEventExists(event.eventId, event.eventType);
  
  if (exists) {
    return { isNew: false };
  }

  const db = admin.firestore();
  await db
    .collection('events')
    .doc(event.eventType)
    .collection('events')
    .doc(event.eventId)
    .set(event);

  return { isNew: true };
}
