# 팀모아 웹 서비스 디자인 및 구현

게임 또는 운동을 함께할 사람을 쉽고 빠르게 모집할 수 있는 **팀 모집 및 그룹 관리 플랫폼 "팀모아"**를 디자인하고 구현해줘.

팀모아의 핵심 목적은 다음과 같다.

> "같이 할 사람을 찾는 과정에서 발생하는 번거로움을 줄이고, 원하는 역할과 조건에 맞는 사람들과 빠르게 팀을 구성한다."

사용자는 원하는 게임이나 운동의 모집방을 만들거나 참가할 수 있으며, 친구나 팀원들과 그룹을 만들어 지속적으로 함께 활동할 수도 있다.

---

# 1. 기술 스택

다음을 기준으로 구현해줘.

* React
* TypeScript
* Vite
* React Router
* CSS Modules 또는 일반 CSS
* Responsive Web
* FCM(Firebase Cloud Messaging)을 이용한 웹 푸시 알림
* OAuth2 기반 로그인

  * Google
  * Discord

Backend API는 http://127.0.0.1:8000/ 에서 실행 중이며,
http://127.0.0.1:8000//docs 의 Swagger/OpenAPI 명세를 실제 API의 Source of Truth로 사용한다.

Tailwind CSS는 사용하지 않는다.

스타일링은 CSS Modules 또는 일반 CSS를 사용하고, 전역 디자인 토큰은 CSS Custom Properties로 관리한다.

예:

```css
:root {
    --color-primary: #000000;
    --color-background: #ffffff;
    --color-surface: #f7f7f7;

    --color-text-primary: #111111;
    --color-text-secondary: #666666;

    --spacing-1: 4px;
    --spacing-2: 8px;
    --spacing-3: 12px;
    --spacing-4: 16px;

    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
}
```

페이지마다 색상, 여백, radius, typography를 임의로 새로 만들지 말고 공통 Design System을 기반으로 구현한다.

컴포넌트는 재사용 가능하도록 설계하고, 동일한 UI를 페이지별로 반복 구현하지 않는다.

---

# 2. 권장 프로젝트 구조

다음과 같은 구조를 기준으로 설계해줘.

```text
src/
├── components/
│   ├── ui/
│   ├── room/
│   ├── group/
│   ├── role/
│   ├── user/
│   └── notification/
├── pages/
├── layouts/
├── hooks/
├── services/
├── styles/
│   ├── globals.css
│   ├── tokens.css
│   └── reset.css
├── types/
├── utils/
├── router/
├── App.tsx
└── main.tsx
```

공통 UI 컴포넌트는 `components/ui`에 분리한다.

도메인별 UI는 `room`, `group`, `role`, `user`, `notification` 등으로 분리한다.

API 관련 코드는 `services`에 분리한다.

---

# 3. 라우팅 구조

React Router를 사용한다고 가정한다.

다음 라우트를 기본 구조로 사용한다.

```text
/
 /login
 /rooms
 /rooms/create
 /rooms/:roomId
 /rooms/:roomId/edit

 /groups
 /groups/create
 /groups/:groupId
 /groups/:groupId/members
 /groups/:groupId/roles
 /groups/:groupId/settings

 /profile
 /profile/:userId

 /notifications
 /settings
```

중첩 라우팅이 필요한 경우 React Router의 nested route 구조를 사용한다.

---

# 4. 핵심 사용자 흐름

서비스에서 가장 중요한 사용자 흐름은 다음과 같다.

## 모집방 탐색

홈 / 모집방 탐색
→ 게임 또는 운동 선택
→ 모집방 검색 및 필터링
→ 모집방 상세
→ 참가
→ 모집 인원 충족
→ 참가자에게 알림

## 모집방 생성

모집방 만들기
→ 게임/운동 선택
→ 모집 인원 설정
→ 필요한 역할 설정
→ 방 이름 입력
→ 모집 시작

## 그룹

그룹 생성
→ 사용자 초대
→ 역할 생성
→ 사용자에게 역할 부여
→ 그룹 내부 모집방 생성
→ 팀원 참가

서비스의 UI는 이 흐름을 최대한 빠르고 직관적으로 완료할 수 있도록 설계해줘.

---

# 5. Visual Direction

전체 디자인은 **현대적인 한국 소비자용 웹 서비스** 스타일을 지향한다.

분위기:

