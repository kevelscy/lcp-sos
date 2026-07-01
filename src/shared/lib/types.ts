/** Pagination metadata returned alongside a list of resources. */
export interface PaginationInfo {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/** Generic paginated API response envelope. */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo | null
}

/** Fields present on every audited (soft-deletable) entity. */
export interface AuditFields {
  id: number
  createdAt: string
  createdBy: string | null
  updatedAt: string
  updatedBy: string | null
  archivedAt: string | null
  archivedBy: string | null
}

/** Shape of an error response body returned by the backend. */
export interface ApiError {
  detail: string
}
