export type EventDiscipline = 'road' | 'cx' | 'xc' | 'special';

export interface EventType {
  eventId: string;
  eventType: EventDiscipline;
  name: string;
  date: string;
  city: string;
  state: string;
  eventUrl?: string;
  interestedRiders?: string[];
  committedRiders?: string[];
  housingUrl?: string;
  description?: string;
  labels?: string[];
  carpools?: Carpool[];
  housing?: Housing;
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

export type Carpool = {
  name: string;
  seats: number;
  riders: string[];
};

export type Housing = {
  committed?: string[];
  interested?: string[];
};
