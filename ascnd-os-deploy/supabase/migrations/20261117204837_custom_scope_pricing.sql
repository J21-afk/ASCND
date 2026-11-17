-- Catalog totals are authoritative across new, edited, and existing opportunities.
create or replace function public.ascnd_catalog_value(p_solutions text)
returns numeric language sql immutable security invoker set search_path='' as $$
  select coalesce(sum(case id
    when 'start-brand' then 500 when 'connect-digital' then 799
    when 'intelligence' then 1500 when 'coordinate' then 750
    when 'custom' then 0 when 'ai-receptionist' then 2250 else 0 end),0)::numeric
  from (select distinct case
    when lower(btrim(token)) in ('start','connect-digital','ascnd start') then 'connect-digital'
    when lower(btrim(token)) in ('brand','start-brand','brand identity') then 'start-brand'
    when lower(btrim(token)) in ('grow','connect','intelligence','ascnd grow','ascnd connect','ascnd intelligence') then 'intelligence'
    when lower(btrim(token)) in ('estimate','coordinate','ascnd coordinate') then 'coordinate'
    when lower(btrim(token)) in ('other','custom','custom solution','other / custom') then 'custom'
    when lower(btrim(token)) in ('ai-receptionist','ai receptionist') or lower(btrim(token)) like 'ai receptionist%—%' then 'ai-receptionist'
    when lower(btrim(token)) ~ '^ascnd (start|connect|grow).*(website|digital foundation)' then 'connect-digital'
    when lower(btrim(token)) ~ '^ascnd (connect|grow|intelligence).*(lead|customer)' then 'intelligence'
    when lower(btrim(token)) ~ '^(ascnd start|brand identity).*brand' or lower(btrim(token)) like 'brand identity%' then 'start-brand'
    when lower(btrim(token)) like 'ascnd coordinate%' or lower(btrim(token)) like 'estimate / quote system%' then 'coordinate'
    else lower(btrim(token)) end as id
    from unnest(string_to_array(coalesce(p_solutions,''),',')) as token
  ) selected;
$$;
revoke all on function public.ascnd_catalog_value(text) from public,anon,authenticated;
grant execute on function public.ascnd_catalog_value(text) to service_role;


update public.opportunities set value=public.ascnd_catalog_value(coalesce(nullif(solutions,''),opportunity)) where value is distinct from public.ascnd_catalog_value(coalesce(nullif(solutions,''),opportunity));
