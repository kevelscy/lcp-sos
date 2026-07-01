import type { Item } from '@/features/items/types'
import type { Person } from '@/features/persons/types'

/**
 * An exit: donation DELIVERED to a beneficiary/recipient.
 *
 * `item`/`recipient` are always expanded by the backend on read — no extra
 * fetch needed to display item/recipient details on the list or edit pages.
 *
 * NOTE: audit field shape mirrors the confirmed Persons/Items/Entries
 * contract (`createdBy`/`updatedBy` as `number`, nullable `updatedAt`).
 */
export interface Exit {
  id: number
  itemId: number
  recipientId: number | null
  quantity: number
  notes: string | null
  item: Item
  recipient: Person | null
  createdAt: string
  createdBy: number
  updatedAt: string | null
  updatedBy: number | null
  archivedAt: string | null
  archivedBy: number | null
}

export interface CreateExitDTO {
  itemId: number
  quantity: number
  recipientId?: number | null
  notes?: string | null
}

/** `itemId` cannot be changed on an existing exit — the backend rejects it. */
export interface UpdateExitDTO {
  quantity: number
  recipientId?: number | null
  notes?: string | null
}
