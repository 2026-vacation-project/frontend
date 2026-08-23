import { ApiError } from '../api/client';
import type { RoomResponse, TagResponse, UserResponse } from '../types/api';

export function userDisplayName(user: UserResponse) {
    return user.display_name?.trim() || user.name;
}

export function userDisplayNameDetail(user: UserResponse) {
    const displayName = user.display_name?.trim();
    if (!displayName || displayName === user.name.trim()) return null;
    return displayName;
}

export function relativeTime(value?: string | null) {
    if (!value) return '방금 전';
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const minutes = Math.max(0, Math.floor(diff / 60_000));
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
}

export function roomProgress(room: RoomResponse) {
    if (room.target_count <= 0) return 0;
    return Math.min(100, Math.round(((room.participants?.length ?? 0) / room.target_count) * 100));
}

export function initials(name: string) {
    return name.trim().slice(0, 2).toUpperCase() || 'TM';
}

export function getErrorMessage(error: unknown) {
    if (error instanceof Error && /[가-힣]/.test(error.message)) return error.message;
    return '요청을 마치지 못했어요. 잠시 후 다시 시도해 주세요.';
}

export function getRoomJoinErrorMessage(error: unknown, tags: TagResponse[]) {
    const detail =
        error instanceof ApiError &&
        typeof error.details === 'object' &&
        error.details !== null &&
        'detail' in error.details &&
        typeof error.details.detail === 'string'
            ? error.details.detail
            : '';

    if (tags.length && detail === '이 모집방에서 찾는 태그가 내게 없습니다.') {
        return `${tags.map((tag) => tag.name).join(', ')} 태그가 없어요.`;
    }

    return getErrorMessage(error);
}
