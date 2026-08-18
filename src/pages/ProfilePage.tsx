import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { usersApi } from '../api/users'
import { Avatar, Button, EmptyState, Field, InlineNotice, LoadingRows } from '../components/ui'
import { useApp } from '../context/useApp'
import { AuthGate, PageHeader } from '../layouts/AppLayout'
import type { UserResponse } from '../types/api'
import { getErrorMessage } from '../utils/format'

export function ProfilePage() {
    const { userId } = useParams()
    const { currentUser, groups, refreshCurrentUser, showToast } = useApp()
    const isOwnProfile = !userId || userId === currentUser?.id
    const [remoteUser, setRemoteUser] = useState<UserResponse | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(Boolean(userId && userId !== currentUser?.id))
    const [profileError, setProfileError] = useState<string | null>(null)
    const [games, setGames] = useState(currentUser?.preferred_games?.join(', ') ?? '')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!userId || userId === currentUser?.id) return
        let cancelled = false
        const timer = window.setTimeout(() => {
            setLoadingProfile(true)
            usersApi
                .get(userId)
                .then((user) => {
                    if (!cancelled) {
                        setRemoteUser(user)
                        setProfileError(null)
                    }
                })
                .catch((error: unknown) => {
                    if (!cancelled) setProfileError(getErrorMessage(error))
                })
                .finally(() => {
                    if (!cancelled) setLoadingProfile(false)
                })
        }, 0)
        return () => {
            cancelled = true
            window.clearTimeout(timer)
        }
    }, [currentUser?.id, userId])

    async function save(event: React.FormEvent) {
        event.preventDefault()
        if (!currentUser || !isOwnProfile) return
        const preferredGames = games
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        setSaving(true)
        try {
            await usersApi.updatePreferences(currentUser.id, preferredGames)
            await refreshCurrentUser()
            showToast('관심 게임을 저장했어요.', 'success')
        } catch (error) {
            showToast(getErrorMessage(error), 'error')
        } finally {
            setSaving(false)
        }
    }

    if (!currentUser)
        return (
            <AuthGate>
                <span />
            </AuthGate>
        )
    if (loadingProfile)
        return (
            <div className="profile-page page-container">
                <LoadingRows count={3} />
            </div>
        )
    if (profileError)
        return (
            <div className="profile-page page-container">
                <EmptyState
                    title="프로필을 불러오지 못했어요"
                    description={profileError}
                    action={
                        <Link className="button button--primary" to="/profile">
                            내 프로필 보기
                        </Link>
                    }
                />
            </div>
        )

    const profileUser = isOwnProfile ? currentUser : remoteUser
    if (!profileUser)
        return (
            <div className="profile-page page-container">
                <EmptyState title="사용자를 찾을 수 없어요" description="요청한 프로필 정보가 없습니다." />
            </div>
        )

    const membersOf = groups.filter((group) => (group.members ?? []).some((member) => member.id === profileUser.id))
    const preferredGames = profileUser.preferred_games ?? []

    return (
        <AuthGate>
            <div className="profile-page page-container">
                <PageHeader
                    title={isOwnProfile ? '내 프로필' : `${profileUser.name} 프로필`}
                    description={
                        isOwnProfile
                            ? '좋아하는 게임과 함께하는 그룹을 관리하세요.'
                            : '이 사용자가 좋아하는 게임과 함께하는 그룹을 확인하세요.'
                    }
                />
                <div className="profile-grid">
                    <section className="profile-identity">
                        <Avatar name={profileUser.name} src={profileUser.profile_image} size="lg" />
                        <div>
                            <h2>{profileUser.name}</h2>
                            <p>{profileUser.email}</p>
                            <span>{profileUser.id}</span>
                        </div>
                    </section>
                    {isOwnProfile ? (
                        <form className="profile-preferences" onSubmit={save}>
                            <h2>관심 게임</h2>
                            <p>쉼표로 구분해 입력하세요. 현재 API의 `preferred_games` 필드에 저장됩니다.</p>
                            <Field label="관심 게임">
                                <input
                                    value={games}
                                    onChange={(event) => setGames(event.target.value)}
                                    placeholder="오버워치 2, 발로란트, 리그 오브 레전드"
                                />
                            </Field>
                            <Button type="submit" loading={saving}>
                                저장
                            </Button>
                        </form>
                    ) : (
                        <section className="profile-preferences">
                            <h2>관심 게임</h2>
                            <p>
                                {preferredGames.length ? preferredGames.join(' · ') : '아직 공개된 관심 게임이 없어요.'}
                            </p>
                        </section>
                    )}
                </div>
                <section className="profile-groups">
                    <div className="section-heading">
                        <div>
                            <h2>참여한 그룹</h2>
                            <p>
                                {isOwnProfile
                                    ? '내 계정이 멤버로 등록된 그룹입니다.'
                                    : `${profileUser.name}님이 멤버로 등록된 그룹입니다.`}
                            </p>
                        </div>
                    </div>
                    {membersOf.length ? (
                        <div className="simple-list">
                            {membersOf.map((group) => (
                                <Link key={group.id} to={`/groups/${group.id}`}>
                                    <span className="group-mark">{group.name.slice(0, 1)}</span>
                                    <span>
                                        <strong>{group.name}</strong>
                                        <small>멤버 {group.members?.length ?? 0}명</small>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="참여한 그룹이 없어요"
                            description="현재 조회 가능한 그룹에서 멤버 정보를 찾지 못했어요."
                        />
                    )}
                </section>
                {isOwnProfile && (
                    <InlineNotice title="프로필 필드 범위">
                        현재 API는 이름과 프로필 이미지 수정 엔드포인트를 제공하지 않습니다.
                    </InlineNotice>
                )}
            </div>
        </AuthGate>
    )
}
