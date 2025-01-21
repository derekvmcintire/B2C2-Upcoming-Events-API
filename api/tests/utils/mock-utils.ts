import { type VercelResponse } from '@vercel/node';
import { type EventType } from '../../../src/types';

/**
 * Creates a mock VercelResponse object for testing.
 * Implements common response methods and maintains chainable interface.
 *
 * @returns {VercelResponse} A mocked response object with jest.fn() methods
 *
 * Methods:
 * - status(): Sets response status code
 * - json(): Returns JSON response
 * - setHeader(): Mock header setter
 * - getHeader(): Mock header getter
 * - send(): Mock send
 * - end(): Mock end
 */
export const createMockResponse = (): VercelResponse => {
  const res: Partial<VercelResponse> = {};
  let statusCode: number = 200;

  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockImplementation((code: number) => {
    statusCode = code;
    return res;
  });

  res.statusCode = statusCode;
  res.setHeader = jest.fn().mockReturnValue(res);
  res.getHeader = jest.fn().mockReturnValue('');
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);

  return res as VercelResponse;
};

/**
 * Sample event data for testing.
 * Each event includes all required fields from EventType.
 */
export const mockEvents: EventType[] = [
  {
    eventId: '1',
    eventType: 'road',
    name: 'Wells Ave',
    date: '2025-03-30',
    city: 'Newton',
    state: 'MA',
    eventUrl: 'https://bikereg.com/wells',
  },
  {
    eventId: '2',
    eventType: 'road',
    name: 'Devens',
    date: '2025-07-26',
    city: 'Devens',
    state: 'MA',
    eventUrl: 'https://bikereg.com/devens',
  },
];
