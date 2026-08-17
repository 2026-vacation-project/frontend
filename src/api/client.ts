const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/'

export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function readErrorMessage(payload: unknown, status: number) {
  const friendly: Record<number, string> = {
    400: '요청 내용을 다시 확인해 주세요.',
    401: '로그인이 필요해요.',
    403: '이 작업을 수행할 권한이 없어요.',
    404: '요청한 정보를 찾을 수 없어요.',
    409: '이미 처리되었거나 현재 상태와 충돌해요.',
    422: '입력한 내용을 확인해 주세요.',
    500: '서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
  }
  if (friendly[status]) return friendly[status]

  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const first = detail[0]
      if (first && typeof first === 'object' && 'msg' in first) {
        return String(first.msg)
      }
    }
  }

  return '요청을 처리하지 못했어요.'
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch (error) {
    throw new ApiError('백엔드에 연결할 수 없어요. 개발 서버가 실행 중인지 확인해 주세요.', 0, error)
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new ApiError(readErrorMessage(payload, response.status), response.status, payload)
  }

  return payload as T
}

export function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value))
  })
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ''
}
