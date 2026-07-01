import { useEffect, useMemo, useState } from 'react'

import { personsApi } from '@/features/persons/api'
import type { CreatePersonDTO, Person, UpdatePersonDTO } from '@/features/persons/types'
import {
  extractErrorMessage,
  useResourceList,
  useResourceMutation,
  type UseResourceListOptions,
} from '@/shared/hooks/use-resource'

export interface PersonFilters {
  dni?: string
}

/** List hook: paginated, debounced free-text search, plus an optional DNI filter. */
export function usePersons(
  filters?: PersonFilters,
  options?: Pick<UseResourceListOptions, 'pageSize'>
) {
  const mergedFilters = useMemo(() => {
    if (!filters?.dni) return undefined
    return { dni: filters.dni }
  }, [filters?.dni])

  return useResourceList<Person>(personsApi, { ...options, filters: mergedFilters })
}

interface UsePersonReturn {
  data: Person | null
  loading: boolean
  error: string | null
  notFound: boolean
}

/** Fetches a single person by id. Distinguishes 404 (`notFound`) from other errors. */
export function usePerson(id: number | string | undefined): UsePersonReturn {
  const [data, setData] = useState<Person | null>(null)
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
        const person = await personsApi.getById(id as number | string)
        if (!cancelled) setData(person)
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

export function useCreatePerson() {
  const { create, submitting } = useResourceMutation<Person, CreatePersonDTO, UpdatePersonDTO>(
    personsApi
  )
  return { createPerson: create, submitting }
}

export function useUpdatePerson() {
  const { update, submitting } = useResourceMutation<Person, CreatePersonDTO, UpdatePersonDTO>(
    personsApi
  )
  return { updatePerson: update, submitting }
}

export function useArchivePerson() {
  const { archive, submitting } = useResourceMutation<Person, CreatePersonDTO, UpdatePersonDTO>(
    personsApi
  )
  return { archivePerson: archive, submitting }
}
