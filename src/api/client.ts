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

type ApiErrorPayload = {
    detail?: unknown;
};

type ValidationIssue = {
    loc?: unknown;
    msg?: unknown;
    type?: unknown;
    ctx?: Record<string, unknown>;
};

const fieldLabels: Record<string, string> = {
    code: '로그인 인증 코드',
    color: '태그 색상',
    display_name: '표시 이름',
    email: '이메일',
    fcm_token: '알림 기기 정보',
    game_name: '게임 이름',
    group_id: '그룹 정보',
    host_id: '방장 정보',
    is_public: '그룹 공개 설정',
    limit: '검색 결과 수',
    name: '이름',
    preferred_games: '관심 게임',
    query: '검색어',
    room_id: '모집방 정보',
    role_id: '태그 정보',
    status: '모집 상태',
    tag_ids: '모집 태그',
    target_count: '모집 인원',
    user_id: '사용자 정보',
};

const serverMessageOverrides: Record<string, string> = {
    '검색어를 입력해 주세요.': '검색어를 입력해 주세요.',
    '사용자를 찾을 수 없습니다.': '사용자 정보를 찾을 수 없어요. 삭제되었거나 접근할 수 없는 계정일 수 있어요.',
    '유저를 찾을 수 없습니다.': '사용자 정보를 찾을 수 없어요. 삭제되었거나 접근할 수 없는 계정일 수 있어요.',
    '지원하지 않는 로그인 제공자입니다.': '지원하지 않는 로그인 방법이에요. Google 또는 Discord를 이용해 주세요.',
    '그룹 멤버만 수행할 수 있습니다.': '그룹 멤버만 할 수 있는 작업이에요. 먼저 그룹에 참여해 주세요.',
    '그룹을 찾을 수 없습니다.': '그룹을 찾을 수 없어요. 삭제되었거나 주소가 바뀌었을 수 있어요.',
    '다른 사용자를 대신해 요청할 수 없습니다.': '내 계정으로만 요청할 수 있어요. 다시 로그인한 뒤 시도해 주세요.',
    '참여하지 않은 그룹입니다.': '참여 중인 그룹이 아니어서 나갈 수 없어요.',
    '그룹 멤버에게만 태그를 붙일 수 있습니다.': '이 사용자는 그룹 멤버가 아니어서 태그를 붙일 수 없어요.',
    '그룹 멤버의 태그만 뗄 수 있습니다.': '이 사용자는 그룹 멤버가 아니어서 태그를 뗄 수 없어요.',
    '태그를 찾을 수 없습니다.': '태그를 찾을 수 없어요. 이미 삭제되었을 수 있어요.',
    '모집 인원이 이미 가득 찼습니다.': '모집 인원이 모두 찼어요. 다른 모집방을 찾아보세요.',
    '방을 찾을 수 없습니다.': '모집방을 찾을 수 없어요. 삭제되었거나 주소가 바뀌었을 수 있어요.',
    '방장만 모집방을 삭제할 수 있습니다.': '방장만 모집방을 삭제할 수 있어요.',
    '방장만 모집방을 수정할 수 있습니다.': '방장만 모집방을 수정할 수 있어요.',
    '이 그룹에 없는 태그가 포함되어 있습니다.': '현재 그룹에 없는 태그가 선택됐어요. 태그를 다시 선택해 주세요.',
    '이미 참가한 방입니다.': '이미 참가한 모집방이에요. 목록을 새로고침해 주세요.',
    '참가하지 않은 방입니다.': '참가 중인 모집방이 아니어서 나갈 수 없어요.',
    '태그 정보를 확인해 주세요.': '모집 태그 정보가 올바르지 않아요. 태그를 다시 선택해 주세요.',
    '현재 참가할 수 없는 방입니다.': '모집이 끝나 지금은 참가할 수 없어요. 다른 모집방을 찾아보세요.',
    '본인의 정보만 수정할 수 있습니다.': '내 정보만 변경할 수 있어요. 다시 로그인한 뒤 시도해 주세요.',
    '다시 로그인해 주세요.': '로그인 정보가 바뀌었어요. 다시 로그인해 주세요.',
    '유효하지 않은 토큰입니다.': '로그인이 유효하지 않아요. 다시 로그인해 주세요.',
    '토큰 인증에 실패했습니다.': '로그인을 확인하지 못했어요. 다시 로그인해 주세요.',
    '토큰이 만료되었습니다.': '로그인이 만료됐어요. 다시 로그인해 주세요.',
    'Google 유저 정보 조회 실패': 'Google 계정 정보를 가져오지 못했어요. 다시 로그인해 주세요.',
    'Discord 유저 정보 조회 실패': 'Discord 계정 정보를 가져오지 못했어요. 다시 로그인해 주세요.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function readFieldLabel(location: unknown) {
    if (!Array.isArray(location)) return '입력값';
    const field = [...location].reverse().find((part): part is string => typeof part === 'string');
    return field ? (fieldLabels[field] ?? '입력값') : '입력값';
}

function readNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readValidationMessage(issue: ValidationIssue) {
    const label = readFieldLabel(issue.loc);
    const type = typeof issue.type === 'string' ? issue.type : '';
    const context = issue.ctx ?? {};

    if (type === 'missing') return `${label} 항목을 입력해 주세요.`;

    const minimumLength = readNumber(context.min_length);
    if (type === 'string_too_short' && minimumLength !== null) {
        return `${label}: ${minimumLength}자 이상 입력해 주세요.`;
    }

    const maximumLength = readNumber(context.max_length);
    if (type === 'string_too_long' && maximumLength !== null) {
        return `${label}: ${maximumLength}자 이하로 입력해 주세요.`;
    }

    const minimum = readNumber(context.ge);
    if (type === 'greater_than_equal' && minimum !== null) {
        return `${label}: ${minimum} 이상으로 입력해 주세요.`;
    }

    const maximum = readNumber(context.le);
    if (type === 'less_than_equal' && maximum !== null) {
        return `${label}: ${maximum} 이하로 입력해 주세요.`;
    }

    if (type === 'int_parsing' || type === 'int_type') return `${label}: 숫자로 입력해 주세요.`;
    if (type === 'bool_parsing' || type === 'bool_type') return `${label} 설정을 다시 선택해 주세요.`;
    if (type === 'enum') return `${label}에서 사용할 수 있는 값을 선택해 주세요.`;

    const maximumItems = readNumber(context.max_length);
    if (type === 'too_long' && maximumItems !== null) {
        return `${label}: ${maximumItems}개 이하로 선택해 주세요.`;
    }

    const suppliedMessage = typeof issue.msg === 'string' ? issue.msg.trim() : '';
    if (/[가-힣]/.test(suppliedMessage)) return suppliedMessage;
    return `${label} 항목의 형식이나 범위를 확인해 주세요.`;
}

function readPayloadMessage(payload: unknown) {
    if (!isRecord(payload)) return null;
    const detail = (payload as ApiErrorPayload).detail;

    if (typeof detail === 'string' && detail.trim()) {
        const message = detail.trim();
        if (message.startsWith('Google OAuth 인증 실패')) {
            return 'Google 로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.';
        }
        if (message.startsWith('Discord OAuth 인증 실패')) {
            return 'Discord 로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.';
        }
        return serverMessageOverrides[message] ?? message;
    }
    if (!Array.isArray(detail)) return null;

    const messages = detail
        .filter(isRecord)
        .map((issue) => readValidationMessage(issue as ValidationIssue))
        .filter((message, index, all) => all.indexOf(message) === index);
    return messages.length ? messages.slice(0, 2).join(' ') : null;
}

function readErrorMessage(status: number, payload: unknown) {
    if (status >= 400 && status < 500) {
        const payloadMessage = readPayloadMessage(payload);
        if (payloadMessage) return payloadMessage;
    }

    const friendly: Record<number, string> = {
        400: '요청 내용이 올바르지 않아요. 값을 확인한 뒤 다시 시도해 주세요.',
        401: '로그인이 필요하거나 만료됐어요. 다시 로그인해 주세요.',
        403: '이 작업에 필요한 권한이 없어요. 로그인 계정과 접근 권한을 확인해 주세요.',
        404: '요청한 정보를 찾을 수 없어요. 삭제되었거나 주소가 바뀌었을 수 있어요.',
        409: '요청한 항목의 상태가 이미 바뀌었어요. 화면을 새로고침한 뒤 다시 시도해 주세요.',
        422: '입력값의 형식이나 범위가 올바르지 않아요. 각 항목을 확인해 주세요.',
        429: '요청이 너무 많아요. 잠시 기다린 뒤 다시 시도해 주세요.',
        500: '서버에서 요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
        502: '서버 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.',
        503: '서비스를 잠시 이용할 수 없어요. 잠시 후 다시 시도해 주세요.',
        504: '서버 응답이 늦어 요청을 마치지 못했어요. 다시 시도해 주세요.',
    };
    if (friendly[status]) return friendly[status];

    return '요청을 마치지 못했어요. 잠시 후 다시 시도해 주세요.';
}

async function readResponsePayload(response: Response) {
    if (response.status === 204) return null;
    const body = await response.text();
    if (!body) return null;
    if (!(response.headers.get('content-type') ?? '').includes('application/json')) return body;

    try {
        return JSON.parse(body) as unknown;
    } catch (error) {
        if (!response.ok) return body;
        throw new ApiError('서버 응답을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.', response.status, error);
    }
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

    const payload = await readResponsePayload(response);

    if (!response.ok) {
        if (response.status === 401 && session?.accessToken) clearAuthSession();
        throw new ApiError(readErrorMessage(response.status, payload), response.status, payload);
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
