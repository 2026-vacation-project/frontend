import type { RoomResponse } from '../types/api'

export function relativeTime(value?: string | null) {
    if (!value) return '방금 전'
    const date = new Date(value)
    const diff = Date.now() - date.getTime()
    const minutes = Math.max(0, Math.floor(diff / 60_000))
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    return `${Math.floor(hours / 24)}일 전`
}

export function roomProgress(room: RoomResponse) {
    if (room.target_count <= 0) return 0
    return Math.min(100, Math.round(((room.participants?.length ?? 0) / room.target_count) * 100))
}

export function initials(name: string) {
    return name.trim().slice(0, 2).toUpperCase() || 'TM'
}

export function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : '요청을 처리하지 못했어요.'
}
