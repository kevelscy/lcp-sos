import { apiClient } from '@/shared/api/client'
import type { LoginCredentials, LoginResponse } from '@/features/auth/types'

export const authApi = {
  /**
   * Login using OAuth2PasswordRequestForm (form-urlencoded).
   * The backend field is "username" but accepts an email address.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const { data } = await apiClient.post<LoginResponse>(
      '/auth/login',
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    return data
  },
}
