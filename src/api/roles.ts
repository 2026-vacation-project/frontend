import { apiRequest } from './client';
import type { RoleCreate, RoleResponse } from '../types/api';

export const rolesApi = {
    list(groupId: string) {
        return apiRequest<RoleResponse[]>(`/api/v1/groups/${groupId}/roles`);
    },
    create(groupId: string, body: RoleCreate) {
        return apiRequest<RoleResponse>(`/api/v1/groups/${groupId}/roles`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
    update(groupId: string, roleId: string, body: RoleCreate) {
        return apiRequest<RoleResponse>(`/api/v1/groups/${groupId}/roles/${roleId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },
    remove(groupId: string, roleId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}/roles/${roleId}`, {
            method: 'DELETE',
        });
    },
    assign(groupId: string, roleId: string, userId: string) {
        return apiRequest<RoleResponse>(
            `/api/v1/groups/${groupId}/roles/${roleId}/assign/${encodeURIComponent(userId)}`,
            { method: 'POST' },
        );
    },
    unassign(groupId: string, roleId: string, userId: string) {
        return apiRequest<RoleResponse>(
            `/api/v1/groups/${groupId}/roles/${roleId}/assign/${encodeURIComponent(userId)}`,
            { method: 'DELETE' },
        );
    },
};
