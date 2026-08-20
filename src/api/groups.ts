import { apiRequest, query } from './client';
import type { GroupCreate, GroupResponse } from '../types/api';

export const groupsApi = {
    list() {
        return apiRequest<GroupResponse[]>('/api/v1/groups');
    },
    get(groupId: number) {
        return apiRequest<GroupResponse>(`/api/v1/groups/${groupId}`);
    },
    create(body: GroupCreate) {
        return apiRequest<GroupResponse>('/api/v1/groups', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
    remove(groupId: number) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}`, { method: 'DELETE' });
    },
    join(groupId: number, userId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}/join${query({ user_id: userId })}`, {
            method: 'POST',
        });
    },
    leave(groupId: number, userId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}/leave${query({ user_id: userId })}`, {
            method: 'POST',
        });
    },
};
