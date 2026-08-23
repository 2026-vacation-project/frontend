import { apiRequest } from './client';
import type { UserResponse } from '../types/api';

export const usersApi = {
    list() {
        return apiRequest<UserResponse[]>('/api/v1/users');
    },
    get(userId: string) {
        return apiRequest<UserResponse>(`/api/v1/users/${encodeURIComponent(userId)}`);
    },
    updateFcmToken(userId: string, fcmToken: string) {
        return apiRequest<unknown>(`/api/v1/users/${encodeURIComponent(userId)}/fcm-token`, {
            method: 'PATCH',
            body: JSON.stringify({ fcm_token: fcmToken }),
        });
    },
    updateNotificationPreference(userId: string, enabled: boolean) {
        return apiRequest<UserResponse>(`/api/v1/users/${encodeURIComponent(userId)}/notification-preference`, {
            method: 'PATCH',
            body: JSON.stringify({ enabled }),
        });
    },
    updatePreferences(userId: string, preferredGames: string[]) {
        return apiRequest<unknown>(`/api/v1/users/${encodeURIComponent(userId)}/preferences`, {
            method: 'PATCH',
            body: JSON.stringify({ preferred_games: preferredGames }),
        });
    },
};
