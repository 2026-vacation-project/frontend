import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { css } from '../../appStyles';
import { groupsApi } from '../../api/groups';
import { Button, EmptyState, Field, InlineNotice, LoadingRows } from '../../components/ui';
import { GroupRow } from '../../components/group/GroupRow';
import { useApp } from '../../context/useApp';
import { AuthGate, PageHeader } from '../layout';
import { getErrorMessage } from '../../utils/format';

const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', {
    weekday: 'long',
    timeZone: 'Asia/Seoul',
});

export default function GroupsPage({ create = false }: { create?: boolean }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser, groups, activeGroupId, selectGroup, loadingGroups, createGroup, refreshGroups, showToast } =
        useApp();
    const [name, setName] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const today = weekdayFormatter.format(new Date());
    const continueToRoom = searchParams.get('next') === 'room';

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            const group = await createGroup(name.trim(), isPublic);
            navigate(continueToRoom ? `/rooms/create?group=${group.id}` : `/groups/${group.id}`);
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
            if (continueToRoom) navigate(`/rooms/create?group=${groupId}`);
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
                            ? '그룹을 만든 뒤 그 안에서 모집방을 열 수 있어요.'
                            : continueToRoom
                              ? '모집방을 만들 그룹에 참여하거나 새 그룹을 만드세요.'
                              : '참여 중인 그룹과 가입할 수 있는 공개 그룹입니다.'
                    }
                    action={
                        !create ? (
                            <Link
                                className={css('button button--primary')}
                                to={continueToRoom ? '/groups/create?next=room' : '/groups/create'}
                            >
                                그룹 만들기
                            </Link>
                        ) : undefined
                    }
                />

                {create ? (
                    <form className={css('group-create-panel')} onSubmit={submit}>
                        <div>
                            <h2>그룹 이름</h2>
                            <p>
                                {continueToRoom
                                    ? '함께 게임할 그룹의 이름을 정하면 바로 첫 모집을 시작합니다.'
                                    : '멤버가 구분하기 쉬운 이름을 입력하세요.'}
                            </p>
                        </div>
                        <Field label="이름">
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder={`예: ${today} 게임 모임`}
                                maxLength={40}
                                required
                                autoFocus
                            />
                        </Field>
                        <fieldset className={css('visibility-field')}>
                            <legend>공개 범위</legend>
                            <label className={css('visibility-option')}>
                                <input
                                    type="radio"
                                    name="group-visibility"
                                    checked={isPublic}
                                    onChange={() => setIsPublic(true)}
                                />
                                <span>
                                    <strong>공개 그룹</strong>
                                    <small>그룹 목록에 표시되어 누구나 찾고 참여할 수 있어요.</small>
                                </span>
                            </label>
                            <label className={css('visibility-option')}>
                                <input
                                    type="radio"
                                    name="group-visibility"
                                    checked={!isPublic}
                                    onChange={() => setIsPublic(false)}
                                />
                                <span>
                                    <strong>비공개 그룹</strong>
                                    <small>참여한 멤버에게만 보이며, 다른 사람은 공유 링크로 들어올 수 있어요.</small>
                                </span>
                            </label>
                        </fieldset>
                        {error && (
                            <InlineNotice tone="error" title="그룹을 만들지 못했어요">
                                {error}
                            </InlineNotice>
                        )}
                        <div className={css('form-actions')}>
                            <Link className={css('button button--quiet')} to={continueToRoom ? '/rooms' : '/groups'}>
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
                        title="그룹이 없습니다"
                        description="그룹을 만든 뒤 멤버와 모집방을 관리할 수 있습니다."
                        action={
                            <Link
                                className={css('button button--primary')}
                                to={continueToRoom ? '/groups/create?next=room' : '/groups/create'}
                            >
                                그룹 만들기
                            </Link>
                        }
                    />
                ) : (
                    <div className={css('groups-directory')}>
                        <div className={css('directory-heading')}>
                            <span>그룹 이름</span>
                            <span>내 참여</span>
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
