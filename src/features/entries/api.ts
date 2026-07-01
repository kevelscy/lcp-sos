import { createResourceApi } from '@/shared/api/resource-factory'
import type { CreateEntryDTO, Entry, UpdateEntryDTO } from '@/features/entries/types'

/**
 * Entries CRUD client (donations RECEIVED from donors).
 *
 * basePath is `/bo/donations/entries` (same `/bo/donations/*` module family
 * confirmed for Persons/Items/Inventory in prior batches).
 *
 * `getAll()` (from `createResourceApi`) already accepts arbitrary query
 * params, so `itemId`/`donorId` filters are supported without a bespoke
 * wrapper — see `useEntries` in `hooks.ts`.
 */
export const entriesApi = createResourceApi<Entry, CreateEntryDTO, UpdateEntryDTO>(
  '/bo/donations/entries'
)
