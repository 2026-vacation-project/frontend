import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { css } from '../../appStyles';
import { createOAuthAuthorizationUrl } from '../../auth/oauth';
import { Button, InlineNotice } from '../../components/ui';
import { useApp } from '../../context/useApp';
import type { OAuthProvider } from '../../types/api';
import { getErrorMessage } from '../../utils/format';

function ProviderLogo({ provider }: { provider: OAuthProvider }) {
    if (provider === 'google') {
        return (
            <svg className={css('provider-logo')} viewBox="0 0 18 18" aria-hidden="true">
                <path
                    fill="#4285f4"
                    d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
                />
                <path
                    fill="#34a853"
                    d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
                />
                <path
                    fill="#fbbc05"
                    d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33Z"
                />
                <path
                    fill="#ea4335"
                    d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .96 4.96l3 2.33A5.38 5.38 0 0 1 9 3.58Z"
                />
            </svg>
        );
    }

    return (
        <svg className={css('provider-logo')} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#5865f2"
                d="M6.25 5.22A13.9 13.9 0 0 1 9.8 4.08l.43.88a11.15 11.15 0 0 1 3.54 0l.43-.88a13.9 13.9 0 0 1 3.55 1.14c2.24 3.28 2.86 6.5 2.55 9.67a14.42 14.42 0 0 1-4.38 2.22l-1.06-1.44c.58-.21 1.13-.48 1.65-.8a10.63 10.63 0 0 1-9.02 0c.52.32 1.07.59 1.65.8l-1.06 1.44a14.42 14.42 0 0 1-4.38-2.22c-.33-3.65.6-6.8 2.55-9.67Z"
            />
            <circle cx="9.15" cy="11.37" r="1.28" fill="#fff" />
            <circle cx="14.85" cy="11.37" r="1.28" fill="#fff" />
        </svg>
    );
}

export default function LoginPage() {
    const { currentUser } = useApp();
    const [searchParams] = useSearchParams();
    const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
    const [error, setError] = useState<string | null>(null);

    function startLogin(provider: OAuthProvider) {
        setLoadingProvider(provider);
        setError(null);
        try {
            const authorizationUrl = createOAuthAuthorizationUrl(provider, searchParams.get('returnTo'));
            window.location.assign(authorizationUrl);
        } catch (loginError) {
            setError(getErrorMessage(loginError));
            setLoadingProvider(null);
        }
    }

    if (currentUser)
        return (
            <div className={css('login-page page-container')}>
                <div className={css('login-panel')}>
                    <img src="/favicon.svg" alt="" />
                    <h1>이미 로그인되어 있어요</h1>
                    <p>{currentUser.name} 계정으로 팀모아를 이용 중입니다.</p>
                    <Link className={css('button button--primary')} to="/rooms">
                        모집방으로 이동
                    </Link>
                </div>
            </div>
        );

    return (
        <div className={css('login-page page-container')}>
            <div className={css('login-intro')}>
                <Link className={css('brand')} to="/">
                    <img src="/favicon.svg" alt="" />
                    <span>팀모아</span>
                </Link>
                <h1>
                    함께할 사람을
                    <br />
                    찾는 가장 짧은 방법
                </h1>
                <p>계정을 연결하고 그룹의 모집방과 역할을 한곳에서 관리하세요.</p>
                <div className={css('login-lineup')} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
            </div>
            <section className={css('login-panel')} aria-labelledby="login-title">
                <h2 id="login-title">계정 연결</h2>
                <p>복잡한 회원가입 없이 Google 또는 Discord 계정으로 시작합니다.</p>
                <div className={css('provider-list')}>
                    <Button
                        tone="secondary"
                        onClick={() => startLogin('google')}
                        loading={loadingProvider === 'google'}
                        disabled={loadingProvider !== null}
                    >
                        <ProviderLogo provider="google" />
                        Google로 계속하기
                    </Button>
                    <Button
                        tone="secondary"
                        onClick={() => startLogin('discord')}
                        loading={loadingProvider === 'discord'}
                        disabled={loadingProvider !== null}
                    >
                        <ProviderLogo provider="discord" />
                        Discord로 계속하기
                    </Button>
                </div>
                {error && (
                    <InlineNotice tone="error" title="로그인을 시작하지 못했어요">
                        {error}
                    </InlineNotice>
                )}
                <InlineNotice title="안전한 계정 연결">
                    비밀번호는 팀모아에 전달되지 않으며, 계정 제공자가 승인한 기본 프로필과 이메일만 사용합니다.
                </InlineNotice>
            </section>
        </div>
    );
}
