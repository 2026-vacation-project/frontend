# 팀모아 프론트엔드

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

## 색상

- #008bfe (팀모아 Blue)
- #03234c (팀모아 Dark Blue)

## 라우팅

화면은 `src/app/rooms/[roomId]/page.tsx`처럼 Next.js App Router와 비슷한 폴더 구조로 정리되어 있습니다. 이 프로젝트는 Vite와 React Router를 사용하므로 실제 URL 매핑과 인증 처리는 `src/App.tsx`에서 명시적으로 관리합니다. 화면 CSS는 `page.module.css`, 컴포넌트 CSS는 `styles.module.css`로 이름을 통일하고 관련 TSX와 같은 폴더에 둡니다.
