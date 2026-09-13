# Context Notes — v1.2.5

## Goal
Small UI hotfix for navigation active-state typography.

## Scope
- Active navigation tab must not look lighter than inactive tabs.
- Active tab text uses stronger weight (900) and normal dark ink color.
- Keep existing active sage background/border treatment.
- Apply consistently to desktop and mobile navigation.
- No DB, auth, challenge, or submission logic changes.

## Regression focus
- Current route still controls exactly one active menu item.
- Admin navigation remains unaffected except shared visual safety.
- Existing v1.2.4 admin recovery behavior remains intact.
