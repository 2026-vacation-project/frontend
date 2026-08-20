import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { css } from '../../appStyles';
import { createOAuthAuthorizationUrl } from '../../auth/oauth';
import { Button, InlineNotice } from '../../components/ui';
import { useApp } from '../../context/useApp';
import type { OAuthProvider } from '../../types/api';
import { getErrorMessage } from '../../utils/format';

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
                        <span className={css('provider-mark provider-mark--google')}>G</span>Google로 계속하기
                    </Button>
                    <Button
                        tone="secondary"
                        onClick={() => startLogin('discord')}
                        loading={loadingProvider === 'discord'}
                        disabled={loadingProvider !== null}
                    >
                        <span className={css('provider-mark provider-mark--discord')}>D</span>Discord로 계속하기
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
