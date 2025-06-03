export interface Concert {
  id: string; // UUID format
  event: string;
  location: string;
  city: string;
  country: string;
  image: string;
  date: string;
  artists: string[];
  genres: string[];
  interestedCount?: number;
  rating?: number;
}

export interface ConcertResponse {
  concerts: Concert[];
}
