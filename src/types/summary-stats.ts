export interface SummaryStats {
  concerts_this_year: number;
  total_concerts: number;
  countries_visited: number;
  countries_list: string[];
  favorite_genre: {
    genre: string;
    count: number;
  };
  most_seen_artist: {
    name: string;
    count: number;
  };
  top_venue: {
    name: string;
    count: number;
  };
}

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  profile_photo_path: string | null;
  profile_photo_url: string;
}

export interface MonthlyAttendance {
  month_number: number;
  month: string;
  count: number;
}

export interface GenreDistribution {
  genre: string;
  count: number;
}

export interface TopVenue {
  venue: string;
  count: number;
}

export interface TopArtist {
  artist: string;
  image: string;
  count: number;
}

export interface ProfileStats {
  followers_count: number;
  following_count: number;
  followers: UserSummary[];
  following: UserSummary[];
  monthly_attendance: MonthlyAttendance[];
  genre_distribution: GenreDistribution[];
  top_venues: TopVenue[];
  top_artists: TopArtist[];
}
