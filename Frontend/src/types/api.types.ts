/** Standard API response wrapper – maps to backend ResponseData<T> */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/** Pagination wrapper (if backend supports) */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}
