import { type SubmitEventRequest } from '../types';

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
