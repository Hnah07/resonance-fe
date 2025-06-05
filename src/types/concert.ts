export type EventType = "concert" | "festival" | "tour" | "other";

export interface Event {
  id: string;
  name: string;
  type: EventType;
  description: string;
  start_date: string;
  end_date: string;
  image?: string;
}

export interface ConcertProperties {
  id: string; // UUID format
  event: Event | string; // Either a full Event object or just the event name
  location: {
    id: string;
    name: string;
    image?: string;
  };
  city: string;
  country: string;
  date: string; // The specific date of this concert
  image: string;
  artists: string[];
  genres: string[];
  //   interestedCount?: number;
  //   rating?: number;
}

export interface ConcertResponse {
  concerts: ConcertProperties[];
}

export interface ApiConcert {
  id: string;
  event: Event | string;
  location: {
    id: string;
    name: string;
    city: string;
    country: string;
    image?: string;
  };
  date: string;
  image?: string;
  artists: string[];
  genres: string[];
}

export interface ApiConcertResponse {
  data: ApiConcert[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ApiLocationResponse {
  data: {
    id: string;
    name: string;
    city: string;
    country: string;
    type: string;
    image?: string;
  };
}
