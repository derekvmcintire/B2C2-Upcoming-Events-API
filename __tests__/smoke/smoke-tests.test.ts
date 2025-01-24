import { exec } from 'child_process';
import fetch from 'cross-fetch';
import dotenv from 'dotenv';

if (process.env.CI !== 'true') {
  dotenv.config({ path: '.env.test' });
}

const API_BASE_URL = process.env.API_URL;
const API_SECRET_KEY = process.env.API_SECRET_KEY;

if (!API_BASE_URL) {
  throw new Error('API_URL is not defined in CI or local environment');
}

if (!API_SECRET_KEY) {
  throw new Error('API_SECRET_KEY is not defined in CI or local environment');
}

describe('Smoke Tests', () => {
  beforeAll(async () => {
    console.log('Environment check:');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('API_SECRET_KEY exists:', !!API_SECRET_KEY);
    console.log('Waiting for the server to start...');
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
  });

  it('should perform a smoke test', async () => {
    console.log('Making request to hello endpoint...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/hello`, {
        headers: {
          'x-api-key': API_SECRET_KEY,
          Accept: 'application/json',
        },
      });

      if (response.status !== 200) {
        const text = await response.text();
        console.log('Response status:', response.status);
        console.log('Response body:', text);
      }

      expect(response.status).toBe(200);
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  });
});
