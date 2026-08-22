---
name: "팀모아"
description: "게임 파티 모집을 라인업 명부처럼 읽고 바로 참여하는 게임 전용 시스템"
colors:
  brand-blue: "#008bfe"
  brand-dark-blue: "#03234c"
  primary: "#008bfe"
  primary-hover: "#2ca0ff"
  primary-active: "#1596ff"
  primary-text: "#006fc9"
  on-primary: "#03234c"
  primary-soft: "#e5f3ff"
  background: "#f5f9ff"
  surface: "#ffffff"
  surface-secondary: "#eaf4ff"
  surface-strong: "#03234c"
  text-primary: "#03234c"
  text-secondary: "#354e6d"
  text-muted: "#5f748d"
  border: "#b9d5ec"
  divider: "#d8e8f5"
  success: "#006fc9"
  warning: "#8a4b08"
  warning-soft: "#fff3dc"
  error: "#b42318"
  error-soft: "#fdecea"
  info: "#075f9a"
  info-soft: "#e5f3ff"
  signal: "#008bfe"
  role-blue: "#008bfe"
  signal-soft: "#dff1ff"
  focus: "#008bfe"
typography:
  display:
    fontFamily: "Pretendard, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 760
    lineHeight: 1.22
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Pretendard, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "2rem"
    fontWeight: 760
    lineHeight: 1.22
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Pretendard, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 720
    lineHeight: 1.22
    letterSpacing: "-0.025em"
  body-large:
    fontFamily: "Pretendard, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Pretendard, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Pretendard, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 720
    lineHeight: 1.55
  caption:
    fontFamily: "Pretendard, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.55
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "0.875rem"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.5rem"
  6: "2rem"
  7: "3rem"
  8: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.62rem 1rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.62rem 1rem"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-text}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.62rem 1rem"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.62rem 1rem"
    height: "44px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 1rem"
    height: "3rem"
  filter-tab-active:
    backgroundColor: "transparent"
    textColor: "{colors.primary-text}"
    typography: "{typography.label}"
    padding: "0 1rem"
    height: "46px"
  recruitment-row:
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    padding: "1.1rem 0"
    height: "7.4rem"
  group-selector-row:
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    padding: "0.5rem 0"
    height: "4.75rem"
  notice-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 1rem"
---

# Design System: 팀모아

## Overview

**Creative North Star: "게임 파티 라인업 명부"**

팀모아는 게임 파티 모집을 라인업 명부처럼 한 줄씩 읽고 바로 행동하는 운영 화면이다. 옅은 블루 화이트 바탕, 팀모아 Dark Blue 글자, 가는 구분선이 정보의 골격을 만들고, 모집 행과 참가 슬롯이 게임·현재 인원·다음 행동을 같은 시야에 둔다.

표현은 친근하지만 장식적이지 않고, 활기차지만 게임 전용처럼 보이지 않는다. 팀모아 Blue는 선택과 참가 행동, 태그와 슬롯에 집중시키고 팀모아 Dark Blue는 텍스트와 강한 면의 중심을 잡는다. 카드형 통계 대시보드, 여러 색을 섞은 SaaS 그라데이션, 의미 없는 글래스와 장식용 배지는 이 세계의 반대편이다.

**Key Characteristics:**

- 옅은 블루 화이트 바탕과 팀모아 Dark Blue 잉크가 만드는 명부 같은 인상
- 카드 그리드 대신 가는 선으로 구획한 곧은 모집 행과 그룹 행
- 한 가족의 Pretendard 가변 글꼴로 만드는 단정한 한국어 위계
- 팀모아 Blue 행동·선택과 팀모아 Dark Blue 텍스트·강조 면의 제한된 색 문법
- 그룹 선택 → 게임 검색 → 인원 비교 → 참가 또는 모집 개설로 이어지는 짧은 흐름

## Colors

팔레트는 README의 팀모아 Blue와 팀모아 Dark Blue를 원색으로 삼고, 배경·선·상호작용 색은 두 브랜드 색에서 파생한다. 오류와 경고만 의미 보존을 위해 절제된 상태색으로 분리한다.

### Primary

- **팀모아 Blue** (`brand-blue`, `primary`): 참가, 모집 개설, 태그, 선택 상태, 활성 내비게이션에 쓰는 주 행동색이다.
- **Sky Lift / Pressed Sky** (`primary-hover`, `primary-active`): 기본 블루의 상호작용 깊이를 만들며 새로운 색 역할을 만들지 않는다.
- **Readable Blue** (`primary-text`): 밝은 면 위 링크·탭·아이콘에서 가독성을 확보하는 짙은 파생 블루다.
- **Blue Wash** (`primary-soft`): 선택된 그룹, 참여 상태, 채워진 슬롯의 낮은 강도 배경이다.

