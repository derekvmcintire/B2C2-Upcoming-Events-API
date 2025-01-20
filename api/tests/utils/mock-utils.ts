import { VercelResponse } from '@vercel/node';
import { EventType } from '../../../src/types';

export const createMockResponse = (): VercelResponse => {
  const json = jest.fn();
  const status = jest.fn((statusCode: number) => {
    mockResponse.statusCode = statusCode;
    return mockResponse;
  });

  const mockResponse = {
    statusCode: 200,
    status,
    json,
    setHeader: jest.fn(),
    getHeader: jest.fn(),
    end: jest.fn(),
    send: jest.fn(),
  } as unknown as VercelResponse;

  return mockResponse;
};

export const mockEvents: EventType[] = [
  {
    eventId: '1',
    eventType: 'road',
    name: 'Marathon',
    date: '2025-01-02',
    city: 'Boston',
    state: 'MA',
    eventUrl: 'https://example.com/marathon',
  },
  {
    eventId: '2',
    eventType: 'road',
    name: '10K Run',
    date: '2025-01-03',
    city: 'New York',
    state: 'NY',
    eventUrl: 'https://example.com/10k',
  },
];
