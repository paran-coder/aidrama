# OWL1000 v1.3.6 Context Notes

- Base: v1.3.5.
- Admin participant list moved from percentage-based fixed table columns to one shared CSS Grid template.
- Inter-column spacing is uniformly `gap-x-6` (24px).
- Outer left/right spacing is uniformly `px-5` (20px).
- Column widths are content-aware: identity/status/level/day/proof/proof-period/management.
- Management actions remain horizontal.
- Narrow screens retain horizontal overflow fallback.
- No DB/auth/challenge behavior changes.
- Rolling 7-day proof periods from v1.3.2 remain unchanged.
