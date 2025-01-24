import { SubmitEventRequest, GetEventsQuery } from '../../../src/types';
import {
  validateEventType,
  validateUrl,
  validateRequest,
  validateEventQuery,
} from '../../../src/utils/validation';

describe('Utility Functions', () => {
  describe('validateEventType', () => {
    it('should return true for valid event types', () => {
      expect(validateEventType('road')).toBe(true);
      expect(validateEventType('cx')).toBe(true);
      expect(validateEventType('xc')).toBe(true);
    });

    it('should return false for invalid event types', () => {
      expect(validateEventType('invalid')).toBe(false);
      expect(validateEventType('running')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should return true for valid bikereg.com URLs', () => {
      expect(validateUrl('https://www.bikereg.com')).toBe(true);
      expect(validateUrl('https://www.bikereg.com/some-event')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validateUrl('https://www.example.com')).toBe(false);
      expect(validateUrl('not-a-url')).toBe(false);
    });

    it('should return false for URLs not on bikereg.com', () => {
      expect(validateUrl('https://www.google.com')).toBe(false);
      expect(validateUrl('https://bikereg.org')).toBe(false);
    });
  });

  describe('validateRequest', () => {
    const validRequest: SubmitEventRequest = {
      url: 'https://www.bikereg.com/some-event',
      eventType: 'road',
    };

    it('should return null for valid requests', () => {
      expect(validateRequest(validRequest)).toBe(null);
    });

    it('should return "Missing required fields" for missing fields', () => {
      const incompleteRequest = { url: '', eventType: '' };
      expect(validateRequest(incompleteRequest as SubmitEventRequest)).toBe(
        'Missing required fields'
      );
    });

    it('should return "Invalid event type" for an invalid event type', () => {
      const invalidEventTypeRequest = { ...validRequest, eventType: 'invalid' };
      expect(validateRequest(invalidEventTypeRequest as SubmitEventRequest)).toBe(
        'Invalid event type'
      );
    });

    it('should return "Invalid URL. Only bikereg.com URLs are allowed" for an invalid URL', () => {
      const invalidUrlRequest = { ...validRequest, url: 'https://www.example.com' };
      expect(validateRequest(invalidUrlRequest)).toBe(
        'Invalid URL. Only bikereg.com URLs are allowed'
      );
    });
  });

  describe('validateEventQuery', () => {
    it('should return null for valid event queries', () => {
      const validQuery: GetEventsQuery = { type: 'road', startDate: '2025-01-20' };
      expect(validateEventQuery(validQuery)).toBe(null);
    });

    it('should return an error message for invalid event type in query', () => {
      const invalidTypeQuery: GetEventsQuery = { type: 'invalid', startDate: '2025-01-20' };
      expect(validateEventQuery(invalidTypeQuery)).toBe(
        'Invalid event type. Must be one of: road, cx, xc, special'
      );
    });

    it('should return an error message for invalid date format in query', () => {
      const invalidDateQuery: GetEventsQuery = { type: 'road', startDate: '01-20-2025' };
      expect(validateEventQuery(invalidDateQuery)).toBe('Invalid date format. Use YYYY-MM-DD');
    });
  });
});
