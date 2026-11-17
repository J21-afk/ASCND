# ASCND O.S. workflow refinement

This update follows the owner's request to simplify the views, correct catalog values, and remove orphaned records when opportunities are deleted.

## Final behavior

- Overview: integrated Today's Briefing (business position, potential, attention, and Current Focus inside the briefing), summary metrics, three priority items, and Recent Activity. No separate Next Moves or Current Focus cards.
- Inbox: one filterable work queue for new assessments, opportunity reviews, due follow-ups, high priority, and missing next actions. Recent Activity is shown only on Overview.
- Priority and queue rows open the exact opportunity ID or, for an unconverted assessment, its assessment record.
- Business Pipeline: $10,000 monthly goal, open potential, recorded wins this month, remaining sales target, potential coverage gap, required daily pace, and current-wins projection. Removes stage boxes. Potential and recorded wins are explicitly distinct from cash received.
- Client Demo Operations remains available in Companies. The duplicate bottom company database and its redundant search/filter are removed. Company records still load for demo management, contact linking, and global search. Assessments are preserved.
- Radar panels and columns receive consistent padding, gaps, wrapping, and phone layout rules.

## Pricing

| Selection | Amount |
| --- | ---: |
| ASCND Start | $500 |
| ASCND Connect | $799 |
| ASCND Intelligence | $1,500 |
| ASCND Coordinate | $750 |
| Custom Solution | $750 |
| AI Receptionist | $2,250 |

Receptionist is independently selectable. Optional AI Analysis and AI Automation remain under Intelligence and require a scoped quote. Creation, editing, server calculations, persisted values, and pipeline totals use the same catalog. The SQL migration reprices existing selections, including legacy IDs. Recorded selections keep their original service meaning. The editor's calculated value is read-only.

## Deletion

The server calls one transactional database function. It deletes the opportunity and only unshared linked contacts/company records, including contacts belonging exclusively to the removed company. Other opportunities protect shared records. Assessments remain and their opportunity link is cleared by the existing foreign key. A failure rolls back the whole operation. New integrity constraints prevent dangling opportunity links. The function is callable only by the server's service role; it is not granted to anon/authenticated clients.

No bulk removal of pre-existing companies without opportunities is attempted: those may be independently created businesses.

## Business guidance

The browser immediately calculates guidance from current data. The authenticated server can add AI-generated recommendations using OPENAI_API_KEY and optional OPENAI_MODEL. Only aggregate pipeline figures are sent; customer/contact details and notes are excluded. Results are cached and provider failure retains clearly labeled live-data analysis. Missing configuration is displayed as AI generation not connected, not as simulated AI. No key was created or changed by this update.

## Database and release status

Two migrations are prepared under supabase/migrations:

1. ascnd_opportunity_cleanup: related-record cleanup, link integrity, and stable recorded-win timestamps.
2. ascnd_solution_pricing: SQL catalog pricing, a price enforcement trigger, and repricing existing selections.

The attempt to apply the first production migration was declined by the approval system without a supplied reason. It was not retried. Neither migration is applied, and the code is not deployed. A read-only check confirmed the cleanup function is absent and the 12 existing opportunities still total $41,750 at their old values. The prepared prices would total $36,191 for the audited selections; final totals must be verified after applying to the current data.

Apply both migrations in order only after approval, verify totals and permissions, then merge/deploy to the existing ascnd-os-dashboard service in My Workspace. Do not deploy the transactional deletion route before its migration.

## Validation

12 tests pass via npm test. Coverage includes API authorization/scoping, exact priority navigation, editor/create pricing, standalone receptionist, parent/optional AI controls, view deduplication, retained assessments/demo operations, monthly-goal math, and honest AI fallback. An embedded PostgreSQL test executes both migrations and verifies deletion, shared-record preservation, assessment retention, rollback on dependent-record failure, SQL/catalog price agreement, price enforcement, win-date preservation, and RPC permissions. These tests do not mutate live customer records.

JavaScript syntax and git whitespace checks pass. Authenticated live-browser and mobile visual verification remain outstanding.
