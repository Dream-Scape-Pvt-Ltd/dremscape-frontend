export interface SearchResultItem {
  id: string;
  type: "trek" | "destination" | "region" | "blog";
  title: string;
  subtitle: string;
  url: string;
  imageUrl?: string;
}
