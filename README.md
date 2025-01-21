# B2C2 Events API

This API provides serverless functions for managing cycling event data, integrating with Firebase Firestore and a third-party BikeReg GraphQL API. The service is primarily used by the B2C2 cycling team's Event Calendar application for internal event tracking.

## Technology Stack

- TypeScript
- Vercel (Serverless Functions)
- Firebase Firestore
- Node.js (>= 18.0.0)

## API Endpoints

### GET /hello

Test endpoint to verify API functionality.

### GET /getEventsByType

Retrieves a list of events from the Firestore database filtered by type.

#### Parameters

- `type` (required): Type of events to retrieve (road, cx, xc)

#### Example Request

```http
GET https://b2c2-events-api.vercel.app/api/getEventsByType?type=road
```

#### Success Response

```json
{
  "events": [
    {
      "eventId": "69168",
      "name": "The Frozen Four 2025: Matt Catania Memorial",
      "date": "2025-03-02T00:00:00.000-05:00",
      "city": "Farmington",
      "state": "CT",
      "eventUrl": "https://www.bikereg.com/the-frozen-four-1-2025",
      "eventType": "road"
    }
  ]
}
```

#### Error Response

```json
{
  "error": "Invalid event type. Must be one of: road, cx, xc"
}
```

### POST /submitEvent

Submits a new event by retrieving event information from the BikeReg GraphQL API and storing it in the Firestore database.

#### Request Body

- `url` (required): Must be a valid BikeReg.com URL

#### Example Request

```http
POST https://b2c2-events-api.vercel.app/api/submitEvent
```

#### Success Response

```json
{
  "success": true,
  "eventId": "69168"
}
```

#### Duplicate Event Response

```json
{
  "message": "Event already exists",
  "eventId": "69177"
}
```

#### Error Response

```json
{
  "error": "Invalid URL. Only bikereg.com URLs are allowed"
}
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm
- Vercel CLI
- Firebase project with Firestore database

### Available Scripts

- `npm run dev`: Start local development server using Vercel
- `npm run deploy`: Deploy to Vercel production environment
- `npm run lint`: Run ESLint for TypeScript files
- `npm run format`: Format code using Prettier
- `npm run type-check`: Run TypeScript type checking
- `npm run test`: Run unit and integration tests

### CI/CD

The project uses GitHub Actions for continuous integration, running the following checks on push and pull requests:

- npm installation
- Linting
- Type checking
- Unit and Integration tests

### Configuration

#### Firebase

- Currently using Firebase Firestore (Free Tier)
- Database credentials are stored in Vercel environment variables

#### Environment Variables Required

- Firebase configuration/credentials (stored in Vercel)

### Testing

#### Unit Testing

Unit tests have been written for all serverless functions and utility functions, mocking dependencies like Firestore and the BikeReg API. These tests focus on the main use cases for core coverage.

#### Integration Testing

Integration tests have been set up for Firebase Firestore, using the Firebase Admin SDK and Firestore Emulator. These tests require the following environment configuration:

- Create a `.env.test` file with the following content:

  ```env
  FIRESTORE_EMULATOR_HOST=localhost:8080
  FIREBASE_PROJECT_ID=b2c2-event-calendar
  USE_FIRESTORE_EMULATOR=true
  NODE_ENV=test
  ```

### Local Development with Firestore Emulator

To run integration tests locally, ensure the Firebase Firestore Emulator is running. You can start it by following these steps:

1. Start the emulator with the Firebase CLI:

   ```bash
   firebase emulators:start --only firestore
   ```

2. Ensure that the `.env.test` file is configured properly and that the emulator is running.

## Security Notes

- API validates BikeReg URLs before processing.
- Events are stored in typed collections in Firestore.
- Firebase credentials should be kept secure in Vercel environment variables.

## Project Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── ci.yml
├── api/
│   ├── hello.ts
│   ├── getEventsByType.ts
│   └── submitEvent.ts
├── src/
│   └── types/
│       └── index.ts
├── .env.example
├── .env.test
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## System Architecture

![B2C2CalendarSystemDesign drawio (2)](https://github.com/user-attachments/assets/fdc9ae94-d61d-47d9-bc89-00886d799107)
