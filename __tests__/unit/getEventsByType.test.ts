import { type VercelRequest } from '@vercel/node';
import { validateEventQuery } from '../../src/utils/validation';
import { getCurrentDate } from '../../src/utils/dates';
import { fetchEventsByType } from '../../src/utils/firebase';
import { corsMiddleware } from '../../src/middleware/cors';
import getEventsByType from '../../api/getEventsByType';
import { createMockResponse, mockEvents } from './utils/mock-utils';

jest.mock('../../src/middleware/cors', () => ({
  corsMiddleware: jest.fn((_req, _res, next) => next()),
}));

jest.mock('../../src/utils/validation', () => ({
  validateEventQuery: jest.fn(),
}));

jest.mock('../../src/utils/dates', () => ({
  getCurrentDate: jest.fn(),
}));

jest.mock('../../src/utils/firebase', () => ({
  fetchEventsByType: jest.fn(),
}));

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