### Secondary

- **팀모아 Dark Blue** (`brand-dark-blue`): 기본 텍스트와 라인업 보드, 강한 요약 면에 쓰는 중심색이다.
- **Tag Blue** (`role-blue`, `signal`): 모집 행과 상세 화면의 태그 표시, 즉시 비교해야 하는 신호에 쓰는 브랜드 블루다.
- **Signal Wash** (`signal-soft`): 블루 신호가 넓은 면에 필요할 때 쓰는 배경색이다.

### Tertiary

- **Open Slot Blue** (`success`): 모집 중, 참여 성공처럼 긍정 상태를 텍스트와 상태점으로 표시한다.
- **Deadline Amber / Amber Wash** (`warning`, `warning-soft`): API 제한, 권한 전 상태, 주의가 필요한 사실을 보여준다.
- **Correction Red / Correction Wash** (`error`, `error-soft`): 연결 실패, 삭제, 오류 메시지에만 쓴다.
- **Roster Blue / Roster Blue Wash** (`info`, `info-soft`): 중립적인 API 범위와 설명 공지에 쓴다.

### Neutral

- **Blue Roster Paper** (`background`): 모든 페이지의 기본 바탕이다.
- **Clean Sheet / Blue Wash** (`surface`, `surface-secondary`): 입력·패널과 낮은 강도의 요약 영역을 구분한다.
- **Dark Blue Board** (`surface-strong`): 게임 이니셜과 공개 홈의 라인업 보드처럼 집중이 필요한 어두운 면이다.
- **Dark Blue Ink / Soft Ink / Pencil Note** (`text-primary`, `text-secondary`, `text-muted`): 제목, 설명, 보조 메타데이터의 세 단계 읽기 위계다.
- **Blue Registration Line / Hairline Rule** (`border`, `divider`): 입력 경계와 행 구분을 만들며 카드 외곽선을 반복하지 않는다.

### Named Rules

**The Two Brand Color Rule.** 팀모아 Blue는 행동·선택·태그에, 팀모아 Dark Blue는 텍스트·강조 면에 쓴다. 오류와 경고 외의 새로운 강조색은 추가하지 않는다.

## Typography

**Display Font:** Pretendard variable (system sans-serif fallback)
**Body Font:** Pretendard variable (system sans-serif fallback)

**Character:** 한글의 획과 숫자가 선명하게 맞물리는 단일 산세리프 체계다. 굵기와 크기로만 위계를 만들고, 낯선 장식 서체나 모노스페이스를 끼워 넣지 않는다.

### Hierarchy

- **Display** (760, 3.5rem, 1.22): 공개 홈의 핵심 약속에만 사용하며 모바일에서는 2.625rem로 줄인다.
- **Headline** (760, 2rem, 1.22): 페이지 제목과 큰 행동 문구에 사용하며 모바일에서는 1.75rem로 줄인다.
- **Title** (720, 1.5rem, 1.22): 섹션 제목과 중요한 패널 제목에 사용하며 모바일에서는 1.375rem로 줄인다.
- **Body Large** (400, 1.0625rem, 1.55): 소개 문장과 한 단계 강조된 설명에 사용한다.
- **Body** (400, 0.9375rem, 1.55): 기본 인터페이스 문장과 목록 내용을 담당한다.
- **Label** (720, 0.8125rem, 1.55): 필드 이름, 상태, 버튼처럼 짧고 행동적인 텍스트에 사용한다.
- **Caption** (650, 0.75rem, 1.55): 시간, API 범위, 보조 메타데이터에 사용한다.

### Named Rules

**The One Family Rule.** 모든 화면은 Pretendard 한 가족 안에서 크기와 가변 굵기로 위계를 만든다.

## Layout

콘텐츠는 최대 1180px 폭의 중앙 컨테이너에 놓이고 데스크톱에서는 좌우 1rem, 모바일에서는 0.625rem의 안전 여백을 남긴다. 인증 첫 화면은 모집 목록과 그룹 현황을 약 2:1로 나누며, 검색과 필터를 목록 바로 위에 두고 페이지 상단과 전역 상단바 양쪽에서 모집 행동을 노출한다.

