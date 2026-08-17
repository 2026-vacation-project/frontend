---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface Brief

## Scope and Mode

- Primary target: `src/App.tsx`
- Related routes: home, login, rooms, groups, roles, profile, notifications, settings
- Mode: Operate

## Audience, Job, and Action

한국의 게임·운동 참여자가 현재 모집을 빠르게 찾고 인원과 역할을 비교해 참가하거나 새 모집을 만든다. 그룹 관리자는 반복적인 팀 구성을 위해 멤버와 역할을 관리한다.

## Content and Constraints

- Swagger/OpenAPI가 데이터와 기능의 Source of Truth다.
- 그룹 단위 모집방만 실제 API로 조회한다.
- 전역 검색, 그룹 초대, 역할 해제, 알림 목록은 백엔드 미지원 상태를 명시한다.
- 한국어 가독성, 상단 내비게이션, 모바일 핵심 행동, 색상 외 상태 표현을 보존한다.

## Chosen Direction

활동 라인업 명부. 따뜻한 흰 종이와 짙은 잉크 같은 바탕 위에 모집을 가로 행으로 정렬하고, 참가 인원을 슬롯 레일로 보여준다. 짙은 초록은 행동과 선택에만, 주황은 마감과 주의에만 사용한다. 카드 그리드와 과도한 배지는 사용하지 않는다.

## Memorable Moment

사용자가 참가하면 해당 모집 행의 빈 슬롯이 짧게 밀려 채워지고 인원 수와 상태 문구가 동시에 갱신된다. 움직임이 끝난 뒤에도 상태는 텍스트와 슬롯 형태로 남는다.

## Unresolved

실제 OAuth Redirect와 토큰 방식, Firebase 설정, 전역 모집 조회, 그룹 초대, 알림 목록 API는 백엔드 명세에 없다.
