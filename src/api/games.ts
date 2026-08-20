import { apiRequest, query } from './client';
import type { GameSearchResult } from '../types/api';

export const gamesApi = {
    search(searchQuery: string, limit = 8, signal?: AbortSignal) {
        return apiRequest<GameSearchResult[]>(`/api/v1/games/search${query({ query: searchQuery, limit })}`, {
            signal,
        });
    },
};
