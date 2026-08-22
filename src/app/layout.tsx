import { animated, useReducedMotion, useTransition } from '@react-spring/web';
import { Link, NavLink, useLocation, useOutlet } from 'react-router';
import { useEffect, useRef, useState } from 'react';
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
    const { currentUser, groups, activeGroupId, loadingGroups, logout, toast, clearToast } = useApp();
    const location = useLocation();
    const outlet = useOutlet();
    const prefersReducedMotion = useReducedMotion();
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const joinedGroups = groups.filter((group) =>
        (group.members ?? []).some((member) => member.id === currentUser?.id),
    );
    const selectedJoinedGroup = joinedGroups.find((group) => group.id === activeGroupId) ?? joinedGroups[0];
    const hasNoGroups = !loadingGroups && groups.length === 0;
    const needsGroup = !loadingGroups && joinedGroups.length === 0;
    const recruitPath = hasNoGroups
        ? '/groups/create?next=room'
        : needsGroup
          ? '/groups?next=room'
          : selectedJoinedGroup
            ? `/rooms/create?group=${selectedJoinedGroup.id}`
            : '/rooms/create';
    const recruitLabel = hasNoGroups ? '그룹 만들기' : needsGroup ? '그룹 찾기' : '모집하기';

    const routeTransitions = useTransition([{ key: location.key, outlet }], {
        keys: (route) => route.key,
        initial: { opacity: 1, transform: 'translateY(0px)' },
        from: { opacity: 0, transform: 'translateY(6px)' },
        enter: { opacity: 1, transform: 'translateY(0px)' },
        leave: { opacity: 0, transform: 'translateY(-3px)' },
        exitBeforeEnter: true,
        immediate: prefersReducedMotion ?? false,
        config: { duration: 120 },
    });

    const profileMenuTransitions = useTransition(profileMenuOpen, {
        from: { opacity: 0, transform: 'translateY(-4px)' },
        enter: { opacity: 1, transform: 'translateY(0px)' },
        leave: { opacity: 0, transform: 'translateY(-4px)' },
        config: { tension: 340, friction: 26 },
    });
    const toastTransitions = useTransition(toast ? [toast] : [], {
        keys: (item) => item.id,
        from: { opacity: 0, transform: 'translateY(8px)' },
        enter: { opacity: 1, transform: 'translateY(0px)' },
        leave: { opacity: 0, transform: 'translateY(8px)' },
        config: { tension: 320, friction: 26 },
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    useEffect(() => {
        if (!profileMenuOpen) return;

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!profileMenuRef.current?.contains(event.target as Node)) setProfileMenuOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setProfileMenuOpen(false);
        };

        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [profileMenuOpen]);

    return (
        <div className={css('app-shell', currentUser ? 'is-authenticated' : 'is-public')}>
            <header className={css('topbar')}>
                <div className={css('topbar__inner')}>
                    <Link className={css('brand')} to="/" aria-label="팀모아 홈">
                        <img src="/favicon.svg" alt="" draggable={false} />
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
                                <Link className={css('button button--primary topbar__recruit')} to={recruitPath}>
                                    <Icon name="plus" className={css('button__icon')} />
                                    <span>{recruitLabel}</span>
                                </Link>
                                <div className={css('profile-menu')} ref={profileMenuRef}>
                                    <button
                                        className={css('profile-menu__trigger', profileMenuOpen && 'is-open')}
                                        type="button"
                                        aria-label="프로필 메뉴"
                                        aria-expanded={profileMenuOpen}
                                        aria-controls="profile-menu-panel"
                                        onClick={() => setProfileMenuOpen((open) => !open)}
                                    >
                                        <Avatar name={currentUser.name} src={currentUser.profile_image} />
                                        <span>{currentUser.name}</span>
                                        <Icon name="chevron" />
                                    </button>
                                    {profileMenuTransitions((styles, open) =>
                                        open ? (
                                            <animated.div
                                                className={css('profile-menu__panel')}
                                                id="profile-menu-panel"
                                                style={styles}
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <Link to="/profile">
                                                    <Icon name="user" />내 정보
                                                </Link>
                                                <Link to="/settings">
                                                    <Icon name="settings" />
                                                    설정
                                                </Link>
                                                <button onClick={() => void logout()}>이 기기에서 로그아웃</button>
                                            </animated.div>
                                        ) : null,
                                    )}
                                </div>
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

            {currentUser &&
                location.pathname !== '/rooms/create' &&
                !location.pathname.startsWith('/profile') &&
                !(needsGroup && location.pathname.startsWith('/groups')) && (
                    <Link className={css('mobile-recruit')} to={recruitPath}>
                        <Icon name="plus" />
                        <span>{recruitLabel}</span>
                    </Link>
                )}
            {toastTransitions((styles, item) => (
                <Toast
                    message={item.message}
                    tone={item.tone}
                    animation={styles}
                    onClose={() => {
                        if (toast?.id === item.id) clearToast();
                    }}
                />
            ))}
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
                <img src="/favicon.svg" alt="" draggable={false} />
                <h1>로그인이 필요합니다</h1>
                <p>그룹을 만들거나 모집에 참가하려면 로그인해 주세요.</p>
                <Link className={css('button button--primary')} to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
                    로그인
                </Link>
            </div>
        </section>
    );
}

export default AppLayout;
