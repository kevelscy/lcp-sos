import { createResourceApi } from '@/shared/api/resource-factory'
import type { CreateExitDTO, Exit, UpdateExitDTO } from '@/features/exits/types'

/**
 * Exits CRUD client (donations DELIVERED to beneficiaries).
 *
 * basePath is `/bo/donations/exits` (same `/bo/donations/*` module family
 * confirmed for Persons/Items/Inventory/Entries in prior batches).
 *
 * `getAll()` (from `createResourceApi`) already accepts arbitrary query
 * params, so `itemId`/`recipientId` filters are supported without a bespoke
 * wrapper — see `useExits` in `hooks.ts`.
 */
export const exitsApi = createResourceApi<Exit, CreateExitDTO, UpdateExitDTO>(
  '/bo/donations/exits'
)
