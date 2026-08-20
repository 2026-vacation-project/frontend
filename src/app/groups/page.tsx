import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { css } from '../../appStyles';
import { groupsApi } from '../../api/groups';
import { Button, EmptyState, Field, InlineNotice, LoadingRows } from '../../components/ui';
import { GroupRow } from '../../components/group/GroupRow';
import { useApp } from '../../context/useApp';
import { AuthGate, PageHeader } from '../layout';
import { getErrorMessage } from '../../utils/format';

export default function GroupsPage({ create = false }: { create?: boolean }) {
    const navigate = useNavigate();
    const { currentUser, groups, activeGroupId, selectGroup, loadingGroups, createGroup, refreshGroups, showToast } =
        useApp();
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            const group = await createGroup(name.trim());
            navigate(`/groups/${group.id}`);
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setSubmitting(false);
        }
    }

    async function join(groupId: string) {
        if (!currentUser) return;
        setJoiningId(groupId);
        try {
            await groupsApi.join(groupId, currentUser.id);
            await refreshGroups();
            selectGroup(groupId);
            showToast('그룹에 참여했어요.', 'success');
        } catch (joinError) {
            showToast(getErrorMessage(joinError), 'error');
        } finally {
            setJoiningId(null);
        }
    }

    return (
        <AuthGate>
            <div className={css('groups-page page-container')}>
                <PageHeader
                    title={create ? '새 그룹 만들기' : '그룹'}
                    description={
                        create
                            ? '친구들과 계속 함께할 공간을 만들어 보세요.'
                            : '참여한 그룹을 고르고 모집과 역할을 관리하세요.'
                    }
                    action={
                        !create ? (
                            <Link className={css('button button--primary')} to="/groups/create">
                                그룹 만들기
                            </Link>
                        ) : undefined
                    }
                />

                {create ? (
                    <form className={css('group-create-panel')} onSubmit={submit}>
                        <div>
                            <h2>그룹 이름</h2>
                            <p>친구들이 알아보기 쉬운 이름을 사용하세요.</p>
                        </div>
                        <Field label="이름">
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="예: 금요일 게임 모임"
                                maxLength={40}
                                required
                                autoFocus
                            />
                        </Field>
                        {error && (
                            <InlineNotice tone="error" title="그룹을 만들지 못했어요">
                                {error}
                            </InlineNotice>
                        )}
                        <div className={css('form-actions')}>
                            <Link className={css('button button--quiet')} to="/groups">
                                취소
                            </Link>
                            <Button type="submit" loading={submitting} disabled={!name.trim()}>
                                그룹 만들기
                            </Button>
                        </div>
                    </form>
                ) : loadingGroups ? (
                    <LoadingRows />
                ) : groups.length === 0 ? (
                    <EmptyState
                        title="아직 그룹이 없어요"
                        description="친구들과 그룹을 만들어 빠르게 팀원을 모집해보세요."
                        action={
                            <Link className={css('button button--primary')} to="/groups/create">
                                그룹 만들기
                            </Link>
                        }
                    />
                ) : (
                    <div className={css('groups-directory')}>
                        <div className={css('directory-heading')}>
                            <span>그룹 이름</span>
                            <span>참여 상태</span>
                        </div>
                        {groups.map((group) => {
                            const joined = (group.members ?? []).some((member) => member.id === currentUser?.id);
                            return (
                                <div className={css('directory-row')} key={group.id}>
                                    <GroupRow
                                        group={group}
                                        active={group.id === activeGroupId}
                                        onSelect={selectGroup}
                                    />
                                    <div className={css('directory-row__action')}>
                                        {joined ? (
                                            <span className={css('joined-label')}>참여 중</span>
                                        ) : (
                                            <Button
                                                tone="secondary"
                                                loading={joiningId === group.id}
                                                onClick={() => void join(group.id)}
                                            >
                                                참여하기
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthGate>
    );
}
