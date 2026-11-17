-- Additive migration: preserves all existing opportunities, stages and links.
-- Run once in the Supabase SQL Editor before using dated follow-ups.
begin;
alter table public.opportunities
  add column if not exists workflow jsonb not null default '{"next_action":"","follow_up_date":null,"priority":"normal"}'::jsonb;
comment on column public.opportunities.workflow is 'ASCND internal next action, local calendar follow-up date, and priority.';
notify pgrst, 'reload schema';
commit;
