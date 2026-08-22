import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { css } from '../../appStyles';
import { roomsApi } from '../../api/rooms';
import { GroupRow } from '../../components/group/GroupRow';
import { RoomRow } from '../../components/room/RoomRow';
import { EmptyState, InlineNotice, LoadingRows, SearchInput } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { useApp } from '../../context/useApp';
import type { RoomResponse } from '../../types/api';
import { getErrorMessage } from '../../utils/format';

type Filter = 'all' | 'recruiting' | 'joined';

export default function RoomsPage({ home = false }: { home?: boolean }) {
    const { currentUser, groups, activeGroup, activeGroupId, selectGroup, loadingGroups, showToast } = useApp();
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const joinedGroups = groups.filter((group) =>
        (group.members ?? []).some((member) => member.id === currentUser?.id),
    );
    const activeGroupJoined = Boolean(activeGroup && joinedGroups.some((group) => group.id === activeGroup.id));
    const selectedJoinedGroup = joinedGroups.find((group) => group.id === activeGroupId) ?? joinedGroups[0];
    const hasNoGroups = !loadingGroups && groups.length === 0;
    const needsGroup = !loadingGroups && joinedGroups.length === 0;
    const createRoomPath = selectedJoinedGroup ? `/rooms/create?group=${selectedJoinedGroup.id}` : '/rooms/create';

    const loadRooms = useCallback(async () => {
        if (!activeGroupId) {
            setRooms([]);
            return;
        }
        setLoading(true);
        try {
            setRooms(await roomsApi.list(activeGroupId));
            setError(null);
        } catch (loadError) {
            setError(getErrorMessage(loadError));
        } finally {
            setLoading(false);
        }
    }, [activeGroupId]);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadRooms(), 0);
        return () => window.clearTimeout(timer);
    }, [loadRooms]);

    const visibleRooms = useMemo(
        () =>
            rooms.filter((room) => {
                const matchesQuery = room.game_name.toLowerCase().includes(query.trim().toLowerCase());
                const matchesFilter =
                    filter === 'all' ||
                    (filter === 'recruiting' && room.status === 'RECRUITING') ||
                    (filter === 'joined' &&
                        (room.participants ?? []).some((participant) => participant.id === currentUser?.id));
                return matchesQuery && matchesFilter;
            }),
        [rooms, query, filter, currentUser],
    );

    async function joinRoom(room: RoomResponse) {
        if (!currentUser) return;
        if (!activeGroupJoined) {
            showToast('모집에 참가하려면 먼저 이 그룹에 참여해 주세요.', 'info');
            return;
        }
        setJoiningId(room.id);
        try {
            await roomsApi.join(room.group_id, room.id, currentUser.id);
            showToast(`${room.game_name} 모집에 참가했어요.`, 'success');
            await loadRooms();
        } catch (joinError) {
            showToast(getErrorMessage(joinError), 'error');
        } finally {
            setJoiningId(null);
        }
    }

    return (
        <div className={css('rooms-page page-container')}>
            <section className={css('explorer-heading')}>
                <div>
                    <h1>
                        {activeGroup
                            ? `${activeGroup.name} 모집방`
                            : home
                              ? `${currentUser?.name ?? ''}님의 모집방`
                              : '모집방'}
                    </h1>
                    <p>
                        {activeGroup
                            ? activeGroupJoined
                                ? '이 그룹 안에서 만든 모집방을 보고 있어요.'
                                : '이 그룹에 참여하면 모집방을 만들고 참가할 수 있어요.'
                            : hasNoGroups
                              ? '모집방은 그룹 안에서 만들고 함께 관리합니다.'
                              : '먼저 그룹을 골라 주세요.'}
                    </p>
                </div>
                <div className={css('explorer-heading__actions')}>
                    {home && !hasNoGroups && (
                        <Link className={css('button button--secondary')} to="/groups/create">
                            <Icon name="plus" className={css('button__icon')} />
                            <span>그룹 추가</span>
                        </Link>
                    )}
                    <Link
                        className={css('button button--primary')}
                        to={
                            hasNoGroups
                                ? '/groups/create?next=room'
                                : activeGroup && !activeGroupJoined
                                  ? `/groups/${activeGroup.id}`
                                  : needsGroup
                                    ? '/groups?next=room'
                                    : createRoomPath
                        }
                    >
                        {home && hasNoGroups && <Icon name="plus" className={css('button__icon')} />}
                        <span>
                            {hasNoGroups
                                ? '첫 그룹 만들기'
                                : activeGroup && !activeGroupJoined
                                  ? '이 그룹 참여하기'
                                  : needsGroup
                                    ? '참여할 그룹 찾기'
                                    : '이 그룹에서 모집하기'}
                        </span>
                    </Link>
                </div>
            </section>

            <div className={css('explorer-grid')}>
                <section className={css('room-board')} aria-label="모집방 목록">
                    <div className={css('room-toolbar')}>
                        <SearchInput
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="게임 검색"
                        />
                        <div className={css('filter-tabs')} role="tablist" aria-label="모집 필터">
                            {(
                                [
                                    ['all', '전체'],
                                    ['recruiting', '모집 중'],
                                    ['joined', '참여 중'],
                                ] as const
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    role="tab"
                                    aria-selected={filter === value}
                                    onClick={() => setFilter(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={css('scope-note')}>
                        <span />
                        {activeGroup
                            ? activeGroupJoined
                                ? `${activeGroup.name} 모집방만 보고 있어요.`
                                : `${activeGroup.name} 그룹에 참여하기 전입니다.`
                            : '그룹을 고르면 모집방을 볼 수 있어요.'}
                    </div>

                    {loading || loadingGroups ? (
                        <LoadingRows />
                    ) : error ? (
                        <InlineNotice tone="error" title="모집방을 불러오지 못했어요">
                            {error}
                            <br />
                            <button className={css('inline-action')} onClick={() => void loadRooms()}>
                                다시 시도
                            </button>
                        </InlineNotice>
                    ) : hasNoGroups ? (
                        <EmptyState
                            title="함께 모집할 그룹부터 만들어 보세요"
                            description="그룹을 만들면 바로 그 안에서 첫 모집방을 열 수 있습니다."
                            action={
                                <Link className={css('button button--primary')} to="/groups/create?next=room">
                                    첫 그룹 만들기
                                </Link>
                            }
                        />
                    ) : !activeGroup ? (
                        <EmptyState
                            title="먼저 그룹을 선택해 주세요"
                            description="그룹 목록에서 확인할 그룹을 선택하세요."
                            action={
                                <Link className={css('button button--primary')} to="/groups">
                                    그룹 선택하기
                                </Link>
                            }
                        />
                    ) : visibleRooms.length === 0 ? (
                        <EmptyState
                            title={
                                rooms.length
                                    ? '검색 결과가 없어요'
                                    : activeGroupJoined
                                      ? '아직 진행 중인 모집이 없어요'
                                      : '이 그룹에 먼저 참여해 주세요'
                            }
                            description={
                                rooms.length
                                    ? '검색어나 필터를 바꿔보세요.'
                                    : activeGroupJoined
                                      ? '이 그룹의 첫 모집을 만들어 보세요.'
                                      : '그룹에 참여하면 모집방을 만들고 참가할 수 있습니다.'
                            }
                            action={
                                <Link
                                    className={css('button button--primary')}
                                    to={activeGroupJoined ? createRoomPath : `/groups/${activeGroup.id}`}
                                >
                                    {activeGroupJoined ? '이 그룹에서 모집하기' : '그룹 참여하기'}
                                </Link>
                            }
                        />
                    ) : (
                        <div className={css('room-list')}>
                            {visibleRooms.map((room) => (
                                <RoomRow
                                    key={room.id}
                                    room={room}
                                    hostName={
                                        (room.participants ?? []).find((member) => member.id === room.host_id)?.name
                                    }
                                    groupName={activeGroup.name}
                                    currentUserId={currentUser?.id}
                                    onJoin={joinRoom}
                                    joining={joiningId === room.id}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <aside className={css('group-rail')} aria-label="내 그룹">
                    <div className={css('group-rail__heading')}>
                        <div>
                            <h2>그룹</h2>
                            <span>{groups.length}</span>
                        </div>
                        <Link to="/groups/create" aria-label="새 그룹 만들기">
                            +
                        </Link>
                    </div>
                    {groups.length ? (
                        <div>
                            {groups.map((group) => (
                                <GroupRow
                                    key={group.id}
                                    group={group}
                                    active={group.id === activeGroupId}
                                    onSelect={selectGroup}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={css('compact-empty')}>
                            <p>모집방은 그룹 안에서 만들어집니다.</p>
                            <Link className={css('text-link')} to="/groups/create?next=room">
                                첫 그룹 만들기
                            </Link>
                        </div>
                    )}
                    {activeGroup && (
                        <div className={css('group-brief')}>
                            <span>선택한 그룹</span>
                            <strong>{activeGroup.name}</strong>
                            <p>멤버 {activeGroup.members?.length ?? 0}명</p>
                            <Link className={css('text-link')} to={`/groups/${activeGroup.id}`}>
                                그룹 관리
                            </Link>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
