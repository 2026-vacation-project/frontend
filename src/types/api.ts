export type OAuthProvider = 'google' | 'discord'
export type RoomStatus = 'RECRUITING' | 'COMPLETED' | 'CANCELLED'
export type UnitType = '명' | '팀'

export interface UserCreate {
    email: string
    name: string
    profile_image?: string | null
}

export interface UserResponse {
    id: string
    email: string
    name: string
    profile_image?: string | null
    fcm_token?: string | null
    preferred_games?: string[]
}

export interface GroupCreate {
    name: string
}

export interface GroupResponse {
    id: number
    name: string
    created_at?: string | null
    members?: UserResponse[]
}

export interface RoleCreate {
    name: string
    color: string
}

export interface RoleResponse {
    id: number
    group_id: number
    name: string
    color: string
}

export interface RoomCreate {
    game_name: string
    target_count: number
    target_role?: string | null
    unit_type: UnitType
}

export interface RoomUpdate {
    game_name?: string | null
    target_count?: number | null
    target_role?: string | null
    unit_type?: UnitType | null
    status?: RoomStatus | null
}

export interface RoomResponse {
    id: number
    group_id: number
    host_id: string
    game_name: string
    target_count: number
    target_role: string | null
    unit_type: UnitType
    status: RoomStatus
    created_at?: string | null
    participants?: UserResponse[]
}
