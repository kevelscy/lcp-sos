import { apiClient } from '@/shared/api/client'
import type { LoginCredentials, LoginResponse } from '@/features/auth/types'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials
    )
    return data
  },
}
