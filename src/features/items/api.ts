import { createResourceApi } from '@/shared/api/resource-factory'
import type { CreateItemDTO, Item, UpdateItemDTO } from '@/features/items/types'

/**
 * Items CRUD client.
 *
 * basePath is `/bo/donations/items` (backend-office donations module),
 * confirmed backend route (same module family as `/bo/donations/persons`).
 *
 * `getAll()` (from `createResourceApi`) already accepts arbitrary query
 * params, so the `barcode` filter is supported without a bespoke wrapper —
 * see `useItems` in `hooks.ts`.
 */
export const itemsApi = createResourceApi<Item, CreateItemDTO, UpdateItemDTO>(
  '/bo/donations/items'
)