* 친근함
* 신뢰감
* 활동적인 느낌
* 게임과 운동 모두 어울리는 중립적인 디자인
* 젊고 현대적인 분위기
* 너무 게이머스럽지 않음
* 너무 eSports 사이트스럽지 않음
* 너무 기업용 SaaS 대시보드처럼 보이지 않음

한국 사용자에게 익숙한 깔끔하고 명확한 정보 구조를 사용한다.

화려한 그래픽보다 실제 서비스 사용성을 우선한다.

---

# 6. 피해야 할 디자인

다음과 같은 전형적인 AI 생성 웹사이트 스타일은 피한다.

* 보라색/파란색 SaaS 그라데이션
* 모든 콘텐츠를 둥근 카드에 넣는 구성
* 과도한 border-radius
* 의미 없는 Glassmorphism
* 과도한 그림자
* 불필요한 Hero 일러스트
* 지나치게 큰 제목
* 의미 없는 통계 숫자
* 지나치게 많은 Badge
* 모든 요소를 Border Box로 감싸는 디자인
* 과도한 애니메이션
* 대시보드 느낌의 카드 Grid 남발

카드는 실제 콘텐츠를 그룹화해야 할 때만 사용한다.

---

# 7. Design System

페이지를 구현하기 전에 먼저 전체 Design System을 정의해줘.

## Color Token

다음 Semantic Color Token을 정의한다.

* Primary
* Primary Hover
* Primary Active
* Background
* Surface
* Surface Secondary
* Text Primary
* Text Secondary
* Text Muted
* Border
* Divider
* Success
* Warning
* Error
* Info

게임이나 역할 색상은 Primary와 분리해서 관리한다.

역할 색상은 사용자가 직접 설정할 수 있다.

예:

* 관리자
* 탱커
* 딜러
* 힐러
* 멤버

역할 색상은 작은 dot, text label, badge에 사용한다.

전체 UI 배경색으로 과도하게 사용하지 않는다.

---

# 8. Typography

한국어 가독성을 최우선으로 한다.

다음과 같은 Typography Scale을 정의한다.

* Display
* Heading 1
* Heading 2
* Heading 3
* Body Large
* Body
* Body Small
* Caption

Font Weight 역시 제한된 단계만 사용한다.

페이지별로 임의의 font-size를 만들지 않는다.

---

# 9. Spacing

4px 또는 8px 기반의 일관된 spacing system을 사용한다.

예:

```text
4
8
12
16
24
32
48
64
```

관련된 정보는 가까이 배치하고, 다른 정보 그룹 사이에는 충분한 여백을 둔다.

---

# 10. Border / Radius / Shadow

Border Radius는 제한된 값만 사용한다.

예:

* Small
* Medium
* Large

Shadow는 다음 상황에만 사용한다.

* Dropdown
* Modal
* Floating UI
* Layer 구분이 필요한 요소

일반 콘텐츠는 Border와 Spacing으로 구분한다.

---

# 11. 주요 공통 컴포넌트

다음 컴포넌트를 재사용 가능하게 구현한다.

* Button
* IconButton
* Input
* SearchInput
* Select
* Checkbox
* Switch
* Tabs
* Badge
* RoleBadge
* Avatar
* UserRow
* RoomRow
* RoomCard
* GameIcon
* MemberList
* Modal
* Dropdown
* Toast
* EmptyState
* LoadingState
* Skeleton
* Pagination
* Filter
* BottomSheet

각 컴포넌트는 다음 상태를 고려한다.

* hover
* active
* focus
* disabled
* loading

---

# 12. Navigation

Desktop에서는 상단 Navigation을 기본으로 사용한다.

예:

```text
팀모아

모집방 찾기
그룹
알림

검색

[모집하기]
[프로필]
```

`모집하기` 버튼은 다른 Navigation보다 시각적으로 강조한다.

Mobile에서는 핵심 Navigation만 남기고 나머지는 메뉴 또는 Bottom Navigation으로 구성할 수 있다.

---

# 13. 랜딩 / 홈 페이지

## 비로그인 사용자

Hero 메시지는 간결하게 구성한다.

예:

**같이 할 사람, 바로 모으세요.**

게임부터 운동까지
원하는 조건의 팀원을 빠르게 찾아보세요.

CTA:

* 모집방 둘러보기
* 시작하기

그 아래에는 실제 모집 중인 방을 일부 미리 보여준다.

