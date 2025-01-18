import { GetEventsQuery, type SubmitEventRequest } from '../types';

export function validateEventType(eventType: string): boolean {
  return ['road', 'cx', 'xc'].includes(eventType);
}

export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'www.bikereg.com';
  } catch {
    return false;
  }
}

export function validateRequest(req: SubmitEventRequest): string | null {
  if (!req.url || !req.eventType) {
    return 'Missing required fields';
  }

  if (!validateEventType(req.eventType)) {
    return 'Invalid event type';
  }

  if (!validateUrl(req.url)) {
    return 'Invalid URL. Only bikereg.com URLs are allowed';
  }

  return null;
}

export function validateEventQuery(query: GetEventsQuery): string | null {
  const { type, startDate } = query;

  if (!type || typeof type !== 'string' || !['road', 'cx', 'xc'].includes(type.toLowerCase())) {
    return 'Invalid event type. Must be one of: road, cx, xc';
  }

  if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate.toString())) {
    return 'Invalid date format. Use YYYY-MM-DD';
  }

  return null;
}
