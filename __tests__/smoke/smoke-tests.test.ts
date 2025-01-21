import dotenv from 'dotenv';

// Load the .env.test file
dotenv.config({ path: '.env.test' });

const API_BASE_URL = process.env.API_URL;

console.log("API_BASE_URL in the smoke test file is: ", API_BASE_URL)

if (!API_BASE_URL) {
  throw new Error('API_URL is not defined in CI or local environment');
}

describe('Smoke Tests', () => {
  it('should perform a smoke test', async () => {
    console.log("Making request to hello endpoint...");
    const response = await fetch(`${API_BASE_URL}/api/hello`);
    expect(response.status).toBe(200);
  });
});
