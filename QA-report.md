# QA Report — v1.2.2

## Scope
- Submission discoverability during preparation period
- Header navigation submission entry point
- KST submission-window communication
- Regression protection for existing challenge rules

## Automated/static checks
- Challenge state rule parity: 8,190 sequences PASS
- v1.1.2 operations structure check PASS
- v1.2.0 milestone and creator-growth structure check PASS
- v1.2.1 hotfix structure check PASS
- v1.2.2 submission UX structure check PASS
- TS/TSX syntax/transpile check: 52 files, 0 syntax errors

## Database
No new migration is required.

## Production smoke checklist
1. Preparation period: dashboard shows disabled CTA + first opening date
2. Header: `이번 주 제출` always visible
3. Preparation period submit page: no URL input, clear schedule guidance
4. Active submission week: URL input appears
5. Submitted week: completed state appears
6. KST copy is consistent across dashboard and submit page