지나치게 긴 마케팅 랜딩 페이지는 만들지 않는다.

---

## 로그인 사용자

로그인한 사용자의 홈은 Dashboard보다 **현재 모집 중인 방 탐색**에 집중한다.

다음 요소를 보여준다.

* 검색
* 관심 게임/운동
* 지금 모집 중
* 곧 마감되는 모집
* 내가 참여한 모집
* 내 그룹의 모집

---

# 14. OAuth2 로그인

복잡한 자체 회원가입 Form을 만들지 않는다.

다음 OAuth2 로그인을 제공한다.

## Google

`Google로 계속하기`

## Discord

`Discord로 계속하기`

로그인 화면에는 최소한의 서비스 설명만 제공한다.

OAuth2 로그인 후 Backend가 다음 정보를 저장한다고 가정한다.

* 사용자 ID
* 사용자 이름
* 프로필 이미지
* OAuth Provider
* Provider User ID

내부 사용자 ID는 Provider 구분을 위해 Prefix를 사용할 수 있다.

예:

```text
Google  → G-xxxxxxxx
Discord → D-xxxxxxxx
```

로그인 완료 후 추가 설정이 필요하면 프로필 초기 설정 화면으로 이동한다.

---

# 15. 프로필 초기 설정

OAuth 가입 후 다음 정보를 설정할 수 있다.

* 표시 이름
* 관심 게임
* 관심 운동
* 알림 설정

관심 게임/운동은 이후 모집 알림에 사용한다.

---

# 16. 모집방 탐색 페이지

이 페이지는 팀모아에서 가장 중요한 화면 중 하나다.

사용자가 빠르게 원하는 모집을 찾을 수 있어야 한다.

상단에는 검색 영역을 제공한다.

Placeholder 예:

```text
게임, 운동 또는 모집방 검색
```

필터:

* 게임
* 운동
* 모집 중
* 필요한 역할
* 현재 인원
* 모집 인원
* 내 관심 종목

정렬:

* 최신순
* 마감 임박
* 인원 적은 순

---

# 17. 모집방 목록

각 모집방에는 필요한 정보만 표시한다.

예:

```text
오버워치 2

빠대 같이 하실 분

3 / 5명

필요 역할
탱커 1 · 힐러 1

방장 프로필

5분 전

[참가하기]
```

정보 우선순위:

1. 게임/운동
2. 방 이름
3. 현재 인원 / 목표 인원
4. 필요한 역할
5. 모집 상태

긴 설명은 목록에서 보여주지 않는다.

---

# 18. 모집방 상세 페이지

사용자가 참가 여부를 판단할 수 있도록 구성한다.

상단:

* 게임/운동
* 방 이름
* 현재 인원
* 모집 상태

예:

```text
3 / 5명
모집 중
```

## 모집 조건

* 필요한 인원
* 필요한 역할
* 게임/운동
* 방장이 작성한 추가 조건

## 참가자

참가자를 Avatar와 이름으로 보여준다.

그룹 역할이 있다면 함께 표시한다.

## CTA

Desktop에서는 눈에 잘 보이는 위치에 배치한다.

Mobile에서는 하단 Sticky CTA를 사용할 수 있다.

예:

```text
[참가하기]
```

정원이 다 찼다면:

```text
[모집 완료]
```

Disabled 상태로 표시한다.

---

# 19. 모집방 생성

최대한 빠르게 생성할 수 있도록 한다.

필수 입력:

## 게임 / 운동

어떤 활동인지 선택한다.

## 방 이름

예:

```text
랭크 같이 돌리실 분
```

## 모집 인원

예:

```text
5명
```

## 필요한 역할

선택 사항.

예:

* 탱커 1명
* 딜러 2명
* 힐러 1명

그룹 내부에서 생성하는 경우 그룹 역할을 사용할 수 있다.

---

# 20. 모집방 수정

방장은 생성 후 다음 항목을 수정할 수 있다.

* 모집 단위
* 모집 인원
* 게임/운동
* 방 이름
* 필요한 역할

수정은 전체 페이지 이동보다 Modal 또는 Inline Edit도 고려한다.

삭제는 Danger Action으로 명확하게 구분한다.

---

# 21. 그룹 목록

사용자가 가입한 그룹을 보여준다.

각 그룹에는 다음 정보를 표시한다.

* 그룹 이름
* 그룹 이미지
* 멤버 수
* 현재 모집 중인 방 수
* 사용자의 역할

