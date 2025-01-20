import { VercelRequest, VercelResponse } from '@vercel/node';
import { EventType } from '../src/types'; // Adjust the import path based on your file structure
import { validateEventQuery } from '../src/utils/validation';
import { getCurrentDate } from '../src/utils/dates';
import { fetchEventsByType } from '../src/utils/firebase';
import { corsMiddleware } from '../src/middleware/cors';
import getEventsByType from './getEventsByType';

jest.mock('../src/middleware/cors', () => ({
  corsMiddleware: jest.fn((_req, _res, next) => next()),
}));

jest.mock('../src/utils/validation', () => ({
  validateEventQuery: jest.fn(),
}));

jest.mock('../src/utils/dates', () => ({
  getCurrentDate: jest.fn(),
}));

jest.mock('../src/utils/firebase', () => ({
  fetchEventsByType: jest.fn(),
}));

const createMockResponse = (): VercelResponse => {
  const json = jest.fn();
  const status = jest.fn((statusCode: number) => {
    mockResponse.statusCode = statusCode; // Set the statusCode on the response
    return mockResponse; // Return the mock response for chaining
  });

  const mockResponse = {
    statusCode: 200, // Default statusCode
    status,
    json,
    setHeader: jest.fn(),
    getHeader: jest.fn(),
    end: jest.fn(),
    send: jest.fn(),
  } as unknown as VercelResponse;

  return mockResponse;
};

const mockEvents: EventType[] = [
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

describe('getEventsByType', () => {
  it('should respond with events when query is valid', async () => {
    const mockRequest = {
      method: 'GET',
      query: {
        type: 'road',
        startDate: '2025-01-01',
      },
    } as Partial<VercelRequest> as VercelRequest;

    const mockResponse = createMockResponse();

    (validateEventQuery as jest.Mock).mockReturnValue(null);
    (getCurrentDate as jest.Mock).mockReturnValue('2025-01-01');
    (fetchEventsByType as jest.Mock).mockResolvedValue(mockEvents);

    await getEventsByType(mockRequest, mockResponse);

    expect(corsMiddleware).toHaveBeenCalled();
    expect(validateEventQuery).toHaveBeenCalledWith({
      type: 'road',
      startDate: '2025-01-01',
    });
    expect(fetchEventsByType).toHaveBeenCalledWith('road', '2025-01-01');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ events: mockEvents });
  });

  it('should return 400 if validation fails', async () => {
    const mockRequest = {
      method: 'GET',
      query: {
        type: '', // Invalid type
        startDate: 'invalid-date',
      },
    } as Partial<VercelRequest> as VercelRequest;

    const mockResponse = createMockResponse();

    (validateEventQuery as jest.Mock).mockReturnValue('Invalid query parameters');

    await getEventsByType(mockRequest, mockResponse);

    expect(validateEventQuery).toHaveBeenCalledWith({
      type: '',
      startDate: 'invalid-date',
    });
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid query parameters' });
  });
});
