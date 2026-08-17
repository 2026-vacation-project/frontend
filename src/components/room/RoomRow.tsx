import { Link } from 'react-router'
import type { RoomResponse } from '../../types/api'
import { relativeTime, roomProgress } from '../../utils/format'
import { Avatar, Button, RoleBadge, StatusLabel } from '../ui'

interface RoomRowProps {
  room: RoomResponse
  hostName?: string
  groupName?: string
  currentUserId?: string
  onJoin?: (room: RoomResponse) => void
  joining?: boolean
  example?: boolean
}

export function RoomRow({ room, hostName = '방장', groupName, currentUserId, onJoin, joining, example }: RoomRowProps) {
  const participants = room.participants ?? []
  const progress = roomProgress(room)
  const isParticipant = participants.some((member) => member.id === currentUserId)
  const disabled = room.status !== 'RECRUITING' || isParticipant || !currentUserId
  const filledSlots = Math.min(room.target_count, participants.length)

  return (
    <article className="room-row">
      <div className="room-row__activity">
        <span className="activity-symbol" aria-hidden="true">{room.game_name.slice(0, 1)}</span>
        <div>
          <div className="room-row__eyeline">
            <strong>{room.game_name}</strong>
            {example && <span className="example-label">화면 예시</span>}
          </div>
          {example ? <span className="room-row__title">{room.target_role ? `${room.target_role} 포지션을 찾고 있어요` : '같이 즐길 팀원을 찾고 있어요'}</span> : <Link className="room-row__title" to={`/rooms/${room.id}?group=${room.group_id}`}>{room.target_role ? `${room.target_role} 포지션을 찾고 있어요` : '같이 즐길 팀원을 찾고 있어요'}</Link>}
          <div className="room-row__meta">
            <Avatar name={hostName} size="sm" />
            <span>{hostName}</span>
            {groupName && <span>{groupName}</span>}
            <span>{relativeTime(room.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="room-row__need">
        <span className="room-row__label">필요 포지션</span>
        {room.target_role ? <RoleBadge name={room.target_role} color="#ef6a42" /> : <span className="muted">포지션 무관</span>}
      </div>

      <div className="room-row__capacity">
        <div className="capacity-copy"><strong>{participants.length}</strong><span>/ {room.target_count}{room.unit_type}</span></div>
        <div className="slot-rail" aria-label={`${room.target_count}자리 중 ${filledSlots}자리 참여`}>
          {Array.from({ length: Math.min(room.target_count, 8) }, (_, index) => <span key={index} className={index < filledSlots ? 'is-filled' : ''} />)}
        </div>
        <span className="sr-only">{progress}% 모집됨</span>
      </div>

      <div className="room-row__action">
        <StatusLabel status={room.status} />
        {onJoin ? <Button tone="secondary" disabled={disabled} loading={joining} onClick={() => onJoin(room)}>{isParticipant ? '참여 중' : room.status === 'COMPLETED' ? '모집 완료' : '참가하기'}</Button> : example && room.status !== 'RECRUITING' ? <span className="text-link text-link--disabled">모집 완료</span> : <Link className="text-link" to={example ? '/login' : `/rooms/${room.id}?group=${room.group_id}`}>{example ? '참여 시작' : '자세히 보기'}</Link>}
      </div>
    </article>
  )
}
