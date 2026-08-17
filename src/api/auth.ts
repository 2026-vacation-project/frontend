import { apiRequest } from './client'
import type { OAuthProvider, UserCreate, UserResponse } from '../types/api'

export const authApi = {
  login(provider: OAuthProvider, body: UserCreate) {
    return apiRequest<UserResponse>(`/api/v1/auth/login/${provider}`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}
