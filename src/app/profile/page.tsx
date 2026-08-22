import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { css } from '../../appStyles';
import { gamesApi } from '../../api/games';
import { usersApi } from '../../api/users';
import { GameArtwork } from '../../components/game/GameArtwork';
import { Avatar, Button, EmptyState, LoadingRows } from '../../components/ui';
import { useApp } from '../../context/useApp';
import { AuthGate, PageHeader } from '../layout';
import type { GameSearchResult, UserResponse } from '../../types/api';
import { cacheGameCover, getCachedGameCover } from '../../utils/gameCovers';
import { getErrorMessage } from '../../utils/format';

function uniqueGameNames(games: string[]) {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const game of games) {
        const name = game.trim();
        const key = name.toLocaleLowerCase();
        if (!name || seen.has(key)) continue;
        seen.add(key);
        unique.push(name);
    }
    return unique;
}

export default function ProfilePage() {
    const { userId } = useParams();
    const { currentUser, groups, refreshCurrentUser, showToast } = useApp();
    const isOwnProfile = !userId || userId === currentUser?.id;
    const savedPreferredGames = uniqueGameNames(currentUser?.preferred_games ?? []);
    const [remoteUser, setRemoteUser] = useState<UserResponse | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(Boolean(userId && userId !== currentUser?.id));
    const [profileError, setProfileError] = useState<string | null>(null);
    const [preferredGamesDraft, setPreferredGamesDraft] = useState<string[] | null>(null);
    const preferredGames = preferredGamesDraft ?? savedPreferredGames;
    const [gameQuery, setGameQuery] = useState('');
    const [gameResults, setGameResults] = useState<GameSearchResult[]>([]);
    const [searchingGames, setSearchingGames] = useState(false);
    const [gameSearchError, setGameSearchError] = useState<string | null>(null);
    const [lastSearchedQuery, setLastSearchedQuery] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!userId || userId === currentUser?.id) return;
        let cancelled = false;
        const timer = window.setTimeout(() => {
            setLoadingProfile(true);
            usersApi
                .get(userId)
                .then((user) => {
                    if (!cancelled) {
                        setRemoteUser(user);
                        setProfileError(null);
                    }
                })
                .catch((error: unknown) => {
                    if (!cancelled) setProfileError(getErrorMessage(error));
                })
                .finally(() => {
                    if (!cancelled) setLoadingProfile(false);
                });
        }, 0);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [currentUser?.id, userId]);

    useEffect(() => {
        const searchQuery = gameQuery.trim();
        if (searchQuery.length < 2) return;

        const controller = new AbortController();
        let active = true;
        const timer = window.setTimeout(() => {
            setSearchingGames(true);
            setGameSearchError(null);
            gamesApi
                .search(searchQuery, 8, controller.signal)
                .then((results) => {
                    if (!active) return;
                    setGameResults(results);
                    setLastSearchedQuery(searchQuery);
                })
                .catch((error: unknown) => {
                    if (!active || controller.signal.aborted) return;
                    setGameResults([]);
                    setLastSearchedQuery(searchQuery);
                    setGameSearchError(getErrorMessage(error));
                })
                .finally(() => {
                    if (active) setSearchingGames(false);
                });
        }, 280);

        return () => {
            active = false;
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [gameQuery]);

    function changeGameQuery(value: string) {
        setGameQuery(value);
        setGameResults([]);
        setLastSearchedQuery('');
        setGameSearchError(null);
    }

    function addGame(game: GameSearchResult) {
        const alreadyAdded = preferredGames.some((name) => name.toLocaleLowerCase() === game.name.toLocaleLowerCase());
        if (alreadyAdded) {
            showToast('이미 관심 게임에 추가되어 있어요.', 'info');
            return;
        }
        setPreferredGamesDraft((current) => [...(current ?? savedPreferredGames), game.name]);
        cacheGameCover(game.name, game.cover_url ?? null);
        changeGameQuery('');
    }

    function removeGame(gameName: string) {
        setPreferredGamesDraft((current) => (current ?? savedPreferredGames).filter((name) => name !== gameName));
    }

    async function save(event: React.FormEvent) {
        event.preventDefault();
        if (!currentUser || !isOwnProfile) return;
        setSaving(true);
        try {
            await usersApi.updatePreferences(currentUser.id, preferredGames);
            await refreshCurrentUser();
            setPreferredGamesDraft(null);
            showToast('관심 게임을 저장했어요.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setSaving(false);
        }
    }

    if (!currentUser)
        return (
            <AuthGate>
                <span />
            </AuthGate>
        );
    if (loadingProfile)
        return (
            <div className={css('profile-page page-container')}>
                <LoadingRows count={3} />
            </div>
        );
    if (profileError)
        return (
            <div className={css('profile-page page-container')}>
                <EmptyState
                    title="사용자 정보를 불러오지 못했어요"
                    description={profileError}
                    action={
                        <Link className={css('button button--primary')} to="/profile">
                            내 정보 보기
                        </Link>
                    }
                />
            </div>
        );

    const profileUser = isOwnProfile ? currentUser : remoteUser;
    if (!profileUser)
        return (
            <div className={css('profile-page page-container')}>
                <EmptyState title="사용자를 찾을 수 없어요" description="찾는 사용자 정보가 없습니다." />
            </div>
        );

    const membersOf = groups.filter((group) => (group.members ?? []).some((member) => member.id === profileUser.id));
    const displayedPreferredGames = isOwnProfile ? preferredGames : (profileUser.preferred_games ?? []);
    const hasPreferenceChanges = JSON.stringify(preferredGames) !== JSON.stringify(savedPreferredGames);

    return (
        <AuthGate>
            <div className={css('profile-page page-container')}>
                <PageHeader
                    title={isOwnProfile ? '내 정보' : `${profileUser.name}님의 정보`}
                    description={
                        isOwnProfile ? '관심 게임과 참여 중인 그룹을 관리합니다.' : '관심 게임과 참여 중인 그룹입니다.'
                    }
                />
                <div className={css('profile-grid')}>
                    <section className={css('profile-identity')}>
                        <Avatar name={profileUser.name} src={profileUser.profile_image} size="lg" />
                        <div>
                            <h2>{profileUser.name}</h2>
                            <p>{profileUser.email}</p>
                        </div>
                    </section>
                    {isOwnProfile ? (
                        <form className={css('profile-preferences')} onSubmit={save}>
                            <div className={css('profile-preferences__heading')}>
                                <h2>관심 게임</h2>
                                <Button type="submit" loading={saving} disabled={!hasPreferenceChanges}>
                                    저장
                                </Button>
                            </div>
                            <p>게임을 검색해 관심 목록에 추가할 수 있습니다.</p>
                            <div className={css('field')}>
                                <label className={css('field__label')} htmlFor="preferred-game-search">
                                    게임 검색
                                </label>
                                <div className={css('game-search')}>
                                    <input
                                        id="preferred-game-search"
                                        value={gameQuery}
                                        onChange={(event) => changeGameQuery(event.target.value)}
                                        placeholder="두 글자 이상 입력해 주세요"
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded={gameQuery.trim().length >= 2}
                                        aria-controls="preferred-game-results"
                                        autoComplete="off"
                                        maxLength={100}
                                    />
                                    {gameQuery.trim().length >= 2 && (
                                        <div
                                            className={css('game-search__panel')}
                                            id="preferred-game-results"
                                            role="listbox"
                                        >
                                            {searchingGames || lastSearchedQuery !== gameQuery.trim() ? (
                                                <div className={css('game-search__status')}>검색 중…</div>
                                            ) : gameSearchError ? (
                                                <div className={css('game-search__status game-search__status--error')}>
                                                    게임을 검색하지 못했어요. 잠시 후 다시 시도해 주세요.
                                                </div>
                                            ) : !gameResults.length ? (
                                                <div className={css('game-search__status')}>
                                                    검색 결과가 없습니다. 다른 이름을 입력해 보세요.
                                                </div>
                                            ) : (
                                                gameResults.map((game) => (
                                                    <button
                                                        key={game.id}
                                                        type="button"
                                                        className={css('game-result')}
                                                        role="option"
                                                        aria-selected={preferredGames.some(
                                                            (name) =>
                                                                name.toLocaleLowerCase() ===
                                                                game.name.toLocaleLowerCase(),
                                                        )}
                                                        onClick={() => addGame(game)}
                                                    >
                                                        <GameArtwork name={game.name} src={game.cover_url} size="sm" />
                                                        <span>
                                                            <strong>{game.name}</strong>
                                                            <small>
                                                                {[
                                                                    game.first_release_date?.slice(0, 4),
                                                                    game.platforms.slice(0, 2).join(' · '),
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(' · ') || '게임 정보 보기'}
                                                            </small>
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span className={css('field__hint')}>검색 결과를 누르면 아래 목록에 추가됩니다.</span>
                            </div>
                            <div className={css('preference-list')} aria-live="polite">
                                <div className={css('preference-list__heading')}>
                                    <strong>선택한 게임</strong>
                                    <span>{preferredGames.length}개</span>
                                </div>
                                {preferredGames.length ? (
                                    <ul>
                                        {preferredGames.map((gameName) => (
                                            <li key={gameName} className={css('preference-game-row')}>
                                                <GameArtwork
                                                    name={gameName}
                                                    src={getCachedGameCover(gameName)}
                                                    size="sm"
                                                />
                                                <strong>{gameName}</strong>
                                                <button
                                                    type="button"
                                                    onClick={() => removeGame(gameName)}
                                                    aria-label={`${gameName} 관심 게임에서 삭제`}
                                                >
                                                    삭제
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={css('preference-list__empty')}>아직 선택한 게임이 없습니다.</p>
                                )}
                            </div>
                        </form>
                    ) : (
                        <section className={css('profile-preferences')}>
                            <h2>관심 게임</h2>
                            {displayedPreferredGames.length ? (
                                <ul className={css('preference-public-list')}>
                                    {displayedPreferredGames.map((gameName) => (
                                        <li key={gameName} className={css('preference-game-row')}>
                                            <GameArtwork name={gameName} src={getCachedGameCover(gameName)} size="sm" />
                                            <strong>{gameName}</strong>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>아직 공개된 관심 게임이 없어요.</p>
                            )}
                        </section>
                    )}
                </div>
                <section className={css('profile-groups')}>
                    <div className={css('section-heading')}>
                        <div>
                            <h2>참여한 그룹</h2>
                            <p>
                                {isOwnProfile
                                    ? '현재 참여 중인 그룹입니다.'
                                    : `${profileUser.name}님이 참여 중인 그룹입니다.`}
                            </p>
                        </div>
                    </div>
                    {membersOf.length ? (
                        <div className={css('simple-list')}>
                            {membersOf.map((group) => (
                                <Link key={group.id} to={`/groups/${group.id}`}>
                                    <span className={css('group-mark')}>{group.name.slice(0, 1)}</span>
                                    <span>
                                        <strong>{group.name}</strong>
                                        <small>멤버 {group.members?.length ?? 0}명</small>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="참여 중인 그룹이 없습니다"
                            description="그룹에 참여하면 여기에서 확인할 수 있습니다."
                        />
                    )}
                </section>
            </div>
        </AuthGate>
    );
}
