import { apiRequest } from './client';
import type { LogoutAllResponse, OAuthLoginRequest, OAuthProvider, TokenResponse } from '../types/api';

export const authApi = {
    login(provider: OAuthProvider, code: string) {
        const body: OAuthLoginRequest = { code };
        return apiRequest<TokenResponse>(`/api/v1/auth/login/${provider}`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
    logoutAll() {
        return apiRequest<LogoutAllResponse>('/api/v1/auth/logout-all', {
            method: 'POST',
        });
    },
};
