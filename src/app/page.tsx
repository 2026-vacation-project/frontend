import { Link } from 'react-router';
import { css } from '../appStyles';
import { GameArtwork } from '../components/game/GameArtwork';
import { RoomRow } from '../components/room/RoomRow';
import { Icon } from '../components/ui/Icon';
import { useApp } from '../context/useApp';
import type { RoomResponse } from '../types/api';
import RoomsPage from './rooms/page';

const exampleHost = {
    id: 'preview-host',
    email: 'preview@example.com',
    name: '민수',
    profile_image: null,
    fcm_token: null,
    preferred_games: ['오버워치 2'],
};
const exampleRooms: RoomResponse[] = [
    {
        id: '9101',
        group_id: '0',
        host_id: exampleHost.id,
        game_name: '오버워치 2',
        target_count: 5,
        unit_type: '명',
        status: 'RECRUITING',
        created_at: new Date(Date.now() - 6 * 60_000).toISOString(),
        participants: [
            exampleHost,
            { ...exampleHost, id: 'preview-2', name: '서연' },
            { ...exampleHost, id: 'preview-3', name: '준호' },
        ],
    },
    {
        id: '9102',
        group_id: '0',
        host_id: exampleHost.id,
        game_name: '발로란트',
        target_count: 5,
        unit_type: '명',
        status: 'RECRUITING',
        created_at: new Date(Date.now() - 18 * 60_000).toISOString(),
        participants: [
            exampleHost,
            { ...exampleHost, id: 'preview-4', name: '지훈' },
            { ...exampleHost, id: 'preview-5', name: '은채' },
            { ...exampleHost, id: 'preview-6', name: '현우' },
        ],
    },
    {
        id: '9103',
        group_id: '0',
        host_id: exampleHost.id,
        game_name: '리그 오브 레전드',
        target_count: 5,
        unit_type: '명',
        status: 'COMPLETED',
        created_at: new Date(Date.now() - 42 * 60_000).toISOString(),
        participants: Array.from({ length: 5 }, (_, index) => ({
            ...exampleHost,
            id: `preview-lol-${index}`,
            name: ['유진', '재민', '하늘', '지우', '태민'][index],
        })),
    },
];
const exampleGameLogos: Record<string, string> = {
    '오버워치 2': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Overwatch_2_logo.svg',
    발로란트: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg',
    '리그 오브 레전드': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/League_of_Legends_2019_vector.svg',
};

export default function HomePage() {
    const { currentUser } = useApp();
    if (currentUser) return <RoomsPage home />;

    return (
        <div className={css('public-home')}>
            <section className={css('home-hero page-container')}>
                <div className={css('home-hero__copy')}>
                    <h1>
                        같이 할 사람,
                        <br />
                        바로 모으세요.
                    </h1>
                    <p>함께할 그룹을 만들고, 그 안에서 게임과 인원을 정해 모집하세요.</p>
                    <div className={css('hero-actions')}>
                        <Link className={css('button button--primary button--large')} to="/login">
                            로그인 <Icon name="arrow" />
                        </Link>
                        <a className={css('button button--secondary button--large')} href="#preview">
                            모집방 보기
                        </a>
                    </div>
                </div>
                <div className={css('home-hero__board')} aria-label="팀 모집 현황">
                    <div className={css('board-title')}>
                        <strong>모집 현황</strong>
                        <span>남은 자리</span>
                    </div>
                    <div className={css('board-line')}>
                        <span className={css('board-game')}>
                            <GameArtwork
                                name="오버워치 2"
                                src={exampleGameLogos['오버워치 2']}
                                size="sm"
                                fit="contain"
                            />
                            오버워치 2
                        </span>
                        <div>
                            {Array.from({ length: 5 }, (_, i) => (
                                <i key={i} className={css(i < 3 && 'filled')} />
                            ))}
                        </div>
                        <b>3/5</b>
                    </div>
                    <div className={css('board-line')}>
                        <span className={css('board-game')}>
                            <GameArtwork name="발로란트" src={exampleGameLogos.발로란트} size="sm" fit="contain" />
                            발로란트
                        </span>
                        <div>
                            {Array.from({ length: 5 }, (_, i) => (
                                <i key={i} className={css(i < 4 && 'filled', i < 4 && 'accent')} />
                            ))}
                        </div>
                        <b>4/5</b>
                    </div>
                </div>
            </section>

            <section className={css('preview-section page-container')} id="preview">
                <header className={css('section-heading')}>
                    <div>
                        <h2>모집방 둘러보기</h2>
                    </div>
                    <Link className={css('text-link')} to="/login">
                        로그인 <Icon name="arrow" />
                    </Link>
                </header>
                <div className={css('room-list room-list--preview')}>
                    {exampleRooms.map((room) => (
                        <RoomRow
                            key={room.id}
                            room={room}
                            hostName={room.participants?.[0]?.name}
                            gameCoverUrl={exampleGameLogos[room.game_name]}
                            gameArtworkFit="contain"
                            example
                        />
                    ))}
                </div>
            </section>

            <section className={css('how-it-works page-container')} aria-labelledby="how-title">
                <h2 id="how-title">팀모아에서 할 수 있는 일</h2>
                <div className={css('process-list')}>
                    <div>
                        <Icon name="group" />
                        <strong>그룹 만들기</strong>
                        <p>같이 게임할 사람들과 그룹을 만듭니다.</p>
                    </div>
                    <div>
                        <Icon name="plus" />
                        <strong>그룹에서 모집하기</strong>
                        <p>그룹 안에서 게임과 필요한 인원을 정합니다.</p>
                    </div>
                    <div>
                        <Icon name="check" />
                        <strong>함께 참가하기</strong>
                        <p>멤버와 모집 현황을 확인하고 게임을 시작합니다.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
