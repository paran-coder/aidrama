# QA Report — v1.2.3

## Scope
- UI semantic color system
- Disabled/active CTA hierarchy
- Korean line wrapping and copy breaks
- Transparent owl assets
- Desktop-first layout polish
- Regression protection for v1.2.x functionality

## Automated/static checks
- Challenge state rule parity: 8,190 sequences PASS
- v1.1.2 operations structure check PASS
- v1.2.0 milestone/growth structure check PASS
- v1.2.1 hotfix structure check PASS
- v1.2.2 submission UX structure check PASS
- v1.2.3 UI system structure check PASS
- TS/TSX syntax transpile: 52 files PASS, 0 syntax diagnostics

## Owl asset checks
- Hero/Stage/Thumb 11 files present
- All 11 WebP files retain alpha channel (0~255)
- Opaque PNG owl assets excluded from package
- Owl asset directory total: approximately 1.1MB

## Dependency build status
`npm install --prefer-offline` was attempted in the current execution environment but timed out before dependencies were installed. Therefore full `tsc --noEmit` and `next build` could not be completed locally. Vercel remains the final dependency-aware build check.

## Database
No new migration is required for v1.2.3.

## Production smoke checklist
1. Landing hero owl: no square image background
2. Dashboard owl: no double image background / no large empty lower area
3. Preparation period CTA: pale sage disabled state
4. Active CTA: deep OWL green
5. Header `이번 주 제출`: quiet sage navigation emphasis
6. First-submit copy breaks after `가능합니다.`
7. Community thumbnails: transparent assets read cleanly on card grid background
8. Mypage milestone badges: locked/earned states distinguishable
9. Admin state chips: active/suspended/invite states use semantic palette
10. Login/signup/error messages: semantic palette retained