모집, 그룹, 멤버, 조건은 카드 묶음이 아니라 세로 명부와 가는 수평선으로 정렬한다. 데스크톱 모집 행은 게임, 현재 인원, 상태·행동의 세 열이며 최소 높이는 7.4rem이다. 간격은 0.25rem에서 4rem까지의 4px 기반 8단계 리듬을 사용하고, 넓은 섹션 사이에는 주로 2–4rem을 쓴다.

980px 이하에서는 모집 목록과 그룹 레일이 한 열로 바뀌고 그룹 레일은 아래쪽 두 열이 된다. 760px 이하에서는 상단 내비게이션을 하단 4개 탭으로 바꾸고 모집 CTA를 플로팅 버튼으로 유지한다. 모집 행은 게임 정보를 전폭 첫 줄에 두고 인원과 행동을 둘째 줄 양끝에 배치하며, 폼·상세 사이드 패널·태그 편집기는 한 열로 쌓는다. 430px 이하에서는 페이지 제목과 주요 버튼을 세로로 쌓고 비핵심 메타데이터를 더 줄인다.

## Elevation & Depth

기본 화면에는 그림자가 없다. 종이색 바탕, 흰 입력 면, 옅은 톤 면, 가는 구분선으로 깊이를 만든다. 그림자는 모달·토스트·프로필 메뉴·모바일 모집 CTA 같은 실제 부유 요소와 공개 홈의 기울어진 라인업 보드에만 허용된다. 상단바와 모바일 내비게이션은 반투명 면과 14px 블러를 사용하지만 콘텐츠 카드에 글래스를 적용하지 않는다.

### Shadow Vocabulary

- **Floating** (`0 0.625rem 1.5rem rgba(3, 35, 76, 0.14)`): 메뉴, 토스트, 모바일 모집 CTA처럼 화면 위에 떠 있는 조작에 사용한다.
- **Overlay** (`0 1rem 3rem rgba(3, 35, 76, 0.20)`): 모달처럼 배경 계층에서 명확히 분리되어야 하는 오버레이에 사용한다.
- **Showcase Board** (`0 1.25rem 3.5rem rgba(3, 35, 76, 0.22)`): 공개 홈의 라인업 보드에만 사용하는 예외적 연출이다.

### Named Rules

**The Flat Roster Rule.** 행과 일반 콘텐츠는 그림자 없이 선과 간격으로 구분하고, 그림자는 실제로 떠 있는 계층에만 쓴다.

## Shapes

기본 모서리는 작고 단정하다. 입력과 버튼은 0.375rem, 보조 패널은 0.625rem, 모달과 공개 홈의 큰 장면은 0.875rem을 사용한다. 모집 행과 표 형태 목록은 모서리를 만들지 않고 곧은 수평선으로 이어진다.

원형은 아바타, 상태점, 아이콘 버튼처럼 의미가 분명한 작은 요소에 한정한다. 완전한 알약형은 작은 수량·예시·권한 상태와 모바일의 단일 플로팅 모집 행동에만 허용한다. 참가 슬롯은 거의 직각인 1px 모서리의 짧은 레일이며, 상세 라인업 슬롯은 작은 입력 반경과 점선 빈자리를 사용한다.

## Components

### Buttons

- **Shape:** 단정하게 살짝 굽은 직사각형(0.375rem)이며 주요 터치 높이는 최소 44px이다.
- **Primary:** 팀모아 Blue 면 위 팀모아 Dark Blue 글자, 0.62rem × 1rem 내부 여백, 굵기 720이다.
- **Hover / Focus:** hover에서 1px 위로 이동하고 밝은 블루로 바뀐다. focus-visible은 3px 외곽선과 3px 간격을 사용하며 reduced-motion 환경에서는 전환을 사실상 제거한다.
- **Secondary:** 흰 면과 Blue Registration Line 경계로 시작해 hover에서 Blue Wash 면과 팀모아 Blue 글자로 바뀐다.
- **Quiet / Danger:** quiet는 투명 배경의 보조 행동, danger는 흰 면과 붉은 글자·경계의 파괴 행동이다.

### Chips

- **Style:** 필터는 알약 배지 대신 46px 높이의 텍스트 탭과 2px 하단선으로 표현한다. 작은 수량·예시·권한 표지만 예외적으로 알약형을 쓴다.
- **State:** 선택된 필터는 팀모아 Blue 글자와 하단선으로, 모집 상태는 색점과 한국어 상태 문구를 함께 사용해 색에만 의존하지 않는다.

### Cards / Containers

