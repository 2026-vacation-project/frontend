import { apiRequest } from './client';
import type { OAuthLoginRequest, OAuthProvider, TokenResponse } from '../types/api';

export const authApi = {
    login(provider: OAuthProvider, code: string) {
        const body: OAuthLoginRequest = { code };
        return apiRequest<TokenResponse>(`/api/v1/auth/login/${provider}`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
};
