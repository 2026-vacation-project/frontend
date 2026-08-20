import { Link } from 'react-router';
import { css } from '../appStyles';
import { RoomRow } from '../components/room/RoomRow';
import { Button } from '../components/ui';
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
        id: 9101,
        group_id: 0,
        host_id: exampleHost.id,
        game_name: '오버워치 2',
        target_count: 5,
        target_role: '힐러',
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
        id: 9102,
        group_id: 0,
        host_id: exampleHost.id,
        game_name: '발로란트',
        target_count: 5,
        target_role: '감시자',
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
        id: 9103,
        group_id: 0,
        host_id: exampleHost.id,
        game_name: '리그 오브 레전드',
        target_count: 5,
        target_role: '정글',
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
                    <p>플레이할 게임과 필요한 포지션, 남은 자리를 확인하고 마음 맞는 파티에 바로 참여해 보세요.</p>
                    <div className={css('hero-actions')}>
                        <Link className={css('button button--primary button--large')} to="/login">
                            팀모아 시작하기 <Icon name="arrow" />
                        </Link>
                        <a className={css('button button--secondary button--large')} href="#preview">
                            모집방 둘러보기
                        </a>
                    </div>
                </div>
                <div className={css('home-hero__board')} aria-label="팀 모집 과정 예시">
                    <div className={css('board-title')}>
                        <span>오늘의 라인업</span>
                        <strong>함께할 자리</strong>
                    </div>
                    <div className={css('board-line')}>
                        <span>오버워치 2</span>
                        <div>
                            {Array.from({ length: 5 }, (_, i) => (
                                <i key={i} className={css(i < 3 && 'filled')} />
                            ))}
                        </div>
                        <b>3/5</b>
                    </div>
                    <div className={css('board-line')}>
                        <span>발로란트</span>
                        <div>
                            {Array.from({ length: 5 }, (_, i) => (
                                <i key={i} className={css(i < 4 && 'filled', i < 4 && 'accent')} />
                            ))}
                        </div>
                        <b>4/5</b>
                    </div>
                    <div className={css('board-callout')}>
                        <Icon name="plus" />
                        <span>
                            <strong>빈자리를 고르면</strong> 바로 팀에 합류해요
                        </span>
                    </div>
                </div>
            </section>

            <section className={css('preview-section page-container')} id="preview">
                <header className={css('section-heading')}>
                    <div>
                        <h2>지금 이런 팀을 찾고 있어요</h2>
                        <p>팀모아에서 모집을 찾는 모습을 미리 둘러보세요.</p>
                    </div>
                    <Link className={css('text-link')} to="/login">
                        로그인하고 시작하기 <Icon name="arrow" />
                    </Link>
                </header>
                <div className={css('room-list room-list--preview')}>
                    {exampleRooms.map((room) => (
                        <RoomRow key={room.id} room={room} hostName={room.participants?.[0]?.name} example />
                    ))}
                </div>
            </section>

            <section className={css('how-it-works page-container')} aria-labelledby="how-title">
                <h2 id="how-title">모집부터 다음 약속까지 한곳에서</h2>
                <div className={css('process-list')}>
                    <div>
                        <Icon name="search" />
                        <strong>파티 조건을 빠르게 비교</strong>
                        <p>게임, 현재 인원, 필요한 포지션을 한 줄에서 확인해요.</p>
                    </div>
                    <div>
                        <Icon name="check" />
                        <strong>한 번에 참가</strong>
                        <p>마음에 드는 모집을 찾으면 남은 자리를 바로 채워요.</p>
                    </div>
                    <div>
                        <Icon name="group" />
                        <strong>그룹으로 다시 모이기</strong>
                        <p>친구와 역할을 저장하고 다음 팀도 빠르게 만들어요.</p>
                    </div>
                </div>
                <div className={css('home-close')}>
                    <div>
                        <h2>
                            이번에는 기다리지 말고
                            <br />
                            먼저 팀을 열어보세요.
                        </h2>
                        <p>간단한 계정 연결 후 바로 그룹과 모집방을 만들 수 있어요.</p>
                    </div>
                    <Button
                        onClick={() => {
                            window.location.href = '/login';
                        }}
                        icon="arrow"
                    >
                        시작하기
                    </Button>
                </div>
            </section>
        </div>
    );
}
