import { initializeFirebase } from '../../src/utils/firebase';

describe('Firestore Emulator Integration Test', () => {
  let db: FirebaseFirestore.Firestore;

  beforeAll(() => {
    // Set the environment variables needed for the emulator
    process.env.FIREBASE_PROJECT_ID = 'b2c2-event-calendar';
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.NODE_ENV = 'test';
    process.env.USE_FIRESTORE_EMULATOR = 'true';
    
    // Initialize the database connection
    db = initializeFirebase();
  });

  afterAll(async () => {
    // Clean up Firestore connection
    await db.terminate();
  });

  beforeEach(async () => {
    // Clear the database before each test
    const collections = await db.listCollections();
    const deleteOps = collections.map(collection =>
      collection.get().then(snapshot => {
        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
    );
    await Promise.all(deleteOps);
  });

  it('should add and retrieve a document', async () => {
    // Add a document
    const collectionRef = db.collection('users');
    await collectionRef.add({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815,
    });

    // Retrieve documents
    const snapshot = await collectionRef.get();
    const users: FirebaseFirestore.DocumentData[] = [];
    snapshot.forEach((doc) => users.push(doc.data()));

    // Check if the document was added
    expect(users).toContainEqual({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815,
    });
  }, 10000);

  it('should store and retrieve an event', async () => {
    const testEvent = {
      eventId: 'test-event-1',
      eventType: 'road',
      title: 'Test Event',
      date: '2024-05-01',
      location: 'Test Location',
      description: 'Test Description'
    };

    // Store the event
    const eventRef = db
      .collection('events')
      .doc(testEvent.eventType)
      .collection('events')
      .doc(testEvent.eventId);
    
    await eventRef.set(testEvent);

    // Retrieve the event
    const doc = await eventRef.get();
    
    expect(doc.exists).toBe(true);
    expect(doc.data()).toEqual(testEvent);
  }, 10000);
});