import { getCurrentDate } from '../../../src/utils/dates';

describe('getCurrentDate', () => {
  it('should return the current date in YYYY-MM-DD format', () => {
    const currentDate = getCurrentDate();

    // Check if the returned date matches the expected format (YYYY-MM-DD)
    expect(currentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Optionally, check if the returned date is today's date (can be useful for testing)
    const today = new Date();
    const expectedDate = today.toISOString().split('T')[0];
    expect(currentDate).toBe(expectedDate);
  });
});
