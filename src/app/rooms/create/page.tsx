import { animated, useTransition } from '@react-spring/web';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { css } from '../../../appStyles';
import { gamesApi } from '../../../api/games';
import { roomsApi } from '../../../api/rooms';
import { GameArtwork } from '../../../components/game/GameArtwork';
import { Button, EmptyState, Field, InlineNotice, LoadingRows } from '../../../components/ui';
import { useApp } from '../../../context/useApp';
import type { GameSearchResult, RoomCreate } from '../../../types/api';
import { cacheGameCover, getCachedGameCover } from '../../../utils/gameCovers';
import { getErrorMessage } from '../../../utils/format';
import { AuthGate, PageHeader } from '../../layout';

export default function RoomFormPage({ edit = false }: { edit?: boolean }) {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, groups, activeGroupId, loadingGroups, selectGroup, showToast } = useApp();
    const requestedGroup = searchParams.get('group') || activeGroupId || groups[0]?.id || '';
    const [groupId, setGroupId] = useState(requestedGroup);
    const [form, setForm] = useState<RoomCreate>({ game_name: '', target_count: 5 });
    const [loading, setLoading] = useState(edit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gameResults, setGameResults] = useState<GameSearchResult[]>([]);
    const [selectedGame, setSelectedGame] = useState<GameSearchResult | null>(null);
    const [confirmedGameName, setConfirmedGameName] = useState('');
    const [searchingGames, setSearchingGames] = useState(false);
    const [gameSearchError, setGameSearchError] = useState<string | null>(null);
    const [lastSearchedQuery, setLastSearchedQuery] = useState('');
    const joinedGroups = groups.filter((group) =>
        (group.members ?? []).some((member) => member.id === currentUser?.id),
    );
    const effectiveGroupId = joinedGroups.some((group) => group.id === groupId)
        ? groupId
        : (joinedGroups.find((group) => group.id === activeGroupId)?.id ?? joinedGroups[0]?.id ?? '');
    const selectedGroup = joinedGroups.find((group) => group.id === effectiveGroupId);

    const gameResultTransitions = useTransition(gameResults, {
        keys: (game) => game.id,
        from: { opacity: 0, transform: 'translateY(-6px)' },
        enter: { opacity: 1, transform: 'translateY(0px)' },
        leave: { opacity: 0, transform: 'translateY(-3px)' },
        trail: 35,
        config: { tension: 300, friction: 26 },
    });

    useEffect(() => {
        if (!edit || !roomId || !effectiveGroupId) return;
        const timer = window.setTimeout(() => {
            setLoading(true);
            roomsApi
                .get(effectiveGroupId, roomId)
                .then((room) => {
                    const coverUrl = room.game_cover_url ?? getCachedGameCover(room.game_name);
                    setForm({
                        game_name: room.game_name,
                        target_count: room.target_count,
                    });
                    setConfirmedGameName(room.game_name);
                    setSelectedGame({
                        id: 0,
                        name: room.game_name,
                        cover_url: coverUrl,
                        platforms: [],
                    });
                })
                .catch((loadError: unknown) => setError(getErrorMessage(loadError)))
                .finally(() => setLoading(false));
        }, 0);
        return () => window.clearTimeout(timer);
    }, [edit, roomId, effectiveGroupId]);

    useEffect(() => {
        const searchQuery = form.game_name.trim();
        if (searchQuery.length < 2 || searchQuery === confirmedGameName) return;

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
                .catch((searchError: unknown) => {
                    if (!active || (searchError instanceof DOMException && searchError.name === 'AbortError')) return;
                    setGameResults([]);
                    setLastSearchedQuery(searchQuery);
                    setGameSearchError('게임을 검색하지 못했어요. 잠시 후 다시 시도해 주세요.');
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
    }, [confirmedGameName, form.game_name]);

    function changeGameName(value: string) {
        setForm((current) => ({ ...current, game_name: value }));
        setSelectedGame(null);
        setConfirmedGameName('');
        setGameResults([]);
        setLastSearchedQuery('');
        setGameSearchError(null);
    }

    function selectGame(game: GameSearchResult) {
        setForm((current) => ({ ...current, game_name: game.name }));
        setSelectedGame(game);
        setConfirmedGameName(game.name);
        setGameResults([]);
        setLastSearchedQuery('');
        setGameSearchError(null);
        cacheGameCover(game.name, game.cover_url ?? null);
    }

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!currentUser || !effectiveGroupId) return;
        setSubmitting(true);
        setError(null);
        try {
            const room =
                edit && roomId
                    ? await roomsApi.update(effectiveGroupId, roomId, form)
                    : await roomsApi.create(effectiveGroupId, currentUser.id, form);
            selectGroup(effectiveGroupId);
            showToast(edit ? '모집 정보를 수정했어요.' : '새 모집을 시작했어요.', 'success');
            navigate(`/rooms/${room.id}?group=${effectiveGroupId}`);
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthGate>
            <div className={css('form-page page-container')}>
                <PageHeader
                    title={edit ? '모집방 수정' : '새 모집 만들기'}
                    description={
                        selectedGroup
                            ? `${selectedGroup.name} 그룹 안에 ${edit ? '있는 모집방을 수정합니다.' : '새 모집방을 만듭니다.'}`
                            : '모집방은 그룹 안에 만들어집니다.'
                    }
                />
                {loading || loadingGroups ? (
                    <LoadingRows count={3} />
                ) : !joinedGroups.length ? (
                    <EmptyState
                        title={groups.length ? '먼저 그룹에 참여해 주세요' : '먼저 그룹을 만들어 주세요'}
                        description={
                            groups.length
                                ? '기존 그룹에 참여하거나 새 그룹을 만들면 그 안에서 모집을 시작할 수 있습니다.'
                                : '그룹을 만든 다음 바로 그 안에서 첫 모집을 시작할 수 있습니다.'
                        }
                        action={
                            <Link
                                className={css('button button--primary')}
                                to={groups.length ? '/groups?next=room' : '/groups/create?next=room'}
                            >
                                {groups.length ? '참여할 그룹 찾기' : '첫 그룹 만들기'}
                            </Link>
                        }
                    />
                ) : (
                    <form className={css('entity-form')} onSubmit={submit}>
                        <div className={css('form-section')}>
                            <h2>어느 그룹에서 모집할까요?</h2>
                            <p>선택한 그룹의 멤버가 이 모집방을 함께 사용합니다.</p>
                            <Field label="모집방이 만들어질 그룹">
                                <select
                                    value={effectiveGroupId}
                                    onChange={(event) => {
                                        setGroupId(event.target.value);
                                        selectGroup(event.target.value);
                                    }}
                                    required
                                >
                                    <option value="" disabled>
                                        그룹 선택
                                    </option>
                                    {joinedGroups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <div className={css('form-section')}>
                            <h2>게임</h2>
                            <Field label="게임 검색" hint="두 글자 이상 입력하고 검색 결과에서 게임을 선택해 주세요.">
                                <div className={css('game-search')}>
                                    <input
                                        value={form.game_name}
                                        onChange={(event) => changeGameName(event.target.value)}
                                        placeholder="예: 오버워치 2, 발로란트"
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded={
                                            form.game_name.trim().length >= 2 && form.game_name !== confirmedGameName
                                        }
                                        aria-controls="game-search-results"
                                        autoComplete="off"
                                        required
                                        maxLength={60}
                                    />
                                    {form.game_name.trim().length >= 2 && form.game_name !== confirmedGameName && (
                                        <div
                                            className={css('game-search__panel')}
                                            id="game-search-results"
                                            role="listbox"
                                        >
                                            {searchingGames || lastSearchedQuery !== form.game_name.trim() ? (
                                                <div className={css('game-search__status')}>검색 중…</div>
                                            ) : gameSearchError ? (
                                                <div className={css('game-search__status game-search__status--error')}>
                                                    {gameSearchError}
                                                </div>
                                            ) : lastSearchedQuery === form.game_name.trim() && !gameResults.length ? (
                                                <div className={css('game-search__status')}>
                                                    검색 결과가 없습니다. 다른 이름을 입력하세요.
                                                </div>
                                            ) : (
                                                gameResultTransitions((styles, game) => (
                                                    <animated.button
                                                        type="button"
                                                        className={css('game-result')}
                                                        style={styles}
                                                        role="option"
                                                        aria-selected="false"
                                                        onClick={() => selectGame(game)}
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
                                                    </animated.button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Field>
                            {selectedGame && confirmedGameName === form.game_name && (
                                <div className={css('selected-game')}>
                                    <GameArtwork name={selectedGame.name} src={selectedGame.cover_url} size="lg" />
                                    <div>
                                        <span>선택한 게임</span>
                                        <strong>{selectedGame.name}</strong>
                                        {selectedGame.platforms.length > 0 && (
                                            <small>{selectedGame.platforms.slice(0, 3).join(' · ')}</small>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => setConfirmedGameName('')}>
                                        다시 선택
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={css('form-section')}>
                            <Field label="몇 명을 모을까요?" hint="방장을 포함한 전체 인원입니다.">
                                <input
                                    type="number"
                                    min="2"
                                    max="100"
                                    value={form.target_count}
                                    onChange={(event) => setForm({ ...form, target_count: Number(event.target.value) })}
                                    required
                                />
                            </Field>
                        </div>
                        {error && (
                            <InlineNotice tone="error" title="저장하지 못했어요">
                                {error}
                            </InlineNotice>
                        )}
                        <div className={css('form-actions')}>
                            <Link
                                className={css('button button--quiet')}
                                to={edit && roomId ? `/rooms/${roomId}?group=${effectiveGroupId}` : '/rooms'}
                            >
                                취소
                            </Link>
                            <Button
                                type="submit"
                                disabled={
                                    !groups.length ||
                                    !form.game_name.trim() ||
                                    form.game_name.trim() !== confirmedGameName
                                }
                                loading={submitting}
                            >
                                {edit ? '변경사항 저장' : '모집 시작하기'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AuthGate>
    );
}
