import { apiRequest } from './client'
import type { RoleCreate, RoleResponse } from '../types/api'

export const rolesApi = {
  list(groupId: number) {
    return apiRequest<RoleResponse[]>(`/api/v1/groups/${groupId}/roles`)
  },
  create(groupId: number, body: RoleCreate) {
    return apiRequest<RoleResponse>(`/api/v1/groups/${groupId}/roles`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
  update(groupId: number, roleId: number, body: RoleCreate) {
    return apiRequest<RoleResponse>(`/api/v1/groups/${groupId}/roles/${roleId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },
  remove(groupId: number, roleId: number) {
    return apiRequest<unknown>(`/api/v1/groups/${groupId}/roles/${roleId}`, {
      method: 'DELETE',
    })
  },
  assign(groupId: number, roleId: number, userId: string) {
    return apiRequest<unknown>(
      `/api/v1/groups/${groupId}/roles/${roleId}/assign/${encodeURIComponent(userId)}`,
      { method: 'POST' },
    )
  },
}
