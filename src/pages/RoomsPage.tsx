import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { roomsApi } from '../api/rooms'
import { GroupRow } from '../components/group/GroupRow'
import { RoomRow } from '../components/room/RoomRow'
import { EmptyState, InlineNotice, LoadingRows, SearchInput } from '../components/ui'
import { useApp } from '../context/useApp'
import type { RoomResponse } from '../types/api'
import { getErrorMessage } from '../utils/format'

type Filter = 'all' | 'recruiting' | 'joined'

export function RoomsPage({ home = false }: { home?: boolean }) {
  const { currentUser, groups, activeGroup, activeGroupId, selectGroup, loadingGroups, showToast } = useApp()
  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [joiningId, setJoiningId] = useState<number | null>(null)

  const loadRooms = useCallback(async () => {
    if (!activeGroupId) {
      setRooms([])
      return
    }
    setLoading(true)
    try {
      setRooms(await roomsApi.list(activeGroupId))
      setError(null)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [activeGroupId])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRooms(), 0)
    return () => window.clearTimeout(timer)
  }, [loadRooms])

  const visibleRooms = useMemo(() => rooms.filter((room) => {
    const matchesQuery = `${room.game_name} ${room.target_role ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'recruiting' && room.status === 'RECRUITING') || (filter === 'joined' && (room.participants ?? []).some((participant) => participant.id === currentUser?.id))
    return matchesQuery && matchesFilter
  }), [rooms, query, filter, currentUser])

  async function joinRoom(room: RoomResponse) {
    if (!currentUser) return
    setJoiningId(room.id)
    try {
      await roomsApi.join(room.group_id, room.id, currentUser.id)
      showToast(`${room.game_name} 모집에 참가했어요.`, 'success')
      await loadRooms()
    } catch (joinError) {
      showToast(getErrorMessage(joinError), 'error')
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <div className="rooms-page page-container">
      <section className="explorer-heading">
        <div>
          <h1>{home ? `${currentUser?.name ?? ''}님, 오늘은 무엇을 함께할까요?` : '모집방 찾기'}</h1>
          <p>{activeGroup ? `${activeGroup.name} 안에서 지금 열려 있는 모집을 살펴보세요.` : '그룹을 선택하면 실제 모집방을 불러옵니다.'}</p>
        </div>
        <Link className="button button--primary" to="/rooms/create">새 모집 만들기</Link>
      </section>

      <div className="explorer-grid">
        <section className="room-board" aria-label="모집방 목록">
          <div className="room-toolbar">
            <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="게임 또는 포지션 검색" />
            <div className="filter-tabs" role="tablist" aria-label="모집 필터">
              {([['all', '전체'], ['recruiting', '모집 중'], ['joined', '참여 중']] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
          </div>
          <div className="scope-note"><span />선택한 그룹의 모집만 검색합니다. 전역 모집 API는 아직 제공되지 않습니다.</div>

          {loading || loadingGroups ? <LoadingRows /> : error ? (
            <InlineNotice tone="error" title="모집방을 불러오지 못했어요">{error}<br /><button className="inline-action" onClick={() => void loadRooms()}>다시 시도</button></InlineNotice>
          ) : !activeGroup ? (
            <EmptyState title="먼저 그룹을 선택해 주세요" description="현재 API는 그룹 안의 모집방만 조회할 수 있어요." action={<Link className="button button--primary" to="/groups">그룹 선택하기</Link>} />
          ) : visibleRooms.length === 0 ? (
            <EmptyState title={rooms.length ? '검색 결과가 없어요' : '아직 모집 중인 팀이 없어요'} description={rooms.length ? '검색어나 필터를 바꿔보세요.' : '첫 모집을 열고 친구들에게 알려보세요.'} action={<Link className="button button--primary" to="/rooms/create">모집 시작하기</Link>} />
          ) : <div className="room-list">{visibleRooms.map((room) => <RoomRow key={room.id} room={room} hostName={(room.participants ?? []).find((member) => member.id === room.host_id)?.name} groupName={activeGroup.name} currentUserId={currentUser?.id} onJoin={joinRoom} joining={joiningId === room.id} />)}</div>}
        </section>

        <aside className="group-rail" aria-label="내 그룹">
          <div className="group-rail__heading"><div><h2>그룹</h2><span>{groups.length}</span></div><Link to="/groups/create" aria-label="새 그룹 만들기">+</Link></div>
          {groups.length ? <div>{groups.map((group) => <GroupRow key={group.id} group={group} active={group.id === activeGroupId} onSelect={selectGroup} />)}</div> : <div className="compact-empty"><p>아직 그룹이 없어요.</p><Link className="text-link" to="/groups/create">첫 그룹 만들기</Link></div>}
          {activeGroup && <div className="group-brief"><span>현재 선택</span><strong>{activeGroup.name}</strong><p>{activeGroup.members?.length ?? 0}명의 멤버가 함께하고 있어요.</p><Link className="text-link" to={`/groups/${activeGroup.id}`}>그룹 관리</Link></div>}
        </aside>
      </div>
    </div>
  )
}
