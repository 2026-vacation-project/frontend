import { clearAuthSession, readAuthSession } from '../auth/session';

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '');

export class ApiError extends Error {
    status: number;
    details: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

function readErrorMessage(status: number) {
    const friendly: Record<number, string> = {
        400: '입력한 내용을 다시 확인해 주세요.',
        401: '로그인이 필요해요.',
        403: '이 작업을 할 수 없어요.',
        404: '찾는 정보가 없어요.',
        409: '이미 끝났거나 지금은 할 수 없는 작업이에요.',
        422: '입력한 내용을 확인해 주세요.',
        500: '잠시 문제가 생겼어요. 조금 뒤에 다시 시도해 주세요.',
        503: '서비스를 잠시 이용할 수 없어요. 조금 뒤에 다시 시도해 주세요.',
    };
    if (friendly[status]) return friendly[status];

    return '잠시 문제가 생겼어요. 다시 시도해 주세요.';
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response;
    const session = readAuthSession();
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    if (session?.accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
    }

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...init,
            headers,
        });
    } catch (error) {
        throw new ApiError('서비스에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.', 0, error);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const payload: unknown = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
        if (response.status === 401 && session?.accessToken) clearAuthSession();
        throw new ApiError(readErrorMessage(response.status), response.status, payload);
    }

    return payload as T;
}

export function query(params: Record<string, string | number | undefined>) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) search.set(key, String(value));
    });
    const encoded = search.toString();
    return encoded ? `?${encoded}` : '';
}
