import { type Event, type GraphQLResponse } from '../types';

export async function fetchEventData(url: string): Promise<Event | null> {
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
