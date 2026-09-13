# DESIGN-REFERENCE — OWL1000 v1.2.3

## 1. AI Reconstruction Brief
현재 OWL1000의 따뜻한 크림/세이지 브랜드 무드를 유지하면서, 액션 우선순위와 상태 표현을 더 명확히 한다. 캐릭터 이미지는 불투명 사각 배경을 제거해 UI 배경과 자연스럽게 결합한다.

## 2. Page & Implementation Summary
Next.js App Router + Tailwind CSS v4. 공통 스타일은 app/globals.css의 CSS 변수와 재사용 컴포넌트에 집중되어 있다.

## 3. Color / Typography / Spacing / Shape
- Background: warm cream #f4f0e8
- Surface: #fffdf8
- Primary action: deep OWL green #274330
- Secondary green: #425f4b
- Disabled: low-chroma sage background + darker sage text
- Success/Warning/Danger: low-chroma tinted surfaces
- Radius: pill buttons, 1.5~2.6rem cards
- Typography: system Korean sans + Georgia numeric accent

## 4. Breakpoints and Responsive Behavior
데스크톱 우선 점검. md 이상에서 상단 메뉴, lg에서 2열 Hero/대시보드 구조. 모바일 구조는 기존 레이아웃을 유지하되 overflow나 잘림이 생기지 않게 한다.

## 5. Structural Layout and Components
- AppShell: sticky header + desktop nav + mobile bottom nav
- OwlVisual: transparent character asset over grid-paper surface
- MilestoneBadges: earned/locked states
- StatusBadge: semantic tone system
- Primary/Secondary button: global CTA hierarchy

## 6. Motion & Interaction Signals
hover는 1px 수준의 미세 이동만 사용. reduced-motion에서는 transition/animation 최소화. disabled는 hover 이동 없음.

## 7. Representative HTML Evidence
주요 CTA는 `.primary-button`, 보조 액션은 `.secondary-button`, 상태 알림은 `.ui-success/.ui-warning/.ui-danger`로 통일한다.

## 8. Representative CSS Evidence
CSS 변수에서 semantic color token을 정의하고 개별 화면의 emerald/amber/red utility 직접 사용을 줄인다.

## 9. Representative JavaScript/Runtime Evidence
UI 변경은 서버 액션과 제출/인증 로직을 변경하지 않는다. 렌더링 분기만 유지한다.

## 10. Reconstruction Priorities and Evidence Limits
우선순위: 상태 구분 > 문장 가독성 > 캐릭터 자산 일관성 > 여백/정렬. 공개 URL 레퍼런스가 제공된 작업이 아니므로 외부 사이트 복제 분석은 수행하지 않는다.
