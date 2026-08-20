import { animated, useReducedMotion, useTransition } from '@react-spring/web';
import { Link, NavLink, useLocation, useOutlet } from 'react-router';
import { useEffect } from 'react';
import { css } from '../appStyles';
import { useApp } from '../context/useApp';
import { Avatar, Toast } from '../components/ui';
import { Icon } from '../components/ui/Icon';

const navItems = [
    { to: '/rooms', label: '모집방 찾기', icon: 'home' as const },
    { to: '/groups', label: '그룹', icon: 'group' as const },
    { to: '/notifications', label: '알림', icon: 'bell' as const },
];

export function AppLayout() {
    const { currentUser, logout, toast, clearToast } = useApp();
    const location = useLocation();
    const outlet = useOutlet();

    useReducedMotion();

    const routeTransitions = useTransition(
        { key: location.pathname, outlet },
        {
            keys: (route) => route.key,
            from: { opacity: 0, transform: 'translateY(10px)' },
            enter: { opacity: 1, transform: 'translateY(0px)' },
            leave: { opacity: 0, transform: 'translateY(-6px)' },
            exitBeforeEnter: true,
            config: { tension: 280, friction: 30 },
        },
    );

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    return (
        <div className={css('app-shell', currentUser ? 'is-authenticated' : 'is-public')}>
            <header className={css('topbar')}>
                <div className={css('topbar__inner')}>
                    <Link className={css('brand')} to="/" aria-label="팀모아 홈">
                        <img src="/favicon.svg" alt="" />
                        <span>팀모아</span>
                    </Link>

                    <nav className={css('desktop-nav')} aria-label="주요 메뉴">
                        {navItems.map((item) => (
                            <NavLink className={({ isActive }) => css(isActive && 'active')} key={item.to} to={item.to}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className={css('topbar__actions')}>
                        {currentUser ? (
                            <>
                                <Link className={css('button button--primary topbar__recruit')} to="/rooms/create">
                                    <Icon name="plus" className={css('button__icon')} />
                                    <span>모집하기</span>
                                </Link>
                                <details className={css('profile-menu')}>
                                    <summary aria-label="프로필 메뉴">
                                        <Avatar name={currentUser.name} src={currentUser.profile_image} />
                                        <span>{currentUser.name}</span>
                                        <Icon name="chevron" />
                                    </summary>
                                    <div className={css('profile-menu__panel')}>
                                        <Link to="/profile">
                                            <Icon name="user" />내 프로필
                                        </Link>
                                        <Link to="/settings">
                                            <Icon name="settings" />
                                            설정
                                        </Link>
                                        <button onClick={logout}>로그아웃</button>
                                    </div>
                                </details>
                            </>
                        ) : (
                            <Link className={css('button button--primary')} to="/login">
                                시작하기
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className={css('main-content')} id="main-content">
                {routeTransitions((styles, route) => (
                    <animated.div className={css('route-view')} style={styles}>
                        {route.outlet}
                    </animated.div>
                ))}
            </main>

            {currentUser && (
                <nav className={css('mobile-nav')} aria-label="모바일 주요 메뉴">
                    {navItems.map((item) => (
                        <NavLink className={({ isActive }) => css(isActive && 'active')} key={item.to} to={item.to}>
                            <Icon name={item.icon} />
                            <span>{item.label.replace(' 찾기', '')}</span>
                        </NavLink>
                    ))}
                    <NavLink className={({ isActive }) => css(isActive && 'active')} to="/profile">
                        <Icon name="user" />
                        <span>내 정보</span>
                    </NavLink>
                </nav>
            )}

            {currentUser && location.pathname !== '/rooms/create' && (
                <Link className={css('mobile-recruit')} to="/rooms/create">
                    <Icon name="plus" />
                    <span>모집하기</span>
                </Link>
            )}
            {toast && <Toast message={toast.message} tone={toast.tone} onClose={clearToast} />}
        </div>
    );
}

export function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <header className={css('page-header')}>
            <div>
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {action}
        </header>
    );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { currentUser } = useApp();
    const location = useLocation();
    if (currentUser) return children;
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return (
        <section className={css('auth-gate')}>
            <div>
                <img src="/favicon.svg" alt="" />
                <h1>로그인 후 이용할 수 있어요</h1>
                <p>그룹을 만들고 모집에 참여하려면 먼저 계정을 연결해 주세요.</p>
                <Link className={css('button button--primary')} to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
                    로그인하러 가기
                </Link>
            </div>
        </section>
    );
}

export default AppLayout;
