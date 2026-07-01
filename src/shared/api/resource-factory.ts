import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/lib/types'

/** Query params accepted by a resource list endpoint. */
export interface ResourceListParams {
  limit?: number
  page?: number
  [key: string]: string | number | undefined
}

/** Generic CRUD contract returned by `createResourceApi`. */
export interface ResourceApi<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  getAll: (params?: ResourceListParams) => Promise<PaginatedResponse<T>>
  getById: (id: number | string) => Promise<T>
  create: (data: CreateDTO) => Promise<T>
  update: (id: number | string, data: UpdateDTO) => Promise<T>
  archive: (id: number | string) => Promise<void>
}

/**
 * Builds a typed CRUD client for a REST resource.
 *
 * NOTE: `archive` assumes a `POST {basePath}/{id}/archivar` soft-delete
 * endpoint (Spanish domain naming, consistent with `/personas`, `/articulos`,
 * `/entradas`, `/salidas`). Adjust if the backend contract differs — see
 * design.md Open Questions.
 */
export function createResourceApi<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>(
  basePath: string
): ResourceApi<T, CreateDTO, UpdateDTO> {
  return {
    async getAll(params) {
      const { data } = await apiClient.get<PaginatedResponse<T>>(basePath, {
        params,
      })
      return data
    },

    async getById(id) {
      const { data } = await apiClient.get<T>(`${basePath}/${id}`)
      return data
    },

    async create(payload) {
      const { data } = await apiClient.post<T>(basePath, payload)
      return data
    },

    async update(id, payload) {
      const { data } = await apiClient.put<T>(`${basePath}/${id}`, payload)
      return data
    },

    async archive(id) {
      await apiClient.put(`${basePath}/${id}/archive`)
    },
  }
}
