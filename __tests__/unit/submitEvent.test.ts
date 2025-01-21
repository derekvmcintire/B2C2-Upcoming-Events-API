import { type VercelRequest } from '@vercel/node';
import { type EventType } from '../../src/types';
import { fetchEventData } from '../../src/utils/api';
import { storeEvent } from '../../src/utils/firebase';
import { validateRequest } from '../../src/utils/validation';
import { handleSubmitEvent } from '../../api/submitEvent';
import { createMockResponse, mockEvents } from './utils/mock-utils';

jest.mock('../../src/utils/validation', () => ({
  validateRequest: jest.fn(),
}));

jest.mock('../../src/utils/api', () => ({
  fetchEventData: jest.fn(),
}));

jest.mock('../../src/utils/firebase', () => ({
  storeEvent: jest.fn(),
}));

describe('submitEvent', () => {
  it('should submit an event successfully', async () => {
    const mockRequest = {
      method: 'POST',
      body: {
        url: 'https://bikereg.com/event',
        eventType: 'road',
      },
    } as VercelRequest;

    const mockResponse = createMockResponse();
    const mockEventData: EventType = mockEvents[0];

    (validateRequest as jest.Mock).mockReturnValue(null);
    (fetchEventData as jest.Mock).mockResolvedValue(mockEventData);
    (storeEvent as jest.Mock).mockResolvedValue({ isNew: true });

    await handleSubmitEvent(mockRequest, mockResponse);

    expect(validateRequest).toHaveBeenCalledWith(mockRequest.body);
    expect(fetchEventData).toHaveBeenCalledWith(mockRequest.body.url);
    expect(storeEvent).toHaveBeenCalledWith(mockEventData);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Event successfully added',
      eventId: mockEventData.eventId,
    });
  });

  it('should return 400 if validation fails', async () => {
    const mockRequest = {
      method: 'POST',
      body: {
        url: 'invalid-url',
        eventType: 'road',
      },
    } as Partial<VercelRequest> as VercelRequest;

    const mockResponse = createMockResponse();

    (validateRequest as jest.Mock).mockReturnValue('Invalid request data');

    await handleSubmitEvent(mockRequest, mockResponse);

    expect(validateRequest).toHaveBeenCalledWith(mockRequest.body);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid request data' });
  });

  it('should return 404 if event data is not found', async () => {
    const mockRequest = {
      method: 'POST',
      body: {
        url: 'https://bikereg.com/event',
        eventType: 'road',
      },
    } as Partial<VercelRequest> as VercelRequest;

    const mockResponse = createMockResponse();

    (validateRequest as jest.Mock).mockReturnValue(null);
    (fetchEventData as jest.Mock).mockResolvedValue(null); // Simulate no event found

    await handleSubmitEvent(mockRequest, mockResponse);

    expect(fetchEventData).toHaveBeenCalledWith(mockRequest.body.url);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Event not found' });
  });

  it('should return 409 if event already exists', async () => {
    const mockRequest = {
      method: 'POST',
      body: {
        url: 'https://bikereg.com/event',
        eventType: 'road',
      },
    } as Partial<VercelRequest> as VercelRequest;

    const mockResponse = createMockResponse();
    const mockEventData: EventType = mockEvents[1];

    (validateRequest as jest.Mock).mockReturnValue(null);
    (fetchEventData as jest.Mock).mockResolvedValue(mockEventData);
    (storeEvent as jest.Mock).mockResolvedValue({ isNew: false }); // Event already exists

    await handleSubmitEvent(mockRequest, mockResponse);

    expect(storeEvent).toHaveBeenCalledWith(mockEventData);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Event already exists',
      eventId: mockEventData.eventId,
    });
  });

  it('should return 405 if the method is not POST', async () => {
    const mockRequest = {
      method: 'GET',
      body: {},
    } as Partial<VercelRequest> as VercelRequest;

    const mockResponse = createMockResponse();

    await handleSubmitEvent(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(405);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });
});
