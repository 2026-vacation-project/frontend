import type { OAuthProvider } from '../types/api';

const oauthAttemptKeyPrefix = 'teammoa-oauth-attempt:';
const oauthAttemptLifetimeMs = 10 * 60 * 1000;

interface OAuthAttempt {
    state: string;
    returnTo: string;
    startedAt: number;
}

const providerConfig: Record<
    OAuthProvider,
    { authorizationEndpoint: string; clientId: string; scopes: string[]; extraParams?: Record<string, string> }
> = {
    google: {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
        scopes: ['openid', 'email', 'profile'],
    },
    discord: {
        authorizationEndpoint: 'https://discord.com/oauth2/authorize',
        clientId: import.meta.env.VITE_DISCORD_CLIENT_ID ?? '',
        scopes: ['identify', 'email'],
    },
};

function createState() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sanitizeReturnTo(returnTo?: string | null) {
    return returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/rooms';
}

function getAttemptKey(provider: OAuthProvider) {
    return `${oauthAttemptKeyPrefix}${provider}`;
}

export function isOAuthProvider(value: string | undefined): value is OAuthProvider {
    return value === 'google' || value === 'discord';
}

export function getOAuthRedirectUri(provider: OAuthProvider) {
    const configuredBase = import.meta.env.VITE_OAUTH_REDIRECT_BASE_URL?.trim();
    const callbackBase = (configuredBase || `${window.location.origin}/auth/callback`).replace(/\/$/, '');
    return `${callbackBase}/${provider}`;
}

export function createOAuthAuthorizationUrl(provider: OAuthProvider, returnTo?: string | null) {
    const config = providerConfig[provider];
    const clientId = config.clientId.trim();
    if (!clientId) {
        const providerName = provider === 'google' ? 'Google' : 'Discord';
        throw new Error(`${providerName} OAuth 클라이언트 ID가 설정되지 않았어요.`);
    }

    const state = createState();
    const attempt: OAuthAttempt = {
        state,
        returnTo: sanitizeReturnTo(returnTo),
        startedAt: Date.now(),
    };
    sessionStorage.setItem(getAttemptKey(provider), JSON.stringify(attempt));

    const authorizationUrl = new URL(config.authorizationEndpoint);
    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', getOAuthRedirectUri(provider));
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', config.scopes.join(' '));
    authorizationUrl.searchParams.set('state', state);
    Object.entries(config.extraParams ?? {}).forEach(([key, value]) => authorizationUrl.searchParams.set(key, value));
    return authorizationUrl.toString();
}

export function consumeOAuthAttempt(provider: OAuthProvider, receivedState: string | null) {
    const key = getAttemptKey(provider);
    const stored = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);

    if (!stored || !receivedState) {
        throw new Error('로그인 요청 정보를 찾을 수 없어요. 로그인 페이지에서 다시 시도해 주세요.');
    }

    try {
        const attempt = JSON.parse(stored) as Partial<OAuthAttempt>;
        if (typeof attempt.state !== 'string' || attempt.state !== receivedState) {
            throw new Error('로그인 요청의 보안 정보가 일치하지 않아요. 다시 시도해 주세요.');
        }
        if (typeof attempt.startedAt !== 'number' || Date.now() - attempt.startedAt > oauthAttemptLifetimeMs) {
            throw new Error('로그인 요청이 만료되었어요. 다시 시도해 주세요.');
        }
        return sanitizeReturnTo(attempt.returnTo);
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('로그인 요청')) throw error;
        throw new Error('로그인 요청 정보를 확인하지 못했어요. 다시 시도해 주세요.', { cause: error });
    }
}
