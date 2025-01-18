# B2C2-Upcoming-Events-API# Project Structure

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

# Configuration Files

## package.json

```json
{
  "name": "events-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel deploy --prod",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"**/*.{ts,json,md}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@vercel/node": "^3.0.0",
    "firebase-admin": "^11.11.0",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vercel": "^32.0.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["api/**/*", "src/**/*"],
  "exclude": ["node_modules"]
}
```

## .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

## .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## .gitignore

```
node_modules/
.env
.env.local
.vercel
dist/
.DS_Store
```

## vercel.json

```json
{
  "version": 2,
  "functions": {
    "api/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "env": {
    "FIRESTORE_KEY": "@firestore-key"
  }
}
```

## .env.example

```
FIRESTORE_KEY={"type":"service_account","project_id":"your-project","private_key_id":"..."}
```

## api/hello.ts

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function hello(req: VercelRequest, res: VercelResponse) {
  const { name = 'World' } = req.query;
  return res.json({
    message: `Hello ${name}!`,
  });
}
```

## src/types/index.ts

```typescript
export interface Event {
  eventId: string;
  eventType: 'road' | 'cx' | 'xc';
  name: string;
  date: string;
  city: string;
  state: string;
  eventUrl: string;
}

export interface SubmitEventRequest {
  url: string;
  eventType: 'road' | 'cx' | 'xc';
}
```

## .github/workflows/ci.yml

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
```
