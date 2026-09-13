# v1.2.2 Checklist

## Completed
- [x] Dashboard shows disabled submit CTA during preparation period
- [x] Dashboard shows first submission opening date
- [x] Dashboard shows Monday 00:00–Sunday 23:59 KST window
- [x] Header always exposes `이번 주 제출`
- [x] Mobile navigation exposes submission entry point
- [x] Submit page explains preparation/unavailable state
- [x] Submit page shows KST submission window
- [x] Existing server-side submission eligibility rules unchanged
- [x] DB schema unchanged
- [x] 8,190 challenge rule sequences PASS
- [x] v1.1.2 / v1.2.0 / v1.2.1 regression structure checks PASS
- [x] v1.2.2 submission UX structure check PASS

## Deployment checks
- [ ] Push v1.2.2 to GitHub
- [ ] Vercel Production build PASS
- [ ] Preparation-period dashboard shows disabled CTA
- [ ] Header `이번 주 제출` opens `/dashboard/submit`
- [ ] Active week shows URL input
- [ ] Already-submitted week shows completed state
