/**
 * A person entity (donor/beneficiary — role is contextual to entries/exits
 * linkage, not an explicit field; see design.md Open Questions).
 *
 * NOTE: audit field shape (`createdBy`/`updatedBy` as `number`, nullable
 * `updatedAt`) is confirmed for this endpoint and intentionally does NOT
 * reuse the shared `AuditFields` type from `src/shared/lib/types.ts`
 * (Phase 1's `AuditFields` assumed `string | null` audit actor fields before
 * the backend contract was confirmed).
 */
export interface Person {
  id: number
  names: string
  surnames: string
  dni: string | null
  phone: string | null
  address: string | null
  notes: string | null
  createdAt: string
  createdBy: number
  updatedAt: string | null
  updatedBy: number | null
  archivedAt: string | null
  archivedBy: number | null
}

export interface CreatePersonDTO {
  names: string
  surnames: string
  dni?: string | null
  phone?: string | null
  address?: string | null
  notes?: string | null
}

export type UpdatePersonDTO = CreatePersonDTO
