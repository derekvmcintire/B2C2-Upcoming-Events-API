const API_BASE_URL = process.env.API_URL;

if (!API_BASE_URL) {
  throw new Error('API_URL is not defined in CI or local environment');
}

describe('Smoke Tests', () => {
  it('GET /hello should return 200', async () => {
    const response = await fetch(`${API_BASE_URL}/hello`);
    expect(response.status).toBe(200);
  });
});
