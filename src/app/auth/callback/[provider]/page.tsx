import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { css } from '../../../../appStyles';
import { consumeOAuthAttempt, isOAuthProvider } from '../../../../auth/oauth';
import { InlineNotice } from '../../../../components/ui';
import { useApp } from '../../../../context/useApp';
import { getErrorMessage } from '../../../../utils/format';

type CallbackStatus = 'loading' | 'error';

function getProviderError(error: string | null) {
    if (error === 'access_denied') return '로그인을 취소했어요.';
    return '로그인을 완료하지 못했어요.';
}

export default function OAuthCallbackPage() {
    const { provider: providerParam } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useApp();
    const started = useRef(false);
    const [status, setStatus] = useState<CallbackStatus>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        async function completeLogin() {
            try {
                if (!isOAuthProvider(providerParam)) throw new Error('지원하지 않는 로그인 방법이에요.');

                const searchParams = new URLSearchParams(location.search);
                const attempt = consumeOAuthAttempt(providerParam, searchParams.get('state'));
                const providerError = searchParams.get('error');
                if (providerError) {
                    throw new Error(getProviderError(providerError));
                }

                const code = searchParams.get('code');
                if (!code) throw new Error('로그인을 완료하지 못했어요. 다시 시도해 주세요.');

                await login(providerParam, code);
                navigate(attempt.returnTo, { replace: true });
            } catch (callbackError) {
                setError(getErrorMessage(callbackError));
                setStatus('error');
            }
        }

        void completeLogin();
    }, [location.search, login, navigate, providerParam]);

    return (
        <div className={css('oauth-callback page-container')}>
            <section className={css('login-panel')} aria-live="polite" aria-busy={status === 'loading'}>
                <img src="/favicon.svg" alt="" draggable={false} />
                {status === 'loading' ? (
                    <>
                        <div className={css('oauth-callback__spinner')} aria-hidden="true" />
                        <h1>로그인 중이에요</h1>
                        <p>잠시만 기다려 주세요.</p>
                    </>
                ) : (
                    <>
                        <h1>로그인하지 못했어요</h1>
                        <InlineNotice tone="error" title="로그인 실패">
                            {error}
                        </InlineNotice>
                        <Link className={css('button button--primary')} to="/login" replace>
                            다시 로그인하기
                        </Link>
                    </>
                )}
            </section>
        </div>
    );
}
