import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { roomsApi } from '../api/rooms'
import { Avatar, Button, EmptyState, InlineNotice, LoadingRows, RoleBadge, StatusLabel } from '../components/ui'
import { useApp } from '../context/useApp'
import { AuthGate } from '../layouts/AppLayout'
import type { RoomResponse } from '../types/api'
import { getErrorMessage, relativeTime } from '../utils/format'

export function RoomDetailPage() {
  const { roomId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const groupId = Number(searchParams.get('group'))
  const { currentUser, groups, showToast } = useApp()
  const [room, setRoom] = useState<RoomResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRoom = useCallback(async () => {
    if (!roomId || !groupId) {
      setError('그룹 정보가 없어 모집방을 조회할 수 없어요.')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setRoom(await roomsApi.get(groupId, Number(roomId)))
      setError(null)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [groupId, roomId])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRoom(), 0)
    return () => window.clearTimeout(timer)
  }, [loadRoom])

  async function toggleParticipation() {
    if (!room || !currentUser) return
    const joined = (room.participants ?? []).some((participant) => participant.id === currentUser.id)
    setActing(true)
    try {
      if (joined) await roomsApi.leave(groupId, room.id, currentUser.id)
      else await roomsApi.join(groupId, room.id, currentUser.id)
      showToast(joined ? '모집방에서 나왔어요.' : '팀에 참가했어요.', 'success')
      await loadRoom()
    } catch (actionError) {
      showToast(getErrorMessage(actionError), 'error')
    } finally {
      setActing(false)
    }
  }

  async function deleteRoom() {
    if (!room || !window.confirm('이 모집방을 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.')) return
    setActing(true)
    try {
      await roomsApi.remove(groupId, room.id)
      showToast('모집방을 삭제했어요.', 'success')
      navigate('/rooms')
    } catch (deleteError) {
      showToast(getErrorMessage(deleteError), 'error')
    } finally {
      setActing(false)
    }
  }

  if (loading) return <div className="page-container detail-loading"><LoadingRows count={4} /></div>
  if (error || !room) return <div className="page-container"><EmptyState title="모집방을 열 수 없어요" description={error ?? '모집방을 찾을 수 없어요.'} action={<Link className="button button--primary" to="/rooms">목록으로 돌아가기</Link>} /></div>

  const group = groups.find((item) => item.id === groupId)
  const participants = room.participants ?? []
  const host = participants.find((participant) => participant.id === room.host_id)
  const joined = participants.some((participant) => participant.id === currentUser?.id)
  const isHost = room.host_id === currentUser?.id

  return <AuthGate><div className="room-detail page-container">
    <nav className="breadcrumb" aria-label="현재 위치"><Link to="/rooms">모집방</Link><span>/</span><span>{room.game_name}</span></nav>
    <header className="room-detail__header">
      <div><div className="detail-activity"><span>{room.game_name.slice(0, 1)}</span><div><strong>{room.game_name}</strong><small>{group?.name ?? `그룹 ${groupId}`} · {relativeTime(room.created_at)}</small></div></div><h1>{room.target_role ? `${room.target_role} 역할과 함께할 팀원을 찾아요` : '함께 즐길 팀원을 찾고 있어요'}</h1></div>
      <StatusLabel status={room.status} />
    </header>

    <div className="room-detail__grid">
      <section className="detail-main">
        <div className="lineup-summary"><div><span>현재 라인업</span><strong>{participants.length}<small>/ {room.target_count}{room.unit_type}</small></strong></div><div className="lineup-track">{Array.from({ length: Math.min(room.target_count, 12) }, (_, index) => <span key={index} className={index < participants.length ? 'is-filled' : ''}>{index < participants.length ? index + 1 : ''}</span>)}</div></div>
        <section className="detail-section"><h2>모집 조건</h2><dl className="condition-list"><div><dt>활동</dt><dd>{room.game_name}</dd></div><div><dt>목표 인원</dt><dd>{room.target_count}{room.unit_type}</dd></div><div><dt>필요 역할</dt><dd>{room.target_role ? <RoleBadge name={room.target_role} color="#ef6a42" /> : '역할 무관'}</dd></div><div><dt>방장</dt><dd>{host?.name ?? room.host_id}</dd></div></dl></section>
        <section className="detail-section"><div className="section-heading"><div><h2>참가자</h2><p>{participants.length}명이 함께하고 있어요.</p></div></div>{participants.length ? <div className="member-list">{participants.map((participant) => <div className="member-row" key={participant.id}><Avatar name={participant.name} src={participant.profile_image} /><div><strong>{participant.name}</strong><span>{participant.id === room.host_id ? '방장' : participant.email}</span></div>{participant.id === room.host_id && <span className="host-label">방장</span>}</div>)}</div> : <EmptyState title="아직 참가자가 없어요" description="첫 번째 자리를 채워보세요." />}</section>
      </section>

      <aside className="join-panel"><span>남은 자리</span><strong>{Math.max(0, room.target_count - participants.length)}<small>{room.unit_type}</small></strong><p>{room.status === 'RECRUITING' ? '지금 참가하면 바로 라인업에 추가됩니다.' : '이 모집은 더 이상 참가할 수 없어요.'}</p><Button className="join-panel__button" onClick={() => void toggleParticipation()} disabled={room.status !== 'RECRUITING' && !joined} loading={acting}>{joined ? '참가 취소' : room.status === 'RECRUITING' ? '참가하기' : '모집 완료'}</Button>{isHost && <div className="host-actions"><Link className="button button--secondary" to={`/rooms/${room.id}/edit?group=${groupId}`}>수정</Link><Button tone="danger" onClick={() => void deleteRoom()} disabled={acting}>삭제</Button></div>}<InlineNotice title="API 기준"><span>참가와 나가기는 실제 그룹 모집방 API로 처리됩니다.</span></InlineNotice></aside>
    </div>
  </div></AuthGate>
}
