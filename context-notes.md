# OWL1000 v1.3.3 Context Notes

## Implemented scope
- Admin participant overview table layout is compacted so the right-side action column no longer appears clipped on common desktop widths.
- Related metrics are grouped instead of forcing nine wide columns into the fixed admin content area.
- Participant identity remains two lines: chat nickname first, email second.
- Proof period and deadline are grouped into one column while preserving the same underlying rolling 7-day data.
- Current/longest proof streak and success/failure counts are grouped into one compact status column.
- Submission history and access management remain separate actions.

## Non-goals
- No database changes.
- No authentication, submission, rolling-week, streak, badge, or account-management logic changes.
- No change to participant data or historical submissions.

## UI rules
- Admin shell can use a wider desktop content width than participant pages.
- Participant table keeps a minimum width for smaller desktops and can horizontally scroll only when genuinely necessary.
- Dates and action buttons do not wrap mid-label.
- Last action cell has explicit right padding so controls do not visually collide with the rounded card edge.
