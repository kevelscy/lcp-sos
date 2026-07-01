/** Credentials submitted on the login form. */
export interface LoginCredentials {
  email: string
  password: string
}

/** Authenticated user profile returned by the backend. */
export interface AuthUser {
  id: number
  email: string
  name: string
}

/** Response body of `POST /auth/login`. */
export interface LoginResponse {
  accessToken: string
  user: AuthUser
}
