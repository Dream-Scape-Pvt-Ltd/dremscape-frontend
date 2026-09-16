export type SupportedCurrency = "USD" | "EUR" | "GBP" | "AUD" | "NPR";

export type UnitSystem = "metric" | "imperial";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
