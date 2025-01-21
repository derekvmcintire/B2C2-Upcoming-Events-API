import { type EventType, type GraphQLResponse } from '../types';

/**
 * Fetches event data from an the outsideapi GraphQL API using the provided URL.
 *
 * @param {string} url - The URL of the event to fetch.
 * @returns {Promise<EventType | null>} A promise that resolves to the event data if found, or `null` if no event is found.
 *
 * @example
 * const event = await fetchEventData('https://example.com/event-url');
 * if (event) {
 *   console.log(`Event Name: ${event.name}`);
 * } else {
 *   console.log('No event found for the provided URL');
 * }
 */
export async function fetchEventData(url: string): Promise<EventType | null> {
  const response = await fetch('https://outsideapi.com/fed-gw/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetAthleticEventByUrl($url: String!) {
          athleticEventByURL(url: $url) {
            eventId
            name
            date
            city
            state
            eventUrl
          }
        }
      `,
      variables: { url },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;
  return result.data?.athleticEventByURL || null;
}
