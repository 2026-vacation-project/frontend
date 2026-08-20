import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { css } from '../../../appStyles';
import { groupsApi } from '../../../api/groups';
import { rolesApi } from '../../../api/roles';
import { roomsApi } from '../../../api/rooms';
import { RoomRow } from '../../../components/room/RoomRow';
import { Avatar, Button, EmptyState, Field, LoadingRows, RoleBadge } from '../../../components/ui';
import { useApp } from '../../../context/useApp';
import { AuthGate } from '../../layout';
import type { GroupResponse, RoleResponse, RoomResponse } from '../../../types/api';
import { getErrorMessage } from '../../../utils/format';

type GroupTab = 'rooms' | 'members' | 'roles' | 'settings';

export default function GroupDetailPage() {
    const { groupId } = useParams();
    const id = Number(groupId);
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, selectGroup, refreshGroups, showToast } = useApp();
    const [group, setGroup] = useState<GroupResponse | null>(null);
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roleName, setRoleName] = useState('');
    const [roleColor, setRoleColor] = useState('#008bfe');
    const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
    const [saving, setSaving] = useState(false);

    const tab: GroupTab = location.pathname.endsWith('/members')
        ? 'members'
        : location.pathname.endsWith('/roles')
          ? 'roles'
          : location.pathname.endsWith('/settings')
            ? 'settings'
            : 'rooms';

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [nextGroup, nextRooms, nextRoles] = await Promise.all([
                groupsApi.get(id),
                roomsApi.list(id),
                rolesApi.list(id),
            ]);
            setGroup(nextGroup);
            setRooms(nextRooms);
            setRoles(nextRoles);
            selectGroup(id);
            setError(null);
        } catch (loadError) {
            setError(getErrorMessage(loadError));
        } finally {
            setLoading(false);
        }
    }, [id, selectGroup]);

    useEffect(() => {
        const timer = window.setTimeout(() => void load(), 0);
        return () => window.clearTimeout(timer);
    }, [load]);

    async function saveRole(event: React.FormEvent) {
        event.preventDefault();
        if (!roleName.trim()) return;
        setSaving(true);
        try {
            if (editingRole) await rolesApi.update(id, editingRole.id, { name: roleName.trim(), color: roleColor });
            else await rolesApi.create(id, { name: roleName.trim(), color: roleColor });
            setRoleName('');
            setEditingRole(null);
            showToast(editingRole ? '역할을 수정했어요.' : '역할을 추가했어요.', 'success');
            await load();
        } catch (saveError) {
            showToast(getErrorMessage(saveError), 'error');
        } finally {
            setSaving(false);
        }
    }

    async function removeRole(role: RoleResponse) {
        if (!window.confirm(`${role.name} 역할을 삭제할까요?`)) return;
        try {
            await rolesApi.remove(id, role.id);
            showToast('역할을 삭제했어요.', 'success');
            await load();
        } catch (removeError) {
            showToast(getErrorMessage(removeError), 'error');
        }
    }

    async function assignRole(roleId: number, userId: string) {
        if (!roleId) return;
        try {
            await rolesApi.assign(id, roleId, userId);
            showToast('멤버에게 역할을 부여했어요.', 'success');
        } catch (assignError) {
            showToast(getErrorMessage(assignError), 'error');
        }
    }

    async function leaveGroup() {
        if (!currentUser || !window.confirm('이 그룹에서 나갈까요?')) return;
        try {
            await groupsApi.leave(id, currentUser.id);
            await refreshGroups();
            showToast('그룹에서 나왔어요.', 'success');
            navigate('/groups');
        } catch (leaveError) {
            showToast(getErrorMessage(leaveError), 'error');
        }
    }

    async function deleteGroup() {
        if (!window.confirm('그룹을 삭제할까요? 그룹의 모집방과 역할도 함께 삭제됩니다.')) return;
        try {
            await groupsApi.remove(id);
            await refreshGroups();
            showToast('그룹을 삭제했어요.', 'success');
            navigate('/groups');
        } catch (deleteError) {
            showToast(getErrorMessage(deleteError), 'error');
        }
    }

    if (loading)
        return (
            <div className={css('page-container detail-loading')}>
                <LoadingRows />
            </div>
        );
    if (error || !group)
        return (
            <div className={css('page-container')}>
                <EmptyState
                    title="그룹을 열 수 없어요"
                    description={error ?? '그룹을 찾을 수 없어요.'}
                    action={
                        <Link className={css('button button--primary')} to="/groups">
                            그룹 목록
                        </Link>
                    }
                />
            </div>
        );

    const members = group.members ?? [];

    return (
        <AuthGate>
            <div className={css('group-detail page-container')}>
                <header className={css('group-detail__header')}>
                    <div className={css('group-identity')}>
                        <span>{group.name.slice(0, 1)}</span>
                        <div>
                            <h1>{group.name}</h1>
                            <p>
                                멤버 {members.length}명 · 모집 중{' '}
                                {rooms.filter((room) => room.status === 'RECRUITING').length}개
                            </p>
                        </div>
                    </div>
                    <Link className={css('button button--primary')} to={`/rooms/create?group=${id}`}>
                        그룹에서 모집하기
                    </Link>
                </header>
                <nav className={css('group-tabs')} aria-label="그룹 메뉴">
                    {(
                        [
                            ['rooms', '모집방', `/groups/${id}`],
                            ['members', '멤버', `/groups/${id}/members`],
                            ['roles', '역할', `/groups/${id}/roles`],
                            ['settings', '설정', `/groups/${id}/settings`],
                        ] as const
                    ).map(([value, label, to]) => (
                        <Link className={css(tab === value && 'is-active')} key={value} to={to}>
                            {label}
                        </Link>
                    ))}
                </nav>

                {tab === 'rooms' && (
                    <section className={css('tab-content')}>
                        <div className={css('section-heading')}>
                            <div>
                                <h2>그룹 모집방</h2>
                                <p>이 그룹에서 함께할 수 있는 모집을 모아봤어요.</p>
                            </div>
                        </div>
                        {rooms.length ? (
                            <div className={css('room-list')}>
                                {rooms.map((room) => (
                                    <RoomRow
                                        key={room.id}
                                        room={room}
                                        hostName={
                                            (room.participants ?? []).find((member) => member.id === room.host_id)?.name
                                        }
                                        groupName={group.name}
                                        currentUserId={currentUser?.id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="아직 모집이 없어요"
                                description="그룹의 첫 모집을 시작해 보세요."
                                action={
                                    <Link className={css('button button--primary')} to={`/rooms/create?group=${id}`}>
                                        모집 시작하기
                                    </Link>
                                }
                            />
                        )}
                    </section>
                )}

                {tab === 'members' && (
                    <section className={css('tab-content')}>
                        <div className={css('section-heading')}>
                            <div>
                                <h2>멤버</h2>
                                <p>그룹 구성원에게 기존 역할을 부여할 수 있어요.</p>
                            </div>
                            <span className={css('count-label')}>{members.length}명</span>
                        </div>
                        {members.length ? (
                            <div className={css('member-table')}>
                                <div className={css('member-table__head')}>
                                    <span>사용자</span>
                                    <span>역할 부여</span>
                                </div>
                                {members.map((member) => (
                                    <div className={css('member-table__row')} key={member.id}>
                                        <div>
                                            <Avatar name={member.name} src={member.profile_image} />
                                            <span>
                                                <strong>{member.name}</strong>
                                                <small>{member.email}</small>
                                            </span>
                                        </div>
                                        <select
                                            defaultValue=""
                                            onChange={(event) => void assignRole(Number(event.target.value), member.id)}
                                            aria-label={`${member.name}에게 역할 부여`}
                                        >
                                            <option value="" disabled>
                                                역할 선택
                                            </option>
                                            {roles.map((role) => (
                                                <option value={role.id} key={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="아직 멤버가 없어요"
                                description="친구들이 그룹에 참여하면 이곳에서 역할을 정할 수 있어요."
                            />
                        )}
                    </section>
                )}

                {tab === 'roles' && (
                    <section className={css('tab-content role-layout')}>
                        <div>
                            <div className={css('section-heading')}>
                                <div>
                                    <h2>역할</h2>
                                    <p>이름과 색상으로 그룹 안의 역할을 구분하세요.</p>
                                </div>
                            </div>
                            {roles.length ? (
                                <div className={css('role-list')}>
                                    {roles.map((role) => (
                                        <div className={css('role-row')} key={role.id}>
                                            <RoleBadge name={role.name} color={role.color} />
                                            <span>{role.color}</span>
                                            <div>
                                                <button
                                                    onClick={() => {
                                                        setEditingRole(role);
                                                        setRoleName(role.name);
                                                        setRoleColor(role.color);
                                                    }}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className={css('danger-link')}
                                                    onClick={() => void removeRole(role)}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="아직 역할이 없어요"
                                    description="첫 역할을 만들어 멤버와 모집 조건에 사용해 보세요."
                                />
                            )}
                        </div>
                        <form className={css('role-editor')} onSubmit={saveRole}>
                            <h2>{editingRole ? '역할 수정' : '역할 만들기'}</h2>
                            <Field label="역할 이름">
                                <input
                                    value={roleName}
                                    onChange={(event) => setRoleName(event.target.value)}
                                    placeholder="예: 힐러"
                                    maxLength={24}
                                    required
                                />
                            </Field>
                            <Field label="역할 색상">
                                <div className={css('color-field')}>
                                    <input
                                        type="color"
                                        value={roleColor}
                                        onChange={(event) => setRoleColor(event.target.value)}
                                    />
                                    <input
                                        value={roleColor}
                                        onChange={(event) => setRoleColor(event.target.value)}
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                        aria-label="HEX 색상"
                                    />
                                </div>
                            </Field>
                            <div className={css('role-preview')}>
                                <span>미리보기</span>
                                <RoleBadge name={roleName || '역할 이름'} color={roleColor} />
                            </div>
                            <div className={css('form-actions')}>
                                {editingRole && (
                                    <Button
                                        tone="quiet"
                                        type="button"
                                        onClick={() => {
                                            setEditingRole(null);
                                            setRoleName('');
                                            setRoleColor('#008bfe');
                                        }}
                                    >
                                        취소
                                    </Button>
                                )}
                                <Button type="submit" loading={saving}>
                                    {editingRole ? '저장' : '역할 추가'}
                                </Button>
                            </div>
                        </form>
                    </section>
                )}

                {tab === 'settings' && (
                    <section className={css('tab-content settings-stack')}>
                        <div className={css('settings-row')}>
                            <div>
                                <h2>그룹 이름</h2>
                                <p>{group.name}</p>
                            </div>
                        </div>
                        <div className={css('danger-zone')}>
                            <div>
                                <h2>그룹 나가기</h2>
                                <p>내 계정만 그룹에서 나갑니다.</p>
                            </div>
                            <Button tone="danger" onClick={() => void leaveGroup()}>
                                그룹 나가기
                            </Button>
                        </div>
                        <div className={css('danger-zone')}>
                            <div>
                                <h2>그룹 삭제</h2>
                                <p>그룹과 연결된 역할과 모집방이 함께 삭제됩니다.</p>
                            </div>
                            <Button tone="danger" onClick={() => void deleteGroup()}>
                                그룹 삭제
                            </Button>
                        </div>
                    </section>
                )}
            </div>
        </AuthGate>
    );
}
