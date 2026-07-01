import type { Item } from '@/features/items/types'

/** Read-only stock snapshot for an item: entries in, exits out, net available. */
export interface InventoryItem {
  item: Item
  totalEntries: number
  totalExits: number
  available: number
}
