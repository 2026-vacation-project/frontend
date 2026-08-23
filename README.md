# 팀모아 프론트엔드

## 기술 스택 - Frontend

| 분류       | 기술                               |
| ---------- | ---------------------------------- |
| 언어       | TypeScript 6                       |
| UI         | React 19, React DOM                |
| 빌드       | Vite 8, React Compiler             |
| 라우팅     | React Router 8                     |
| 애니메이션 | React Spring 10                    |
| 스타일     | CSS Modules, CSS Custom Properties |
| 코드 품질  | ESLint 10, Prettier 3              |

## 로컬 실행

```bash
cp .env.example .env
npm install
npm run dev
```

개발 서버는 백엔드 OAuth 기본 콜백 주소와 맞추기 위해 `http://localhost:3000`에서 실행됩니다. `/api` 요청은 `http://127.0.0.1:8000`으로 프록시됩니다.

## OAuth 설정

1. Google Cloud Console과 Discord Developer Portal에 아래 Redirect URI를 등록합니다.
    - `http://localhost:3000/auth/callback/google`
    - `http://localhost:3000/auth/callback/discord`
2. 프론트엔드 `.env`의 `VITE_GOOGLE_CLIENT_ID`, `VITE_DISCORD_CLIENT_ID`를 설정합니다.
3. `../backend/.env.example`을 참고해 백엔드 `.env`에 같은 Client ID와 각 Client Secret을 설정합니다.
4. 프론트엔드 `VITE_OAUTH_REDIRECT_BASE_URL`과 백엔드의 제공자별 `*_REDIRECT_URI`가 정확히 같은 주소를 가리키는지 확인합니다.

Client Secret은 프론트엔드 환경 변수에 넣지 않습니다. 운영 환경에서는 `VITE_API_BASE_URL`을 실제 API 주소로 설정하거나 `/api`를 백엔드로 전달하는 리버스 프록시를 구성해야 합니다.

## 웹 푸시 알림 설정

1. Firebase Console에서 웹 앱을 등록합니다.
2. Cloud Messaging의 Web Push 인증서에서 VAPID 키를 생성합니다.
3. `.env.example`에 적힌 `VITE_FIREBASE_*` 값을 프론트엔드 `.env`에 설정합니다.
4. `../backend/README.md`의 Firebase Admin 설정을 완료합니다.

알림을 켜면 브라우저의 Firebase Installation ID가 백엔드에 저장됩니다. 앱을 보고 있을 때는
팀모아 토스트로, 다른 탭을 보거나 브라우저가 백그라운드에 있을 때는 시스템 알림으로
표시됩니다. 웹 푸시는 `localhost`를 제외한 운영 환경에서 HTTPS가 필요합니다.

## 모집방 실시간 갱신

로그인 세션 동안 `/api/v1/ws/rooms` WebSocket을 유지합니다. 모집방 목록이나 상세 화면은 현재
그룹을 구독하고, 방 또는 참가자 변경 이벤트가 오면 표시 중인 데이터만 다시 요청합니다. 연결이
끊기면 최대 30초 간격의 지수 백오프로 소켓을 재연결하며 polling은 사용하지 않습니다. 로컬 Vite
프록시와 운영 Nginx 모두 WebSocket Upgrade를 전달해야 합니다.

## 색상

- #008bfe (팀모아 Blue)
- #03234c (팀모아 Dark Blue)

## 라우팅

화면은 `src/app/rooms/[roomId]/page.tsx`처럼 Next.js App Router와 비슷한 폴더 구조로 정리되어 있습니다. 이 프로젝트는 Vite와 React Router를 사용하므로 실제 URL 매핑과 인증 처리는 `src/App.tsx`에서 명시적으로 관리합니다. 화면 CSS는 `page.module.css`, 컴포넌트 CSS는 `styles.module.css`로 이름을 통일하고 관련 TSX와 같은 폴더에 둡니다.
