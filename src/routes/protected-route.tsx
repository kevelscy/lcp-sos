import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '@/shared/stores/auth-store'

/** Guards nested routes: redirects to `/login` unless a session is active. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
