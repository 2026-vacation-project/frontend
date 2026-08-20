import { apiRequest, query } from './client';
import type { RoomCreate, RoomResponse, RoomUpdate } from '../types/api';

export const roomsApi = {
    list(groupId: string) {
        return apiRequest<RoomResponse[]>(`/api/v1/groups/${groupId}/rooms`);
    },
    get(groupId: string, roomId: string) {
        return apiRequest<RoomResponse>(`/api/v1/groups/${groupId}/rooms/${roomId}`);
    },
    create(groupId: string, hostId: string, body: RoomCreate) {
        return apiRequest<RoomResponse>(`/api/v1/groups/${groupId}/rooms${query({ host_id: hostId })}`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
    update(groupId: string, roomId: string, body: RoomUpdate) {
        return apiRequest<RoomResponse>(`/api/v1/groups/${groupId}/rooms/${roomId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },
    remove(groupId: string, roomId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}/rooms/${roomId}`, {
            method: 'DELETE',
        });
    },
    join(groupId: string, roomId: string, userId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}/rooms/${roomId}/join${query({ user_id: userId })}`, {
            method: 'POST',
        });
    },
    leave(groupId: string, roomId: string, userId: string) {
        return apiRequest<unknown>(`/api/v1/groups/${groupId}/rooms/${roomId}/leave${query({ user_id: userId })}`, {
            method: 'POST',
        });
    },
};
