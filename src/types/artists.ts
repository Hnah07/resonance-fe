export interface Genre {
  id: string;
  name: string;
}

export interface Artist {
  id: string;
  name: string;
  description: string;
  country: string;
  formed_year: number;
  image_url: string;
  source: string;
  status: string;
  genres: Genre[];
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface ApiArtistResponse {
  data: Artist[];
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

export interface ApiGenreResponse {
  data: Genre[];
}
