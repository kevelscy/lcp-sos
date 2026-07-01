import { useMemo } from 'react'

import { inventoryApi } from '@/features/inventory/api'
import type { InventoryItem } from '@/features/inventory/types'
import { useResourceList, type UseResourceListOptions } from '@/shared/hooks/use-resource'

export interface InventoryFilters {
  name?: string
  barcode?: string
}

/**
 * Read-only inventory list hook: pagination plus `name`/`barcode` filters.
 *
 * NOTE: unlike `usePersons`/`useItems`, this does NOT use `useResourceList`'s
 * built-in debounced `search` (which sends a generic `?search=` param) — the
 * confirmed inventory endpoint only accepts the structured `name`/`barcode`
 * params, so both are passed as `filters` and debounced by the caller
 * (`SearchBar` already debounces its own `onChange`).
 */
export function useInventory(
  filters?: InventoryFilters,
  options?: Pick<UseResourceListOptions, 'pageSize'>
) {
  const mergedFilters = useMemo(() => {
    const result: Record<string, string> = {}
    if (filters?.name) result.name = filters.name
    if (filters?.barcode) result.barcode = filters.barcode
    return Object.keys(result).length > 0 ? result : undefined
  }, [filters?.name, filters?.barcode])

  return useResourceList<InventoryItem>(inventoryApi, { ...options, filters: mergedFilters })
}