모든 그룹을 큰 카드 Grid로만 표현하지 말고 List UI도 고려한다.

---

# 22. 그룹 상세

Header:

* 그룹 이름
* 그룹 이미지
* 멤버 수

Tabs:

* 모집방
* 멤버
* 역할
* 설정

---

# 23. 그룹 모집방

그룹 내부에서 만들어진 모집방을 보여준다.

CTA:

```text
[그룹에서 모집하기]
```

---

# 24. 그룹 멤버 관리

각 사용자 Row:

```text
Avatar
사용자 이름
역할
```

예:

```text
김민수
관리자 · 딜러
```

관리 권한이 있다면 역할을 추가하거나 제거할 수 있다.

---

# 25. 사용자 초대

그룹 관리자는 다른 사용자를 검색하고 초대할 수 있다.

흐름:

```text
사용자 검색
→ 사용자 선택
→ 초대
```

검색 결과에는 다음을 표시한다.

* Avatar
* 사용자 이름
* 관심 게임
* 관심 운동

이미 그룹에 가입한 사용자는 명확하게 표시한다.

---

# 26. 역할 관리

그룹마다 독립적인 Role System을 제공한다.

역할 정보:

* 역할 이름
* 역할 색상

예:

* 관리자
* 탱커
* 딜러
* 힐러
* 멤버

관리자는 다음 작업을 할 수 있다.

* 역할 생성
* 역할 수정
* 역할 삭제
* 역할 색상 변경
* 사용자에게 역할 부여
* 사용자에게서 역할 제거

복잡한 권한 시스템은 만들지 않는다.

현재 역할의 목적은 다음 두 가지다.

* 그룹 내 사용자 분류
* 모집 조건 표현

---

# 27. 역할 생성 / 수정 UI

예:

```text
역할 이름

[ 딜러 ]

역할 색상

● ● ● ● ●

Preview

● 딜러

[저장]
```

역할 삭제는 Danger Zone으로 구분한다.

---

# 28. 사용자 프로필

사용자 프로필에는 다음 정보를 표시한다.

* Avatar
* 사용자 이름
* 관심 게임
* 관심 운동
* 가입한 그룹
* 그룹별 역할

SNS 프로필처럼 게시물 중심으로 만들지 않는다.

목표는 다음이다.

> 이 사용자가 어떤 활동을 하고 어떤 역할을 맡을 수 있는지 빠르게 파악하는 화면

---

# 29. FCM 알림 시스템

Firebase Cloud Messaging 기반 웹 푸시 알림을 제공한다.

Frontend는 로그인 후 발급된 FCM Token을 Backend로 전달한다고 가정한다.

사용자 데이터에는 FCM Token을 관리할 수 있어야 한다.

필요하면 여러 브라우저/기기를 고려해 Token을 배열 형태로 관리하는 구조를 염두에 둔다.

---

# 30. 알림 종류

최소 다음 알림을 고려한다.

## 관심 활동 모집

사용자의 관심 게임 또는 운동에서 새로운 모집이 시작된 경우.

예:

```text
<닉네임>님이 <게임 이름> 팀원을 구하고 있어요
```

## 모집 완료

목표 인원이 모두 채워진 경우.

예:

```text
<게임 이름> 팀에 인원이 다 찼어요!
```

## 그룹 모집

가입한 그룹에서 새로운 모집이 시작된 경우.

## 그룹 초대

새로운 그룹 초대를 받은 경우.

## 역할 변경

그룹에서 자신의 역할이 추가되거나 변경된 경우.

---

# 31. 알림 페이지

최근 알림을 시간 기준으로 분류한다.

예:

* 오늘
* 어제
* 이전

읽지 않은 알림은 명확하게 구분한다.

하지만 지나치게 강한 배경색은 사용하지 않는다.

알림 클릭 시 관련 페이지로 이동한다.

예:

* 모집방
* 그룹
* 사용자 프로필

---

# 32. 알림 설정

사용자가 다음 알림을 각각 켜고 끌 수 있도록 한다.

* 관심 게임/운동 모집
* 그룹 모집
* 모집 완료
* 그룹 초대
* 역할 변경

Web Push 권한이 없으면 현재 상태를 명확하게 보여준다.

브라우저 권한 요청은 사용자가 알림 기능을 실제로 활성화하려는 순간 요청한다.

페이지 진입 즉시 강제로 권한을 요청하지 않는다.

