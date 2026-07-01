import { apiClient } from '@/shared/api/client'
import type { InventoryItem } from '@/features/inventory/types'
import type { ResourceListParams } from '@/shared/api/resource-factory'
import type { PaginatedResponse } from '@/shared/lib/types'

/**
 * Inventory is read-only (no create/update/archive), so it does not go
 * through `createResourceApi` — a direct GET call is all that's needed.
 * basePath is `/bo/donations/inventory`, confirmed backend route, accepting
 * `name`/`barcode`/`limit`/`page` query params.
 */
async function getAll(params?: ResourceListParams): Promise<PaginatedResponse<InventoryItem>> {
  const { data } = await apiClient.get<PaginatedResponse<InventoryItem>>(
    '/bo/donations/inventory',
    { params }
  )
  return data
}

/**
 * Exposes only `getAll`, matching the subset of `ResourceApi` that
 * `useResourceList` needs — lets the read-only inventory list reuse the
 * shared pagination/filters hook without a bespoke list-state implementation.
 */
export const inventoryApi = { getAll }
