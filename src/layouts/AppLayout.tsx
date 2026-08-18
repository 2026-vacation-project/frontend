import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useEffect } from 'react'
import { useApp } from '../context/useApp'
import { Avatar, Toast } from '../components/ui'
import { Icon } from '../components/ui/Icon'

const navItems = [
    { to: '/rooms', label: '모집방 찾기', icon: 'home' as const },
    { to: '/groups', label: '그룹', icon: 'group' as const },
    { to: '/notifications', label: '알림', icon: 'bell' as const },
]

export function AppLayout() {
    const { currentUser, logout, toast, clearToast, backendError } = useApp()
    const location = useLocation()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [location.pathname])

    return (
        <div className={`app-shell ${currentUser ? 'is-authenticated' : 'is-public'}`}>
            <header className="topbar">
                <div className="topbar__inner">
                    <Link className="brand" to="/" aria-label="팀모아 홈">
                        <img src="/favicon.svg" alt="" />
                        <span>팀모아</span>
                    </Link>

                    <nav className="desktop-nav" aria-label="주요 메뉴">
                        {navItems.map((item) => (
                            <NavLink key={item.to} to={item.to}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="topbar__actions">
                        {backendError && (
                            <span className="api-indicator" title={backendError}>
                                <span />
                                서버 연결 확인
                            </span>
                        )}
                        {currentUser ? (
                            <>
                                <Link className="button button--primary topbar__recruit" to="/rooms/create">
                                    <Icon name="plus" className="button__icon" />
                                    <span>모집하기</span>
                                </Link>
                                <details className="profile-menu">
                                    <summary aria-label="프로필 메뉴">
                                        <Avatar name={currentUser.name} src={currentUser.profile_image} />
                                        <span>{currentUser.name}</span>
                                        <Icon name="chevron" />
                                    </summary>
                                    <div className="profile-menu__panel">
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
                            <Link className="button button--primary" to="/login">
                                시작하기
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {backendError && (
                <div className="connection-banner">
                    <span>{backendError}</span>
                    <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">
                        Swagger 확인
                    </a>
                </div>
            )}

            <main id="main-content">
                <Outlet />
            </main>

            {currentUser && (
                <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to}>
                            <Icon name={item.icon} />
                            <span>{item.label.replace(' 찾기', '')}</span>
                        </NavLink>
                    ))}
                    <NavLink to="/profile">
                        <Icon name="user" />
                        <span>내 정보</span>
                    </NavLink>
                </nav>
            )}

            {currentUser && location.pathname !== '/rooms/create' && (
                <Link className="mobile-recruit" to="/rooms/create">
                    <Icon name="plus" />
                    <span>모집하기</span>
                </Link>
            )}
            {toast && <Toast message={toast.message} tone={toast.tone} onClose={clearToast} />}
        </div>
    )
}

export function PageHeader({
    title,
    description,
    action,
}: {
    title: string
    description?: string
    action?: React.ReactNode
}) {
    return (
        <header className="page-header">
            <div>
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {action}
        </header>
    )
}

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { currentUser } = useApp()
    if (currentUser) return children
    return (
        <section className="auth-gate">
            <div>
                <img src="/favicon.svg" alt="" />
                <h1>로그인 후 이용할 수 있어요</h1>
                <p>그룹을 만들고 모집에 참여하려면 먼저 계정을 연결해 주세요.</p>
                <Link className="button button--primary" to="/login">
                    로그인하러 가기
                </Link>
            </div>
        </section>
    )
}
