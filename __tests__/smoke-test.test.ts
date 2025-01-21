import fetch from 'node-fetch'; // Native fetch API for Node.js

const API_BASE_URL = process.env.API_URL || 'http://your-api-url'; // Use an environment variable or default

describe('Smoke Tests', () => {
  it('GET /hello should return 200 and a valid response', async () => {
    const response = await fetch(`${API_BASE_URL}/hello`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined(); // Adjust based on expected response
  });

  it('GET /getEventsByType should return 200 and a valid response', async () => {
    const response = await fetch(`${API_BASE_URL}/getEventsByType`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined(); // Adjust based on expected response
  });
});
