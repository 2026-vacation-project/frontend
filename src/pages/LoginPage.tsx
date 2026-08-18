import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Field, InlineNotice } from '../components/ui'
import { useApp } from '../context/useApp'
import type { OAuthProvider } from '../types/api'
import { getErrorMessage } from '../utils/format'

export function LoginPage() {
    const navigate = useNavigate()
    const { currentUser, login } = useApp()
    const [provider, setProvider] = useState<OAuthProvider | null>(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function submit(event: React.FormEvent) {
        event.preventDefault()
        if (!provider) return
        setLoading(true)
        setError(null)
        try {
            await login(provider, { name: name.trim(), email: email.trim() })
            navigate('/rooms')
        } catch (loginError) {
            setError(getErrorMessage(loginError))
        } finally {
            setLoading(false)
        }
    }

    if (currentUser)
        return (
            <div className="login-page page-container">
                <div className="login-panel">
                    <img src="/favicon.svg" alt="" />
                    <h1>이미 로그인되어 있어요</h1>
                    <p>{currentUser.name} 계정으로 팀모아를 이용 중입니다.</p>
                    <Link className="button button--primary" to="/rooms">
                        모집방으로 이동
                    </Link>
                </div>
            </div>
        )

    return (
        <div className="login-page page-container">
            <div className="login-intro">
                <Link className="brand" to="/">
                    <img src="/favicon.svg" alt="" />
                    <span>팀모아</span>
                </Link>
                <h1>
                    함께할 사람을
                    <br />
                    찾는 가장 짧은 방법
                </h1>
                <p>계정을 연결하고 그룹의 모집방과 역할을 한곳에서 관리하세요.</p>
                <div className="login-lineup" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
            </div>
            <section className="login-panel" aria-labelledby="login-title">
                <h2 id="login-title">계정 연결</h2>
                <p>복잡한 회원가입 없이 Google 또는 Discord 계정 정보로 시작합니다.</p>
                {!provider ? (
                    <div className="provider-list">
                        <Button tone="secondary" onClick={() => setProvider('google')}>
                            <span className="provider-mark provider-mark--google">G</span>Google로 계속하기
                        </Button>
                        <Button tone="secondary" onClick={() => setProvider('discord')}>
                            <span className="provider-mark provider-mark--discord">D</span>Discord로 계속하기
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <div className="selected-provider">
                            <span className={`provider-mark provider-mark--${provider}`}>
                                {provider === 'google' ? 'G' : 'D'}
                            </span>
                            <strong>{provider === 'google' ? 'Google' : 'Discord'} 개발 연동</strong>
                            <button type="button" onClick={() => setProvider(null)}>
                                변경
                            </button>
                        </div>
                        <Field label="표시 이름">
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                autoComplete="name"
                                required
                                placeholder="이름"
                            />
                        </Field>
                        <Field label="이메일">
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                required
                                placeholder="name@example.com"
                            />
                        </Field>
                        {error && (
                            <InlineNotice tone="error" title="로그인하지 못했어요">
                                {error}
                            </InlineNotice>
                        )}
                        <Button
                            className="login-submit"
                            type="submit"
                            loading={loading}
                            disabled={!name.trim() || !email.trim()}
                        >
                            계속하기
                        </Button>
                    </form>
                )}
                <InlineNotice tone="warning" title="현재 백엔드 인증 방식">
                    Swagger에는 실제 OAuth Redirect나 토큰이 없고 제공자명과 사용자 정보를 받는 로그인 API만 있습니다.
                    이 화면은 그 명세를 정확히 따릅니다.
                </InlineNotice>
            </section>
        </div>
    )
}
