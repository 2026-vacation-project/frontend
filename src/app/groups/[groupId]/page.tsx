import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { css } from '../../../appStyles';
import { groupsApi } from '../../../api/groups';
import { rolesApi } from '../../../api/roles';
import { roomsApi } from '../../../api/rooms';
import { RoomRow } from '../../../components/room/RoomRow';
import { Avatar, Button, Dropdown, EmptyState, Field, LoadingRows, RoleBadge } from '../../../components/ui';
import { useConfirmDialog } from '../../../components/ui/useConfirmDialog';
import { useApp } from '../../../context/useApp';
import { AuthGate } from '../../layout';
import type { GroupResponse, RoleResponse, RoomResponse } from '../../../types/api';
import { getErrorMessage, userDisplayName, userDisplayNameDetail } from '../../../utils/format';

type GroupTab = 'rooms' | 'members' | 'roles' | 'settings';

async function copyText(value: string) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);
            return;
        } catch {
            // Some browsers expose the clipboard API but block it outside a secure connection.
        }
    }

    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand('copy');
    textArea.remove();
    if (!copied) throw new Error('링크를 복사하지 못했어요.');
}

export default function GroupDetailPage() {
    const { groupId } = useParams();
    const id = groupId ?? '';
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
    const [joiningGroup, setJoiningGroup] = useState(false);
    const [savingVisibility, setSavingVisibility] = useState(false);
    const [sharingGroup, setSharingGroup] = useState(false);
    const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
    const { confirm, dialog: confirmDialog } = useConfirmDialog();

    const tab: GroupTab = location.pathname.endsWith('/members')
        ? 'members'
        : location.pathname.endsWith('/roles')
          ? 'roles'
          : location.pathname.endsWith('/settings')
            ? 'settings'
            : 'rooms';
    const joined = (group?.members ?? []).some((member) => member.id === currentUser?.id);

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

    useEffect(() => {
        if (group && !joined && tab !== 'rooms') navigate(`/groups/${id}`, { replace: true });
    }, [group, id, joined, navigate, tab]);

    async function saveRole(event: React.FormEvent) {
        event.preventDefault();
        if (!roleName.trim()) return;
        setSaving(true);
        try {
            if (editingRole) await rolesApi.update(id, editingRole.id, { name: roleName.trim(), color: roleColor });
            else await rolesApi.create(id, { name: roleName.trim(), color: roleColor });
            setRoleName('');
            setEditingRole(null);
            showToast(editingRole ? '태그를 수정했어요.' : '태그를 추가했어요.', 'success');
            await load();
        } catch (saveError) {
            showToast(getErrorMessage(saveError), 'error');
        } finally {
            setSaving(false);
        }
    }

    async function removeRole(role: RoleResponse) {
        const confirmed = await confirm({
            title: `${role.name} 태그를 삭제할까요?`,
            description: '이 태그는 멤버와 모집방에서도 함께 제거됩니다.',
            confirmLabel: '태그 삭제',
            tone: 'danger',
        });
        if (!confirmed) return;
        try {
            await rolesApi.remove(id, role.id);
            showToast('태그를 삭제했어요.', 'success');
            await load();
        } catch (removeError) {
            showToast(getErrorMessage(removeError), 'error');
        }
    }

    async function changeMemberTags(userId: string, nextValue: string | string[]) {
        if (!Array.isArray(nextValue) || updatingMemberId) return;
        const currentTagIds = new Set(
            roles.filter((role) => (role.user_ids ?? []).includes(userId)).map((role) => role.id),
        );
        const nextTagIds = new Set(nextValue);
        const changedRole = roles.find((role) => currentTagIds.has(role.id) !== nextTagIds.has(role.id));
        if (!changedRole) return;

        setUpdatingMemberId(userId);
        try {
            const updatedRole = nextTagIds.has(changedRole.id)
                ? await rolesApi.assign(id, changedRole.id, userId)
                : await rolesApi.unassign(id, changedRole.id, userId);
            setRoles((current) => current.map((role) => (role.id === updatedRole.id ? updatedRole : role)));
            showToast(nextTagIds.has(changedRole.id) ? '태그를 붙였어요.' : '태그를 뗐어요.', 'success');
        } catch (assignError) {
            showToast(getErrorMessage(assignError), 'error');
        } finally {
            setUpdatingMemberId(null);
        }
    }

    async function leaveGroup() {
        if (!currentUser) return;
        const confirmed = await confirm({
            title: '이 그룹에서 나갈까요?',
            description: '이 그룹에서 받은 태그도 함께 사라집니다.',
            confirmLabel: '그룹 나가기',
            tone: 'danger',
        });
        if (!confirmed) return;
        try {
            await groupsApi.leave(id, currentUser.id);
            await refreshGroups();
            showToast('그룹에서 나왔어요.', 'success');
            navigate('/groups');
        } catch (leaveError) {
            showToast(getErrorMessage(leaveError), 'error');
        }
    }

    async function joinGroup() {
        if (!currentUser) return;
        setJoiningGroup(true);
        try {
            await groupsApi.join(id, currentUser.id);
            await refreshGroups();
            await load();
            showToast('그룹에 참여했어요. 이제 이 그룹에서 모집할 수 있어요.', 'success');
        } catch (joinError) {
            showToast(getErrorMessage(joinError), 'error');
        } finally {
            setJoiningGroup(false);
        }
    }

    async function shareGroup() {
        if (!group || sharingGroup) return;
        const url = `${window.location.origin}/groups/${id}`;
        setSharingGroup(true);

        try {
            await copyText(url);
            showToast('그룹 링크를 복사했어요.', 'success');
            return;
        } catch {
            if (!navigator.share) {
                showToast('링크를 복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.', 'error');
                return;
            }

            try {
                await navigator.share({
                    title: `${group.name} 그룹`,
                    text: '팀모아에서 그룹에 참여해 보세요.',
                    url,
                });
            } catch (shareError) {
                if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
                showToast('공유 창을 열지 못했어요. 주소창의 링크를 직접 복사해 주세요.', 'error');
            }
        } finally {
            setSharingGroup(false);
        }
    }

    async function changeVisibility(isPublic: boolean) {
        if (!group || group.is_public === isPublic) return;
        setSavingVisibility(true);
        try {
            const updated = await groupsApi.updateVisibility(id, isPublic);
            setGroup(updated);
            await refreshGroups();
            showToast(isPublic ? '그룹을 공개로 바꿨어요.' : '그룹을 비공개로 바꿨어요.', 'success');
        } catch (visibilityError) {
            showToast(getErrorMessage(visibilityError), 'error');
        } finally {
            setSavingVisibility(false);
        }
    }

    async function deleteGroup() {
        const confirmed = await confirm({
            title: '그룹을 삭제할까요?',
            description: '그룹의 모집방과 태그가 모두 삭제되며 되돌릴 수 없습니다.',
            confirmLabel: '그룹 삭제',
            tone: 'danger',
        });
        if (!confirmed) return;
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
                                {group.is_public ? '공개 그룹' : '비공개 그룹'} · 멤버 {members.length}명 · 모집 중{' '}
                                {rooms.filter((room) => room.status === 'RECRUITING').length}개
                            </p>
                        </div>
                    </div>
                    <div className={css('group-detail__actions')}>
                        <Button
                            tone="secondary"
                            onClick={() => void shareGroup()}
                            loading={sharingGroup}
                            disabled={sharingGroup}
                        >
                            링크 공유
                        </Button>
                        {joined ? (
                            <Link className={css('button button--primary')} to={`/rooms/create?group=${id}`}>
                                그룹에서 모집하기
                            </Link>
                        ) : (
                            <Button onClick={() => void joinGroup()} loading={joiningGroup}>
                                그룹 참여하기
                            </Button>
                        )}
                    </div>
                </header>
                <nav className={css('group-tabs')} aria-label="그룹 메뉴">
                    {(
                        [
                            ['rooms', '모집방', `/groups/${id}`],
                            ['members', '멤버', `/groups/${id}/members`],
                            ['roles', '태그', `/groups/${id}/roles`],
                            ['settings', '설정', `/groups/${id}/settings`],
                        ] as const
                    )
                        .filter(([value]) => joined || value === 'rooms')
                        .map(([value, label, to]) => (
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
                                <p>
                                    {joined
                                        ? '이 그룹에서 만든 모집방입니다.'
                                        : '목록만 볼 수 있어요. 상세 정보는 그룹 참여 후 확인할 수 있어요.'}
                                </p>
                            </div>
                        </div>
                        {rooms.length ? (
                            <div className={css('room-list')}>
                                {rooms.map((room) => {
                                    const host = (room.participants ?? []).find((member) => member.id === room.host_id);
                                    return (
                                        <RoomRow
                                            key={room.id}
                                            room={room}
                                            hostName={host ? userDisplayName(host) : undefined}
                                            groupName={group.name}
                                            currentUserId={currentUser?.id}
                                            detailsAvailable={joined}
                                            restrictedAction={
                                                !joined ? (
                                                    <Button onClick={() => void joinGroup()} loading={joiningGroup}>
                                                        그룹 참여하기
                                                    </Button>
                                                ) : undefined
                                            }
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                title={joined ? '이 그룹의 첫 모집방을 만들어 보세요' : '이 그룹에 참여해 주세요'}
                                description={
                                    joined
                                        ? '게임과 필요한 인원을 정하면 바로 모집을 시작할 수 있습니다.'
                                        : '그룹에 참여하면 이 안에서 모집방을 만들고 참가할 수 있습니다.'
                                }
                                action={
                                    joined ? (
                                        <Link
                                            className={css('button button--primary')}
                                            to={`/rooms/create?group=${id}`}
                                        >
                                            이 그룹에서 모집하기
                                        </Link>
                                    ) : (
                                        <Button onClick={() => void joinGroup()} loading={joiningGroup}>
                                            그룹 참여하기
                                        </Button>
                                    )
                                }
                            />
                        )}
                    </section>
                )}

                {tab === 'members' && joined && (
                    <section className={css('tab-content')}>
                        <div className={css('section-heading')}>
                            <div>
                                <h2>멤버</h2>
                                <p>멤버에게 태그를 붙여 모집 대상을 구분할 수 있습니다.</p>
                            </div>
                            <span className={css('count-label')}>{members.length}명</span>
                        </div>
                        {members.length ? (
                            <div className={css('member-table')}>
                                <div className={css('member-table__head')}>
                                    <span>멤버</span>
                                    <span>태그</span>
                                </div>
                                {members.map((member) => {
                                    const memberTags = roles.filter((role) =>
                                        (role.user_ids ?? []).includes(member.id),
                                    );
                                    const displayNameDetail = userDisplayNameDetail(member);
                                    return (
                                        <div className={css('member-table__row')} key={member.id}>
                                            <div>
                                                <Avatar name={userDisplayName(member)} src={member.profile_image} />
                                                <span>
                                                    <strong>{member.name}</strong>
                                                    {displayNameDetail && <small>{displayNameDetail}</small>}
                                                </span>
                                            </div>
                                            <div className={css('member-tag-control')}>
                                                {memberTags.length > 0 && (
                                                    <div
                                                        className={css('member-tags')}
                                                        aria-label={`${userDisplayName(member)}의 태그`}
                                                    >
                                                        {memberTags.map((tag) => (
                                                            <RoleBadge key={tag.id} name={tag.name} color={tag.color} />
                                                        ))}
                                                    </div>
                                                )}
                                                <Dropdown
                                                    multiple
                                                    ariaLabel={`${userDisplayName(member)}의 태그 선택`}
                                                    value={memberTags.map((tag) => tag.id)}
                                                    onChange={(nextValue) =>
                                                        void changeMemberTags(member.id, nextValue)
                                                    }
                                                    placeholder={
                                                        roles.length ? '태그 선택' : '먼저 태그를 만들어 주세요'
                                                    }
                                                    disabled={!roles.length || updatingMemberId === member.id}
                                                    options={roles.map((role) => ({
                                                        value: role.id,
                                                        label: role.name,
                                                        color: role.color,
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                title="아직 멤버가 없어요"
                                description="멤버가 참여하면 태그를 붙일 수 있습니다."
                            />
                        )}
                    </section>
                )}

                {tab === 'roles' && joined && (
                    <section className={css('tab-content role-layout')}>
                        <div>
                            <div className={css('section-heading')}>
                                <div>
                                    <h2>태그</h2>
                                    <p>모집할 대상을 구분하는 태그 이름과 색상을 관리합니다.</p>
                                </div>
                            </div>
                            {roles.length ? (
                                <div className={css('role-list')}>
                                    {roles.map((role) => (
                                        <div className={css('role-row')} key={role.id}>
                                            <RoleBadge name={role.name} color={role.color} />
                                            <span>멤버 {role.user_ids?.length ?? 0}명</span>
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
                                    title="아직 태그가 없어요"
                                    description="태그를 만들면 멤버에게 붙이고 모집방에서 찾을 태그로 고를 수 있습니다."
                                />
                            )}
                        </div>
                        <form className={css('role-editor')} onSubmit={saveRole}>
                            <h2>{editingRole ? '태그 수정' : '태그 만들기'}</h2>
                            <Field label="태그 이름">
                                <input
                                    value={roleName}
                                    onChange={(event) => setRoleName(event.target.value)}
                                    placeholder="예: 힐러"
                                    maxLength={24}
                                    required
                                />
                            </Field>
                            <Field label="태그 색상">
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
                                        aria-label="색상 직접 입력"
                                    />
                                </div>
                            </Field>
                            <div className={css('role-preview')}>
                                <span>미리보기</span>
                                <RoleBadge name={roleName || '태그 이름'} color={roleColor} />
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
                                    {editingRole ? '저장' : '태그 추가'}
                                </Button>
                            </div>
                        </form>
                    </section>
                )}

                {tab === 'settings' && joined && (
                    <section className={css('tab-content settings-stack')}>
                        <div className={css('settings-row')}>
                            <div>
                                <h2>그룹 이름</h2>
                                <p>{group.name}</p>
                            </div>
                        </div>
                        <div className={css('settings-row')}>
                            <div>
                                <h2>그룹 공개 범위</h2>
                                <p>
                                    {group.is_public
                                        ? '그룹 목록에서 누구나 찾고 참여할 수 있어요.'
                                        : '참여한 멤버에게만 보이며, 다른 사람은 공유 링크로 들어올 수 있어요.'}
                                </p>
                            </div>
                            <Button
                                tone="secondary"
                                loading={savingVisibility}
                                onClick={() => void changeVisibility(!group.is_public)}
                            >
                                {group.is_public ? '비공개로 변경' : '공개로 변경'}
                            </Button>
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
                                <p>그룹과 연결된 태그와 모집방이 함께 삭제됩니다.</p>
                            </div>
                            <Button tone="danger" onClick={() => void deleteGroup()}>
                                그룹 삭제
                            </Button>
                        </div>
                    </section>
                )}
                {confirmDialog}
            </div>
        </AuthGate>
    );
}