---

# 33. Empty State

빈 상태를 반드시 디자인한다.

## 모집방 없음

```text
아직 모집 중인 팀이 없어요.

직접 새로운 팀을 만들어보세요.

[모집 시작하기]
```

## 그룹 없음

```text
아직 가입한 그룹이 없어요.

친구들과 그룹을 만들어 빠르게 팀원을 모집해보세요.

[그룹 만들기]
```

---

# 34. Loading / Error

전체 화면 Spinner 하나만 사용하지 않는다.

콘텐츠 형태에 맞는 Skeleton Loading을 사용한다.

API 오류가 발생하면 다시 시도할 수 있도록 한다.

예:

```text
모집방을 불러오지 못했어요.

[다시 시도]
```

---

# 35. Responsive Design

Desktop / Tablet / Mobile을 모두 지원한다.

## Desktop

콘텐츠 최대 너비를 지정한다.

너무 넓은 모니터에서도 콘텐츠가 과도하게 퍼지지 않도록 한다.

검색, 필터, 콘텐츠를 효율적으로 배치한다.

## Mobile

다음을 최우선으로 한다.

* 모집방 탐색
* 모집 상태 확인
* 참가

복잡한 Filter는 Bottom Sheet로 보여줄 수 있다.

모집방 상세에서는 하단 Sticky CTA를 고려한다.

터치 영역은 충분히 크게 만든다.

---

# 36. Interaction

필요한 곳에만 미세한 Interaction을 사용한다.

예:

* Button hover
* 모집방 참가
* Role 선택
* Dropdown
* Modal
* Toast
* Tab 전환
* Filter 적용

애니메이션은 짧고 절제되게 사용한다.

사용자 작업을 방해하는 긴 애니메이션은 사용하지 않는다.

---

# 37. Accessibility

다음을 고려한다.

* Keyboard Navigation
* Focus State
* 충분한 Contrast
* Button Accessible Name
* Input Label
* 적절한 ARIA 속성
* 색상만으로 상태를 구분하지 않기

역할 색상 역시 반드시 역할 이름과 함께 표시한다.

---

# 백엔드 API 연동

팀모아의 Backend는 이미 구현되어 있다.

Backend Base URL:

```text
http://127.0.0.1:8000/
```

Swagger UI:

```text
http://127.0.0.1:8000//docs
```

프론트엔드를 구현하기 전에 반드시 Swagger UI 또는 Backend가 제공하는 OpenAPI 문서를 확인하고, 실제 API Endpoint, HTTP Method, Request Body, Query Parameter, Response Schema를 기준으로 구현해줘.

API 명세를 임의로 추측해서 만들지 않는다.

Swagger 문서에 존재하는 Endpoint를 우선적으로 사용하고, Frontend TypeScript 타입 역시 실제 OpenAPI Schema에 맞춰 정의한다.

---

## API Base URL 관리

API 주소를 컴포넌트 내부에 직접 작성하지 않는다.

환경 변수로 관리한다.

