# ASCND O.S. workflow update

The Express server serves `ascnd-os-deploy/public`. That is the active application updated here. The older `ASCND OPERATING SYSTEM` and deploy-root frontend copies also receive the Connect rename and the AI Receptionist selection, but are not the application served by this server.

## Changes

- Open an opportunity to edit its business/contact snapshot, services, estimated value, notes, stage, priority, next action, and follow-up date.
- Delete an opportunity with a named confirmation. Company and contact records are retained. A foreign-key conflict prevents deletion and shows a clear message rather than silently removing a linked record.
- Filter active, due, high-priority, missing-next-action, all, or individual stages. Due dates use the viewer's local calendar date; today and overdue dates count as due. Won/lost/closed opportunities are excluded.
- Overview shows due follow-ups, a short current-focus briefing, live metrics, review items, and recent activity. Duplicate snapshots, example company/contact rows, and the outdated discovery explanation are removed.
- Business Pipeline displays actual saved opportunity values by stage, with buttons that open the corresponding opportunity filter. It makes no claim about collected revenue or payment tracking.
- Companies and Contacts link through to associated opportunities; the opportunity editor changes its own snapshot and does not silently change shared company/contact records.
- New opportunities refresh immediately and open their record. Assessment conversion opens the correct creation form, pre-fills available details, links the returned opportunity ID, and avoids using a stale assessment when creating an ordinary opportunity.
- All ASCND Grow product labels become ASCND Connect. The old `grow` identifier remains a read-compatible alias; existing records need no destructive renaming. Ordinary prose about business growth is unchanged.
- AI Receptionist is available in the new-opportunity selection. Pricing is Custom because no price was specified. Custom selections display “+ custom quote,” not a promise of a free service. Existing fixed service prices are retained.
- Shared glass styling applies to login, navigation, cards, forms, modals, tables, company demo tracking, and workflow controls. Section entrances, staggered metrics, hover motion, and button feedback respect reduced-motion settings. Unsupported blur falls back to opaque surfaces.

## One-time database setup

Before using dated follow-ups, run `migrations/001-opportunity-workflow.sql` in the project's Supabase SQL Editor. It adds one JSONB `workflow` column and preserves existing records. No credentials are included or changed. If the column is missing, basic edits with no new follow-up fields can still save; trying to save follow-up information shows a setup message.

This update has not run SQL against the live database and does not merge or deploy itself. Apply the additive migration, merge the reviewed branch into `ascnd-os-deploy`, and deploy that branch using the existing Render configuration. The service root remains `ascnd-os-deploy` and the start command remains `npm start`.

## Validation

From `ascnd-os-deploy`:

```sh
npm ci
npm test
```

Eight automated tests pass. They cover validation, authorization, record scoping, preservation of company/contact links, deletion conflicts, missing records, migration errors, legacy naming, and dashboard interactions using jsdom. Dashboard checks include search/filtering, due dates, edit/save failures, closing outcomes, canceled/failed/successful deletion, and creating an opportunity with Connect plus AI Receptionist.

JavaScript syntax checks and `git diff --check` pass. A Chromium launch was blocked by the execution environment, so no rendered-browser or mobile visual verification is claimed. Live Supabase integration also remains unverified without its connection configuration.

After deployment, verify desktop and phone layouts, login, each navigation category, reduced-motion behavior, a disposable opportunity's full create/edit/follow-up/close/delete cycle, and assessment conversion. Check the database's stage definition accepts CONTACTED, DISCOVERY, FOLLOW-UP, PROPOSAL, WON, and LOST; no existing enum or stage constraints are rewritten by the migration.
