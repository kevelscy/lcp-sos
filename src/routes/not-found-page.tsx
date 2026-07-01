import { Navigate } from 'react-router-dom'

/** Fallback for any unmatched route; redirects to the app root. */
export function NotFoundPage() {
  return <Navigate to="/" replace />
}
