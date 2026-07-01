import { createResourceApi } from '@/shared/api/resource-factory'
import type { CreatePersonDTO, Person, UpdatePersonDTO } from '@/features/persons/types'

/**
 * Persons CRUD client.
 *
 * NOTE: basePath is `/bo/donations/persons` (backend-office donations
 * module), not the Spanish `/personas` path assumed by `design.md`/the
 * tasks artifact — per orchestrator's explicit apply-batch instruction,
 * matching the confirmed backend route.
 *
 * `getAll()` (from `createResourceApi`) already accepts arbitrary query
 * params (`ResourceListParams`), so `names`/`dni` filters are supported
 * without a bespoke wrapper — see `usePersons` in `hooks.ts`.
 */
export const personsApi = createResourceApi<Person, CreatePersonDTO, UpdatePersonDTO>(
  '/bo/donations/persons'
)
