export interface ReviewItem {
  id: string;
  authorName: string;
  authorCountry: string;
  trekTitle: string;
  rating: number;
  date: string;
  content: string;
  guideName?: string;
  verified: boolean;
}