Vite 기준:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/
```

예:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

필요하다면 다음과 같이 API Client를 별도로 구성한다.

```text
src/
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── rooms.ts
│   ├── groups.ts
│   ├── roles.ts
│   ├── users.ts
│   └── notifications.ts
```

또는 프로젝트 구조에 맞춰 `services/` 아래에 배치해도 된다.

---

## Swagger/OpenAPI 우선 원칙

구현 전에 다음 순서로 Backend를 파악한다.

1. Swagger UI 확인
2. Authentication 방식 확인
3. 실제 Endpoint 목록 확인
4. Request / Response Schema 확인
5. Error Response 확인
6. Pagination 및 Filtering 방식 확인
7. Frontend TypeScript 타입 정의
8. API Client 구현
9. 실제 UI와 연결

Backend 명세와 Frontend 요구사항이 충돌한다면 임의로 API를 만들어내지 말고 Backend 명세를 우선한다.

필요한 API가 Swagger에 존재하지 않는다면 Mock Endpoint를 만들지 말고 해당 기능을 별도로 표시한다.

---

# Authentication

Google / Discord OAuth2 로그인 역시 Swagger에 정의된 실제 Backend Authentication API를 사용한다.

다음을 임의로 가정하지 않는다.

* OAuth Redirect URL
* Callback Path
* Access Token 구조
* Refresh Token 구조
* Cookie 이름
* Authorization Header 형식

Swagger 또는 Backend 구현에서 실제 인증 방식을 확인해서 적용한다.

Backend가 Cookie 기반 인증을 사용하는 경우:

```ts
credentials: "include"
```

또는 API Client에서 동일한 설정을 사용한다.

Bearer Token 기반이라면 실제 Backend 명세에 맞춰 다음 형태로 처리한다.

```text
Authorization: Bearer <token>
```

인증 정보를 LocalStorage에 저장할지, Cookie를 사용할지는 Backend 구현을 우선한다.

---

# API Client

페이지 컴포넌트에서 직접 `fetch()`를 반복하지 않는다.

공통 API Client를 만든다.

예:

```text
src/api/client.ts
```

이 Client에서 다음을 처리한다.

* Base URL
* 공통 Header
* 인증 정보
* JSON Parsing
* API Error
* HTTP Status Code
* 필요하다면 Token Refresh

각 도메인의 API는 별도의 모듈로 분리한다.

예:

```text
src/api/auth.ts
src/api/rooms.ts
src/api/groups.ts
src/api/roles.ts
src/api/users.ts
src/api/notifications.ts
```

---

# 실제 API 기반 TypeScript 타입

Swagger/OpenAPI에서 제공되는 Schema를 기준으로 TypeScript 타입을 정의한다.

예:

```text
User
Room
Group
Role
Notification
```

필드명을 UI 요구사항에 맞춰 임의로 바꾸지 않는다.

예를 들어 Backend Response가:

```json
{
    "room_id": 1,
    "room_name": "랭크 같이 하실 분"
}
```

이라면 실제 API Layer에서는 해당 구조를 존중한다.

UI에서 다른 이름이 필요한 경우 별도의 Mapper를 사용한다.

---

# 모집방 API

모집방 탐색, 상세, 생성, 수정, 삭제, 참가 기능은 Swagger에 정의된 실제 모집방 Endpoint를 사용한다.

다음 기능에 대응되는 API를 Swagger에서 찾아 연결한다.

* 모집방 목록
* 모집방 검색
* 모집방 필터
* 모집방 상세
* 모집방 생성
* 모집방 수정
* 모집방 삭제
* 모집방 참가
* 모집방 나가기

Endpoint 이름이나 URL을 임의로 생성하지 않는다.

---

# 그룹 API

다음 그룹 기능 역시 실제 Backend API를 사용한다.

* 그룹 목록
* 그룹 상세
* 그룹 생성
* 그룹 수정
* 그룹 삭제
* 그룹 초대
* 그룹 가입
* 그룹 탈퇴
* 그룹 사용자 목록

---

# 역할 API

Swagger에 정의된 실제 역할 API를 사용한다.

필요 기능:

* 역할 목록
* 역할 생성
* 역할 수정
* 역할 삭제
* 역할 색상 변경
* 사용자 역할 추가
* 사용자 역할 제거

역할 생성/수정 UI는 Backend Schema에 존재하는 필드만 전송한다.

---

# 사용자 API

다음 정보를 실제 사용자 Endpoint를 통해 가져온다.

* 사용자 ID
* 사용자 이름
* Profile Image
* 관심 게임/운동
* 그룹
* 역할
* 기타 Backend가 제공하는 Profile 정보

OAuth Provider 관련 필드 역시 실제 Response에 존재하는 경우에만 사용한다.

---

# FCM 알림

FCM Token을 저장하는 API가 Backend Swagger에 있다면 반드시 해당 Endpoint를 사용한다.

프론트엔드에서 FCM Token을 발급받은 뒤 Backend에 등록한다.

예상 흐름:

```text
로그인
→ Notification Permission 확인
→ FCM Token 발급
→ Backend에 Token 등록
```

단, 실제 Endpoint 및 Request Body는 Swagger 명세를 따른다.

Token 갱신이 발생하면 Backend에 다시 등록할 수 있도록 구현한다.

---

# Error Handling

Backend API의 실제 HTTP Status Code를 처리한다.

예:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

FastAPI 기반 Backend라면 `422 Validation Error` 응답 구조가 존재할 수 있으므로 Swagger에 정의된 실제 Response를 확인한다.

Error Message를 그대로 사용자에게 노출하기보다는 사용자 친화적인 메시지로 변환한다.

예:

```text
401
→ 로그인이 필요해요.

403
→ 이 작업을 수행할 권한이 없어요.

