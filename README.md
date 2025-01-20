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

### CI/CD

The project uses GitHub Actions for continuous integration, running the following checks on push and pull requests:

- npm installation
- Linting
- Type checking

### Configuration

#### Firebase

- Currently using Firebase Firestore (Free Tier)
- Database credentials are stored in Vercel environment variables

#### Environment Variables Required

- Firebase configuration/credentials (stored in Vercel)

## Security Notes

- API validates BikeReg URLs before processing
- Events are stored in typed collections in Firestore
- Firebase credentials should be kept secure in Vercel environment variables

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

## Future Considerations

- Consider implementing rate limiting
- Add authentication for protected endpoints
- Implement caching for frequently accessed data
- Add monitoring and logging solutions

For questions or issues, please open a GitHub issue in the repository.
