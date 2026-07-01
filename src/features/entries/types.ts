import type { Item } from '@/features/items/types'
import type { Person } from '@/features/persons/types'

/**
 * An entry: donation RECEIVED from a donor.
 *
 * `item`/`donor` are always expanded by the backend on read — no extra fetch
 * needed to display item/donor details on the list or edit pages.
 *
 * NOTE: audit field shape mirrors the confirmed Persons/Items contract
 * (`createdBy`/`updatedBy` as `number`, nullable `updatedAt`).
 */
export interface Entry {
  id: number
  itemId: number
  donorId: number | null
  quantity: number
  notes: string | null
  item: Item
  donor: Person | null
  createdAt: string
  createdBy: number
  updatedAt: string | null
  updatedBy: number | null
  archivedAt: string | null
  archivedBy: number | null
}

export interface CreateEntryDTO {
  itemId: number
  quantity: number
  donorId?: number | null
  notes?: string | null
}

/** `itemId` cannot be changed on an existing entry — the backend rejects it. */
export interface UpdateEntryDTO {
  quantity: number
  donorId?: number | null
  notes?: string | null
}
