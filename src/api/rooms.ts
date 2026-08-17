import { apiRequest, query } from './client'
import type { RoomCreate, RoomResponse, RoomUpdate } from '../types/api'

export const roomsApi = {
  list(groupId: number) {
    return apiRequest<RoomResponse[]>(`/api/v1/groups/${groupId}/rooms`)
  },
  get(groupId: number, roomId: number) {
    return apiRequest<RoomResponse>(`/api/v1/groups/${groupId}/rooms/${roomId}`)
  },
  create(groupId: number, hostId: string, body: RoomCreate) {
    return apiRequest<RoomResponse>(
      `/api/v1/groups/${groupId}/rooms${query({ host_id: hostId })}`,
      { method: 'POST', body: JSON.stringify(body) },
    )
  },
  update(groupId: number, roomId: number, body: RoomUpdate) {
    return apiRequest<RoomResponse>(`/api/v1/groups/${groupId}/rooms/${roomId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },
  remove(groupId: number, roomId: number) {
    return apiRequest<unknown>(`/api/v1/groups/${groupId}/rooms/${roomId}`, {
      method: 'DELETE',
    })
  },
  join(groupId: number, roomId: number, userId: string) {
    return apiRequest<unknown>(
      `/api/v1/groups/${groupId}/rooms/${roomId}/join${query({ user_id: userId })}`,
      { method: 'POST' },
    )
  },
  leave(groupId: number, roomId: number, userId: string) {
    return apiRequest<unknown>(
      `/api/v1/groups/${groupId}/rooms/${roomId}/leave${query({ user_id: userId })}`,
      { method: 'POST' },
    )
  },
}
