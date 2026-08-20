import type { TokenResponse, UserResponse } from '../types/api';

const authSessionKey = 'teammoa-auth-session';
const legacyUserKey = 'teammoa-current-user';

export const authSessionChangedEvent = 'teammoa:auth-session-changed';

export interface AuthSession {
    accessToken: string;
    tokenType: string;
    user: UserResponse;
}

function isUser(value: unknown): value is UserResponse {
    if (!value || typeof value !== 'object') return false;
    const user = value as Partial<UserResponse>;
    return typeof user.id === 'string' && typeof user.email === 'string' && typeof user.name === 'string';
}

function notifySessionChanged() {
    window.dispatchEvent(new Event(authSessionChangedEvent));
}

export function readAuthSession(): AuthSession | null {
    try {
        const value = sessionStorage.getItem(authSessionKey);
        if (!value) return null;

        const session = JSON.parse(value) as Partial<AuthSession>;
        if (
            typeof session.accessToken !== 'string' ||
            !session.accessToken ||
            typeof session.tokenType !== 'string' ||
            !isUser(session.user)
        ) {
            sessionStorage.removeItem(authSessionKey);
            return null;
        }

        return session as AuthSession;
    } catch {
        sessionStorage.removeItem(authSessionKey);
        return null;
    }
}

export function saveAuthSession(response: TokenResponse) {
    const session: AuthSession = {
        accessToken: response.access_token,
        tokenType: response.token_type,
        user: response.user,
    };
    sessionStorage.setItem(authSessionKey, JSON.stringify(session));
    sessionStorage.removeItem(legacyUserKey);
    notifySessionChanged();
    return session;
}

export function updateAuthUser(user: UserResponse) {
    const session = readAuthSession();
    if (!session) return;
    sessionStorage.setItem(authSessionKey, JSON.stringify({ ...session, user }));
    notifySessionChanged();
}

export function clearAuthSession() {
    sessionStorage.removeItem(authSessionKey);
    sessionStorage.removeItem(legacyUserKey);
    notifySessionChanged();
}
