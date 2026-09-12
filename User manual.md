# AI Drama Challenge v1.1.0 — User Manual

## Participant
1. Open the service and choose signup.
2. Enter the one-time invitation code issued by the administrator, display name, email and password.
3. Sign in and complete onboarding.
4. Start the 1000-day challenge.
5. From the first Monday after starting, submit one qualifying work link each week by the weekly deadline.
6. Use Dashboard to see current progress, streak and owl growth.
7. Use History to review weekly outcomes and accepted links.
8. Use Community to view other participants' public challenge progress.
9. At 1000 days, use the completion/archive screen.

## Weekly rules
- The service judges weeks Monday through Sunday in Asia/Seoul time.
- The first judged week starts on the next Monday after challenge start.
- A valid http/https link may be submitted; known-platform verification is attempted, and an unverified link can still be recorded under the existing product rule.
- Missed closed weeks are processed as failures according to the challenge rules.

## Administrator
- `/admin` remains the operational entry point.
- Issue invitation codes and copy them for participants.
- v1.1.0 additionally supports operational inspection/correction workflows for weekly outcomes and submission history.
- Corrections must include a reason and are written to the audit log.
- Corrections rebuild the participant's current challenge summary so dashboard/community values stay consistent with official weekly history.

## Data and privacy
- Authentication credentials are managed by Supabase Auth.
- The app stores challenge metadata and submitted URLs; it does not upload or store the user's video file itself.
- Routine page-view/click analytics are not stored in the operational database in v1.1.0.
