import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@/features/auth'
import {
  CreateEntryPage,
  EditEntryPage,
  EntriesListPage,
} from '@/features/entries'
import { CreateExitPage, EditExitPage, ExitsListPage } from '@/features/exits'
import { InventoryListPage } from '@/features/inventory'
import { CreateItemPage, EditItemPage, ItemsListPage } from '@/features/items'
import {
  CreatePersonPage,
  EditPersonPage,
  PersonsListPage,
} from '@/features/persons'
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
          { path: 'entries/new', element: <CreateEntryPage /> },
          { path: 'entries/:id/edit', element: <EditEntryPage /> },
          { path: 'exits', element: <ExitsListPage /> },
          { path: 'exits/new', element: <CreateExitPage /> },
          { path: 'exits/:id/edit', element: <EditExitPage /> },
          { path: 'persons', element: <PersonsListPage /> },
          { path: 'persons/new', element: <CreatePersonPage /> },
          { path: 'persons/:id/edit', element: <EditPersonPage /> },
          { path: 'items', element: <ItemsListPage /> },
          { path: 'items/new', element: <CreateItemPage /> },
          { path: 'items/:id/edit', element: <EditItemPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
