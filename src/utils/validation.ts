import { EventDiscipline, GetEventsQuery, type SubmitEventRequest } from '../types';

/**
 * Validates if the given event type is one of the allowed types.
 *
 * @param {string} eventType - The event type to validate.
 * @returns {boolean} True if the event type is valid, otherwise false.
 */
export function validateEventType(eventType: string): boolean {
  return ['road', 'cx', 'xc'].includes(eventType);
}

/**
 * Validates if the given URL is a valid URL and belongs to 'www.bikereg.com'.
 *
 * @param {string} url - The URL to validate.
 * @returns {boolean} True if the URL is valid and belongs to bikereg.com, otherwise false.
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'www.bikereg.com';
  } catch {
    return false;
  }
}

/**
 * Validates the given request for required fields and proper values.
 *
 * @param {SubmitEventRequest} req - The request object to validate.
 * @returns {string | null} A string describing the validation error, or null if the request is valid.
 */
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

/**
 * Validates the query object for fetching events.
 *
 * @param {GetEventsQuery} query - The query object to validate.
 * @returns {string | null} A string describing the validation error, or null if the query is valid.
 */
export function validateEventQuery(query: GetEventsQuery): string | null {
  const { type, startDate } = query;

  // Use the type to validate directly
  if (
    !type ||
    !(['road', 'cx', 'xc', 'special'] as EventDiscipline[]).includes(
      type.toLowerCase() as EventDiscipline
    )
  ) {
    return 'Invalid event type. Must be one of: road, cx, xc, special';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate.toString())) {
    return 'Invalid date format. Use YYYY-MM-DD';
  }

  return null;
}
