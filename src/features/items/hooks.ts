import { useEffect, useMemo, useState } from 'react'

import { itemsApi } from '@/features/items/api'
import type { CreateItemDTO, Item, UpdateItemDTO } from '@/features/items/types'
import {
  extractErrorMessage,
  useResourceList,
  useResourceMutation,
  type UseResourceListOptions,
} from '@/shared/hooks/use-resource'

export interface ItemFilters {
  barcode?: string
}

/** List hook: paginated, debounced free-text name search, plus an optional barcode filter. */
export function useItems(
  filters?: ItemFilters,
  options?: Pick<UseResourceListOptions, 'pageSize'>
) {
  const mergedFilters = useMemo(() => {
    if (!filters?.barcode) return undefined
    return { barcode: filters.barcode }
  }, [filters?.barcode])

  return useResourceList<Item>(itemsApi, { ...options, filters: mergedFilters })
}

interface UseItemReturn {
  data: Item | null
  loading: boolean
  error: string | null
  notFound: boolean
}

/** Fetches a single item by id. Distinguishes 404 (`notFound`) from other errors. */
export function useItem(id: number | string | undefined): UseItemReturn {
  const [data, setData] = useState<Item | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id == null) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const item = await itemsApi.getById(id as number | string)
        if (!cancelled) setData(item)
      } catch (err) {
        if (cancelled) return
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          setNotFound(true)
        } else {
          setError(extractErrorMessage(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error, notFound }
}

export function useCreateItem() {
  const { create, submitting } = useResourceMutation<Item, CreateItemDTO, UpdateItemDTO>(itemsApi)
  return { createItem: create, submitting }
}

export function useUpdateItem() {
  const { update, submitting } = useResourceMutation<Item, CreateItemDTO, UpdateItemDTO>(itemsApi)
  return { updateItem: update, submitting }
}

export function useArchiveItem() {
  const { archive, submitting } = useResourceMutation<Item, CreateItemDTO, UpdateItemDTO>(itemsApi)
  return { archiveItem: archive, submitting }
}
