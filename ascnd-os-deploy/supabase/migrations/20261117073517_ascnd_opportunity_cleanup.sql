-- Integrity and atomic cleanup. Existing assessments survive opportunity deletion.
alter table public.opportunities add constraint opportunities_company_link_fkey
  foreign key (company_id) references public.companies(id) on delete restrict;
alter table public.opportunities add constraint opportunities_contact_link_fkey
  foreign key (contact_id) references public.contacts(id) on delete restrict;

create or replace function public.ascnd_delete_opportunity(p_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  target public.opportunities%rowtype;
  candidate record;
  deleted_contacts uuid[] := '{}';
  deleted_company uuid;
begin
  select * into target from public.opportunities where id = p_id for update;
  if not found then return jsonb_build_object('success',false); end if;
  if target.company_id is not null then
    perform id from public.companies where id=target.company_id for update;
  end if;
  delete from public.opportunities where id=target.id;
  for candidate in
    select c.id from public.contacts c
    where c.id=target.contact_id
       or (c.company_id=target.company_id and not exists(select 1 from public.opportunities o where o.company_id=target.company_id))
    order by c.id for update
  loop
    if not exists(select 1 from public.opportunities o where o.contact_id=candidate.id) then
      delete from public.contacts where id=candidate.id;
      deleted_contacts := array_append(deleted_contacts,candidate.id);
    end if;
  end loop;
  if target.company_id is not null
     and not exists(select 1 from public.opportunities o where o.company_id=target.company_id)
     and not exists(select 1 from public.contacts c where c.company_id=target.company_id) then
    delete from public.companies where id=target.company_id returning id into deleted_company;
  end if;
  return jsonb_build_object('success',true,'id',target.id,'deleted_contact_ids',to_jsonb(deleted_contacts),'deleted_company_id',deleted_company);
end;
$$;
revoke all on function public.ascnd_delete_opportunity(uuid) from public,anon,authenticated;
grant execute on function public.ascnd_delete_opportunity(uuid) to service_role;

-- Preserve the date a win was recorded when notes, prices or follow-ups change later.
create or replace function public.ascnd_record_opportunity_win()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.stage='WON' then
    if tg_op='INSERT' then
      new.workflow=jsonb_set(coalesce(new.workflow,'{}'::jsonb),'{won_at}',to_jsonb(now()));
    elsif old.stage is distinct from 'WON' then
      new.workflow=jsonb_set(coalesce(new.workflow,'{}'::jsonb),'{won_at}',to_jsonb(now()));
    elsif old.workflow ? 'won_at' then
      new.workflow=jsonb_set(coalesce(new.workflow,'{}'::jsonb),'{won_at}',old.workflow->'won_at');
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.ascnd_record_opportunity_win() from public,anon,authenticated;
create trigger ascnd_opportunity_win_date before insert or update on public.opportunities
for each row execute function public.ascnd_record_opportunity_win();
notify pgrst, 'reload schema';
