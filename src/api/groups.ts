import { apiRequest, query } from './client';
import type { GroupCreate, GroupResponse } from '../types/api';

export const groupsApi = {
    list() {
        return apiRequest<GroupResponse[]>('/api/v1/groups');
    },
    get(groupId: string) {
        return apiRequest<GroupResponse>(`/api/v1/groups/${groupId}`);
    },
    create(body: GroupCreate) {
        return apiRequest<GroupResponse>('/api/v1/groups', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
    remove(groupId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}`, { method: 'DELETE' });
    },
    join(groupId: string, userId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}/join${query({ user_id: userId })}`, {
            method: 'POST',
        });
    },
    leave(groupId: string, userId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}/leave${query({ user_id: userId })}`, {
            method: 'POST',
        });
    },
};
