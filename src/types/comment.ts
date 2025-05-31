export interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  text: string;
  date: string;
  time: string;
}