404
→ 해당 모집방을 찾을 수 없어요.
```

---

# 개발 환경

현재 Backend가 다음 주소에서 실행되고 있다고 가정한다.

```text
http://127.0.0.1:8000/
```

Frontend 개발 서버가 다른 Port에서 실행되므로 Cross-Origin 요청을 고려한다.

예:

```text
http://localhost:5173
```

Backend CORS 설정과 인증 Cookie 정책을 확인한다.

HTTPS 개발 인증서가 Self-Signed Certificate인 경우 브라우저에서 Backend 주소를 직접 열어 인증서를 신뢰해야 할 수 있다.

개발 편의를 위해 필요하다면 Vite Proxy를 사용할 수 있다.

예:

```ts
server: {
    proxy: {
        "/api": {
            target: "http://127.0.0.1:8000/",
            changeOrigin: true,
            secure: false
        }
    }
}
```

단, 실제 Backend Endpoint Prefix를 Swagger에서 확인한 뒤 설정한다.

---

# 중요한 구현 원칙

Backend API는 이미 존재한다.

따라서 Frontend 구현 시:

**UI를 먼저 만들고 가상의 API를 끼워 맞추지 않는다.**

먼저 Swagger/OpenAPI를 확인하고 실제 데이터 구조를 이해한 다음 그 구조를 바탕으로 UI와 API Layer를 구현한다.

최종적으로 다음 흐름을 따른다.

**Swagger 분석 → TypeScript 타입 정의 → API Client 작성 → 화면 구현 → 실제 API 연결 → Error/Loading 처리 → UI Polish**

---

# 39. TypeScript 규칙

`any` 사용을 최소화한다.

주요 데이터 모델에 TypeScript 타입을 정의한다.

예:

```text
User
Room
Group
Role
Notification
Game
Activity
```

컴포넌트 Props에도 명확한 타입을 지정한다.

---

# 40. 구현 우선순위

바로 페이지 코드를 작성하지 말고 다음 순서대로 진행한다.

## Step 1 — Visual Direction

팀모아에 적합한 전체 Visual Direction을 제안한다.

## Step 2 — Design Tokens

다음을 정의한다.

* Color
* Typography
* Spacing
* Radius
* Border
* Shadow

그리고 CSS Custom Properties로 구현한다.

## Step 3 — Core Components

공통 UI 컴포넌트를 구현한다.

## Step 4 — App Shell

Navigation, Layout, Responsive Structure를 구현한다.

## Step 5 — 핵심 페이지

다음 순서로 구현한다.

1. 홈 / 모집방 탐색
2. 모집방 상세
3. 모집방 생성
4. 그룹 목록
5. 그룹 상세
6. 그룹 멤버 관리
7. 역할 관리
8. 사용자 프로필
9. 알림
10. OAuth2 로그인
11. 설정

## Step 6 — Responsive

Desktop UI를 단순히 축소하지 않는다.

Mobile UX에 맞게 필요한 요소를 재배치한다.

## Step 7 — Polish

전체 UI를 다시 검토한다.

다음 문제를 찾아 수정한다.

* 시각적 계층이 약한 부분
* 불필요한 카드
* 과도한 Border
* 불필요한 Badge
* 잘못된 Spacing
* Typography 불일치
* 모바일에서 불편한 Interaction
* 접근성 문제
* 중복 컴포넌트
* 반복되는 CSS
* AI가 생성한 것처럼 보이는 전형적인 디자인 패턴

---

# 최종 목표

팀모아는 일반적인 SaaS Dashboard처럼 보여서는 안 된다.

사용자가 사이트에 들어왔을 때 가장 먼저 느껴야 하는 것은 다음이다.

> **"지금 같이 할 사람을 바로 찾을 수 있겠다."**

디자인과 UX의 우선순위는 다음과 같다.

**빠른 탐색 → 모집 상태 파악 → 역할 확인 → 참가 → 그룹 내 지속적인 팀 구성**

React + TypeScript + Vite + React Router 기반으로 구현하고 Tailwind CSS는 사용하지 않는다.

CSS Custom Properties와 재사용 가능한 공통 컴포넌트를 중심으로 Design System을 구축한다.

먼저 코드를 작성하지 말고 **Visual Direction과 Design System을 구체적으로 제안한 뒤**, 그 방향을 기준으로 전체 UI를 동일한 디자인 언어로 구현해줘.
