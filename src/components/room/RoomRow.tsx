import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { css } from '../../appStyles';
import type { RoomResponse } from '../../types/api';
import { relativeTime, roomProgress } from '../../utils/format';
import { getCachedGameCover } from '../../utils/gameCovers';
import { GameArtwork } from '../game/GameArtwork';
import { Avatar, Button, RoleBadge, StatusLabel } from '../ui';

interface RoomRowProps {
    room: RoomResponse;
    hostName?: string;
    groupName?: string;
    currentUserId?: string;
    onJoin?: (room: RoomResponse) => void;
    joining?: boolean;
    detailsAvailable?: boolean;
    restrictedAction?: ReactNode;
    example?: boolean;
    gameCoverUrl?: string | null;
    gameArtworkFit?: 'cover' | 'contain';
}

export function RoomRow({
    room,
    hostName = '방장',
    groupName,
    currentUserId,
    onJoin,
    joining,
    detailsAvailable = true,
    restrictedAction,
    example,
    gameCoverUrl,
    gameArtworkFit = 'cover',
}: RoomRowProps) {
    const participants = room.participants ?? [];
    const progress = roomProgress(room);
    const isParticipant = participants.some((member) => member.id === currentUserId);
    const disabled = room.status !== 'RECRUITING' || isParticipant || !currentUserId;
    const filledSlots = Math.min(room.target_count, participants.length);
    const coverUrl = gameCoverUrl ?? room.game_cover_url ?? getCachedGameCover(room.game_name);

    return (
        <article className={css('room-row')}>
            <div className={css('room-row__activity')}>
                <GameArtwork
                    name={room.game_name}
                    src={coverUrl}
                    fit={gameArtworkFit}
                    className={css('activity-symbol')}
                />
                <div>
                    <div className={css('room-row__eyeline')}>
                        <strong>{room.game_name}</strong>
                    </div>
                    {detailsAvailable ? (
                        <Link
                            className={css('room-row__title')}
                            to={example ? '/login' : `/rooms/${room.id}?group=${room.group_id}`}
                            aria-label={`${room.game_name} 모집 ${example ? '시작하기' : '상세 보기'}`}
                        >
                            {room.target_count}명 모집
                        </Link>
                    ) : (
                        <span
                            className={css('room-row__title room-row__title--restricted')}
                            aria-label={`${room.game_name} ${room.target_count}명 모집. 상세 정보는 그룹 참여 후 확인할 수 있어요.`}
                        >
                            {room.target_count}명 모집
                        </span>
                    )}
                    {(room.tags ?? []).length > 0 && (
                        <div className={css('room-row__tags')} aria-label="모집 태그">
                            {(room.tags ?? []).slice(0, 3).map((tag) => (
                                <RoleBadge key={tag.id} name={tag.name} color={tag.color} />
                            ))}
                            {(room.tags ?? []).length > 3 && <span>+{(room.tags ?? []).length - 3}</span>}
                        </div>
                    )}
                    <div className={css('room-row__meta')}>
                        <Avatar name={hostName} size="sm" />
                        <span>{hostName}</span>
                        {groupName && <span>{groupName}</span>}
                        <span>{relativeTime(room.created_at)}</span>
                    </div>
                </div>
            </div>

            <div className={css('room-row__capacity')}>
                <div className={css('capacity-copy')}>
                    <strong>{participants.length}</strong>
                    <span>/ {room.target_count}명</span>
                </div>
                <div className={css('slot-rail')} aria-label={`${room.target_count}자리 중 ${filledSlots}자리 참여`}>
                    {Array.from({ length: Math.min(room.target_count, 8) }, (_, index) => (
                        <span key={index} className={css(index < filledSlots && 'is-filled')} />
                    ))}
                </div>
                <span className={css('sr-only')}>{progress}% 모집됨</span>
            </div>

            <div className={css('room-row__action')}>
                <StatusLabel status={room.status} />
                {!detailsAvailable ? (
                    (restrictedAction ?? <span className={css('text-link text-link--disabled')}>참여 후 보기</span>)
                ) : onJoin ? (
                    <Button tone="secondary" disabled={disabled} loading={joining} onClick={() => onJoin(room)}>
                        {isParticipant ? '참여 중' : room.status === 'COMPLETED' ? '모집 완료' : '참가하기'}
                    </Button>
                ) : example && room.status !== 'RECRUITING' ? (
                    <span className={css('text-link text-link--disabled')}>모집 완료</span>
                ) : (
                    <Link
                        className={css('text-link')}
                        to={example ? '/login' : `/rooms/${room.id}?group=${room.group_id}`}
                    >
                        {example ? '참여 시작' : '자세히 보기'}
                    </Link>
                )}
            </div>
        </article>
    );
}
