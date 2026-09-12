# Context Notes — AI Drama Challenge v1.0.0

## Product
초대형 AI드라마 크리에이터 커뮤니티를 위한 1000일·매주 1회 업로드 챌린지 서비스.

## Deployment target
- Source control: GitHub
- Hosting: Vercel
- Database/Auth: Supabase
- Runtime: Node.js 22+
- Framework: Next.js 16.3.4 App Router
- Styling: Tailwind CSS 4

## Confirmed product rules
- 가입은 관리자 발급 초대 코드가 반드시 필요하다.
- 초대 코드는 1코드-1인, 1회 사용 후 만료된다.
- 가입 후 온보딩에서 챌린지를 시작한다.
- 경과일은 시작 즉시 0일차가 되며, 주간 판정은 가입 주를 제외한 다음 월요일부터 시작한다.
- 주차는 월요일~일요일, 마감은 일요일 23:59 (Asia/Seoul 기준)이다.
- 성공 시 스트릭 +1, 연속 실패는 0으로 초기화한다.
- 1회 연속 실패: 성장단계 1단계 하락.
- 2회 연속 실패: 대시보드 경고 노출.
- 3회 연속 실패: 성장단계를 알로 리셋하되 1000일 경과는 유지한다.
- 페널티로 하락/리셋된 성장단계는 다음 성공 시 정상 성장단계로 즉시 회복한다.
- 링크 검증 실패는 제출 자체를 막지 않고 `미검증`으로 인정한다.
- 관리자 권한은 1인 운영을 기본 전제로 한다.

## Technical decisions
- Supabase SSR 세션을 사용한다.
- 초대 코드 가입은 서버 전용 service-role로 Auth 사용자 생성 + DB 초대 코드 claim을 처리한다.
- 누락된 실패 주차는 사용자의 앱 접근 시 서버에서 소급 처리한다. 별도 크론 없이도 상태 일관성을 유지한다.
- 성장 단계는 경과일 기반 기본 단계 + 페널티 override 방식으로 계산한다.
- 커뮤니티는 로그인 사용자에게 공개하며 기본 정렬은 최장 스트릭순이다.
- 관리자 접근은 `ADMIN_EMAIL` 환경변수 또는 profile.role=admin으로 판별한다.

## Recommended owl visual direction
실서비스 v1.0.0에 포함하되 컴포넌트 단위로 분리한다. 초기에는 코드 기반 SVG/shape 비주얼로 제공하고, 향후 동일 인터페이스에 PNG/WebP/영상 자산을 교체할 수 있도록 한다.
