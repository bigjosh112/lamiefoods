/** ISO-8601 timestamp string, e.g. "2026-09-05T10:15:00.000Z". */
export type IsoDateString = string;

/** Amount in kobo (the minor unit of the Nigerian naira). Avoids float drift. */
export type Kobo = number;

export type CurrencyCode = "NGN";

export interface Money {
  /** Integer amount in the currency's minor unit. */
  amount: Kobo;
  currency: CurrencyCode;
}

export interface ImageAsset {
  url: string;
  /** Descriptive alt text. Required so images stay accessible by default. */
  alt: string;
  width?: number;
  height?: number;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}
