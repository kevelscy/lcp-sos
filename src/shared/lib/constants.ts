/**
 * API base URL. Overridable via `VITE_API_BASE_URL` env var.
 * In development the Vite dev server proxies `/api` to the backend (see vite.config.ts).
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

/**
 * localStorage key used to persist the auth state (Zustand `persist` middleware).
 * Shared between `src/shared/api/client.ts` and `src/features/auth/store.ts`
 * so the Axios interceptor can read the token without importing the auth feature.
 */
export const AUTH_STORAGE_KEY = 'lcp-inventary-auth'

/** Default page size for paginated resource lists. */
export const DEFAULT_PAGE_SIZE = 20
