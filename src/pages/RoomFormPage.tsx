import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { roomsApi } from '../api/rooms'
import { Button, Field, InlineNotice, LoadingRows } from '../components/ui'
import { useApp } from '../context/useApp'
import type { RoomCreate, UnitType } from '../types/api'
import { getErrorMessage } from '../utils/format'
import { AuthGate, PageHeader } from '../layouts/AppLayout'

export function RoomFormPage({ edit = false }: { edit?: boolean }) {
  const { roomId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser, groups, activeGroupId, selectGroup, showToast } = useApp()
  const requestedGroup = Number(searchParams.get('group')) || activeGroupId || groups[0]?.id || 0
  const [groupId, setGroupId] = useState(requestedGroup)
  const [form, setForm] = useState<RoomCreate>({ game_name: '', target_count: 5, target_role: '', unit_type: '명' })
  const [loading, setLoading] = useState(edit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!edit || !roomId || !groupId) return
    const timer = window.setTimeout(() => {
      setLoading(true)
      roomsApi.get(groupId, Number(roomId)).then((room) => {
        setForm({ game_name: room.game_name, target_count: room.target_count, target_role: room.target_role ?? '', unit_type: room.unit_type })
      }).catch((loadError: unknown) => setError(getErrorMessage(loadError))).finally(() => setLoading(false))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [edit, roomId, groupId])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUser || !groupId) return
    setSubmitting(true)
    setError(null)
    try {
      const body = { ...form, target_role: form.target_role?.trim() || null }
      const room = edit && roomId
        ? await roomsApi.update(groupId, Number(roomId), body)
        : await roomsApi.create(groupId, currentUser.id, body)
      selectGroup(groupId)
      showToast(edit ? '모집 정보를 수정했어요.' : '새 모집을 시작했어요.', 'success')
      navigate(`/rooms/${room.id}?group=${groupId}`)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return <AuthGate><div className="form-page page-container">
    <PageHeader title={edit ? '모집방 수정' : '새 모집 만들기'} description="필요한 정보만 입력하면 바로 모집을 시작할 수 있어요." />
    {loading ? <LoadingRows count={3} /> : <form className="entity-form" onSubmit={submit}>
      <div className="form-section"><h2>어디에서 모집할까요?</h2><Field label="그룹"><select value={groupId} onChange={(event) => setGroupId(Number(event.target.value))} required><option value="" disabled>그룹 선택</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></Field>{!groups.length && <InlineNotice tone="warning" title="그룹이 필요해요">현재 API는 그룹 안에서만 모집방을 만들 수 있습니다. <Link to="/groups/create">그룹 만들기</Link></InlineNotice>}</div>
      <div className="form-section"><h2>무엇을 함께할까요?</h2><Field label="게임 또는 운동 이름"><input value={form.game_name} onChange={(event) => setForm({ ...form, game_name: event.target.value })} placeholder="예: 오버워치 2, 주말 풋살" required maxLength={60} /></Field><InlineNotice title="현재 서버 필드 안내">Swagger에는 별도의 방 이름과 추가 조건 필드가 없어 활동 이름과 역할만 저장합니다.</InlineNotice></div>
      <div className="form-section form-section--split"><Field label="목표 인원"><input type="number" min="2" max="100" value={form.target_count} onChange={(event) => setForm({ ...form, target_count: Number(event.target.value) })} required /></Field><Field label="모집 단위"><select value={form.unit_type} onChange={(event) => setForm({ ...form, unit_type: event.target.value as UnitType })}><option value="명">명</option><option value="팀">팀</option></select></Field></div>
      <div className="form-section"><h2>어떤 역할이 필요할까요?</h2><Field label="필요 역할" hint="선택 사항이에요. 그룹 역할 이름과 맞추면 찾기 쉬워집니다."><input value={form.target_role ?? ''} onChange={(event) => setForm({ ...form, target_role: event.target.value })} placeholder="예: 힐러, 골키퍼" maxLength={30} /></Field></div>
      {error && <InlineNotice tone="error" title="저장하지 못했어요">{error}</InlineNotice>}
      <div className="form-actions"><Link className="button button--quiet" to={edit && roomId ? `/rooms/${roomId}?group=${groupId}` : '/rooms'}>취소</Link><Button type="submit" disabled={!groups.length || !form.game_name.trim()} loading={submitting}>{edit ? '변경사항 저장' : '모집 시작하기'}</Button></div>
    </form>}
  </div></AuthGate>
}
