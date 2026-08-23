export type OAuthProvider = 'google' | 'discord';
export type RoomStatus = 'RECRUITING' | 'COMPLETED' | 'CANCELLED';

export interface OAuthLoginRequest {
    code: string;
}

export interface UserResponse {
    id: string;
    email: string;
    name: string;
    display_name?: string | null;
    profile_image?: string | null;
    fcm_token?: string | null;
    notifications_enabled?: boolean;
    discord_connected?: boolean;
    preferred_games?: string[];
}

export interface TokenResponse {
    access_token: string;
    token_type: 'bearer' | string;
    user: UserResponse;
}

export interface LogoutAllResponse {
    message: string;
    left_room_count: number;
    deleted_room_count: number;
}

export interface GameSearchResult {
    id: number;
    name: string;
    slug?: string | null;
    cover_url?: string | null;
    first_release_date?: string | null;
    rating?: number | null;
    platforms: string[];
}

export interface GroupCreate {
    name: string;
    is_public: boolean;
}

export interface GroupResponse {
    id: string;
    name: string;
    is_public: boolean;
    created_at?: string | null;
    members?: UserResponse[];
}

export interface RoleCreate {
    name: string;
    color: string;
}

export interface TagResponse {
    id: string;
    group_id: string;
    name: string;
    color: string;
}

export interface RoleResponse extends TagResponse {
    user_ids?: string[];
}

export interface RoomCreate {
    name?: string | null;
    game_name: string;
    target_count: number;
    tag_ids: string[];
}

export interface RoomUpdate {
    name?: string | null;
    game_name?: string | null;
    target_count?: number | null;
    status?: RoomStatus | null;
    tag_ids?: string[] | null;
}

export interface RoomResponse {
    id: string;
    group_id: string;
    host_id: string;
    name?: string | null;
    game_name: string;
    game_cover_url?: string | null;
    target_count: number;
    status: RoomStatus;
    created_at?: string | null;
    participants?: UserResponse[];
    tags?: TagResponse[];
}
