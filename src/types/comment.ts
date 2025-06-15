export interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    username?: string;
    profile_photo_url?: string;
    image?: string;
  };
  text: string;
  comment?: string;
  created_at?: string;
  date: string;
  time: string;
}