- **Corner Style:** 일반 정보는 카드화하지 않는다. 실제로 경계가 필요한 폼, 로그인, 설정, 참가 패널만 0.625–0.875rem 모서리를 사용한다.
- **Background:** 페이지는 Blue Roster Paper, 입력·폼 패널은 Clean Sheet, 요약은 Blue Wash를 사용한다.
- **Shadow Strategy:** 일반 컨테이너에는 그림자가 없고 Elevation 규칙의 부유 계층만 예외다.
- **Border:** 1px Blue Registration Line 또는 Hairline Rule을 사용한다.
- **Internal Padding:** 소형 공지는 0.85rem × 1rem, 일반 패널은 1.5rem, 큰 폼 패널은 2rem이다.

### Inputs / Fields

- **Style:** 흰 배경, 1px Blue Registration Line, 0.375rem 모서리, 최소 44px 높이를 사용한다. 검색 입력은 3rem 높이의 아이콘 결합형이다.
- **Focus:** 경계를 팀모아 Blue로 바꾸고 같은 블루의 16% 투명도 3px 링을 더한다.
- **Error / Disabled:** 오류는 Correction Red 텍스트와 공지로 설명하고, 비활성 조작은 커서와 버튼 투명도 52%로 상태를 남긴다.

### Navigation

데스크톱 상단바는 4.5rem 높이의 고정형 명부 머리글이며 활성 항목을 2px 팀모아 Blue 하단선으로 표시한다. 모바일에서는 760px 이하부터 4개 하단 탭으로 전환하고 아이콘과 텍스트를 함께 유지한다. 프로필 메뉴만 흰 부유 패널과 Floating 그림자를 쓴다.

### Recruitment Row

모집 행은 시스템의 서명 컴포넌트다. 게임 이니셜, 게임명과 제목, 방장·그룹·시간, 현재/목표 인원, 슬롯 레일, 상태 문구, 행동을 한 행 안에 배치한다. 행 자체는 배경 카드가 아니며 Hairline Rule 아래선으로 다음 항목과 연결된다. hover는 중앙에만 매우 옅은 블루 그라데이션을 주고 구조는 움직이지 않는다.

참가 직후 채워진 슬롯은 220ms 동안 왼쪽에서 6px 이동하며 나타나고, 숫자와 한국어 상태도 함께 갱신된다. 모집 중 상태점은 1.8초 펄스를 사용하되 텍스트를 항상 병기하며, `prefers-reduced-motion`에서는 모든 전환과 애니메이션을 0.01ms로 축소한다.

### API Truth States

실제 API 범위를 벗어난 전역 모집 검색, 그룹 초대·수정, 태그 해제, 알림 목록은 데이터나 활성 조작으로 꾸미지 않는다. 화면은 그룹을 먼저 선택하게 하고 범위 설명 공지, 비활성 버튼, 로딩 명부, 다음 행동이 있는 빈 상태, 재시도 가능한 오류 상태로 현재 백엔드 진실을 그대로 드러낸다. 공개 홈의 모집은 반드시 `화면 예시`로 표시한다.

## Do's and Don'ts

### Do:

- **Do** 모집을 게임·현재 인원·상태·행동이 한눈에 비교되는 곧은 행으로 보여준다.
- **Do** 참가 인원을 숫자와 슬롯 레일 두 방식으로 함께 표현한다.
- **Do** 검색과 필터를 모집 목록 바로 위에 두고, 그룹 선택을 실제 데이터 조회의 선행 조건으로 명확히 보인다.
- **Do** 팀모아 Blue 행동·태그, 팀모아 Dark Blue 텍스트·강조 면, 텍스트가 병기된 상태 신호의 역할을 지킨다.
- **Do** Swagger에 없는 기능은 설명 공지, 빈 상태, 또는 비활성 조작으로 정직하게 표시한다.
- **Do** 모든 주요 조작에 최소 44px 터치 영역과 분명한 키보드 포커스를 유지한다.

### Don't:

- **Don't** 모집 목록을 둥근 카드 그리드나 통계 타일 대시보드로 바꾼다.
- **Don't** 여러 색을 섞은 SaaS 그라데이션, 장식용 글래스, 과도한 배지·그림자·모션을 추가한다.
- **Don't** 팀모아 Blue를 넓은 장식 면에 남발하거나 브랜드 체계 밖의 색을 일반 내비게이션 강조색으로 사용한다.
- **Don't** 색만으로 모집 상태, 오류, 태그, 선택 여부를 전달한다.
- **Don't** 지원되지 않는 전역 모집·초대·알림 데이터를 실제처럼 만들거나 공개 홈 예시를 실데이터처럼 보이게 한다.
- **Don't** 760px 이하에서 하단 내비게이션과 모집 CTA가 본문 행동을 가리게 한다.
