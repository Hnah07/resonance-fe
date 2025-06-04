export interface ConcertProperties {
  id: string; // UUID format
  event: string;
  location: string;
  city: string;
  country: string;
  image: string;
  date: string;
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
  event: string;
  location: string;
  city: string;
  country: string;
  date: string;
  image?: string;
  artists?: string[];
  genres?: string[];
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
