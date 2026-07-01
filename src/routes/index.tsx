import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@/features/auth'
import { EntriesListPage } from '@/features/entries'
import { ExitsListPage } from '@/features/exits'
import { InventoryListPage } from '@/features/inventory'
import { ItemsListPage } from '@/features/items'
import { PersonsListPage } from '@/features/persons'
import { NotFoundPage } from '@/routes/not-found-page'
import { ProtectedRoute } from '@/routes/protected-route'
import { AppLayout } from '@/shared/layouts'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/inventory" replace /> },
          { path: 'inventory', element: <InventoryListPage /> },
          { path: 'entries', element: <EntriesListPage /> },
          { path: 'exits', element: <ExitsListPage /> },
          { path: 'items', element: <ItemsListPage /> },
          { path: 'persons', element: <PersonsListPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
