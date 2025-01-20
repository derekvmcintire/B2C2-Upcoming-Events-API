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
