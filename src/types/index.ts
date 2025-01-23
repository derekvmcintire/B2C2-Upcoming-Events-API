export interface EventType {
  eventId: string;
  eventType: 'road' | 'cx' | 'xc';
  name: string;
  date: string;
  city: string;
  state: string;
  eventUrl: string;
  interestedRiders?: string[];
  housingUrl?: string;
}

export interface EventData {
  eventId: string;
  name: string;
  date: string;
  city: string;
  state: string;
  eventUrl: string;
  eventType: 'road' | 'cx' | 'xc';
}

export interface SubmitEventRequest {
  url: string;
  eventType: 'road' | 'cx' | 'xc';
}

export interface GraphQLResponse {
  data?: {
    athleticEventByURL?: EventType;
  };
}

export interface GetEventsQuery {
  type: string;
  startDate: string;
}
