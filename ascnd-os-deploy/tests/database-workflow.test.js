const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');
const catalog=require('../public/solutions-catalog');
test('Postgres cleanup is atomic, preserves shared records and assessments, and enforces catalog prices',async()=>{
 const db=new PGlite();
 try {
 await db.exec(`create role anon;create role authenticated;create role service_role;
 create table public.companies(id uuid primary key default gen_random_uuid(),name text);
 create table public.contacts(id uuid primary key default gen_random_uuid(),company_id uuid references public.companies(id) on delete set null);
 create table public.opportunities(id uuid primary key default gen_random_uuid(),company_id uuid,contact_id uuid,business_name text,solutions text,opportunity text,stage text not null default 'NEW',value numeric default 0,workflow jsonb not null default '{}',created_at timestamptz default now(),updated_at timestamptz default now());
 create table public.assessments(id bigint generated always as identity primary key,opportunity_id uuid references public.opportunities(id) on delete set null);
 grant all on all tables in schema public to service_role;`);
 const dir=path.join(__dirname,'../supabase/migrations');
 for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.sql')).sort()) await db.exec(fs.readFileSync(path.join(dir,name),'utf8'));
 const row=async(sql,args=[]) => (await db.query(sql,args)).rows[0];
 const count=async(table) => Number((await row('select count(*) as n from '+table)).n);
 const company=async()=> (await row("insert into companies(name) values ('Test') returning id")).id;
 const contact=async(c)=> (await row('insert into contacts(company_id) values ($1) returning id',[c])).id;
 const opportunity=async(c,k,solutions='connect-digital')=>(await row("insert into opportunities(company_id,contact_id,business_name,solutions,opportunity) values($1,$2,'Test',$3,$3) returning id,value",[c,k,solutions]));
 const remove=async(id)=>(await row('select public.ascnd_delete_opportunity($1) as result',[id])).result;
 let c=await company(),k=await contact(c);await contact(c);let o=await opportunity(c,k);
 assert.equal(Number(o.value),799);
 await db.query('insert into assessments(opportunity_id) values($1)',[o.id]);
 const deleted=await remove(o.id);assert.equal(deleted.success,true);assert.equal(deleted.deleted_contact_ids.length,2);assert.equal(deleted.deleted_company_id,c);
 assert.equal(await count('companies'),0);assert.equal(await count('contacts'),0);assert.equal(await count('assessments'),1);assert.equal((await row('select opportunity_id from assessments')).opportunity_id,null);
 // Two opportunities share both records. First deletion retains them, last deletion cleans them up.
 c=await company();k=await contact(c);const a=await opportunity(c,k),b=await opportunity(c,k);
 const shared=await remove(a.id);assert.equal(shared.deleted_contact_ids.length,0);assert.equal(shared.deleted_company_id,null);assert.equal(await count('contacts'),1);
 await remove(b.id);assert.equal(await count('companies'),0);assert.equal(await count('contacts'),0);
 // A dependent record blocks cleanup: the opportunity and all related data survive the error.
 c=await company();k=await contact(c);o=await opportunity(c,k);
 await db.exec('create table protected_record(id int,company_id uuid references public.companies(id));');
 await db.query('insert into protected_record values(1,$1)',[c]);
 await assert.rejects(()=>remove(o.id),/foreign key/i);
 assert.equal(await count('opportunities'),1);assert.equal(await count('contacts'),1);assert.equal(await count('companies'),1);
 // SQL and browser pricing agree for every live legacy grouping and new AI option.
 for(const solutions of ['connect-digital, intelligence, coordinate','grow, estimate','grow, estimate, other','start, grow','start, grow, brand, estimate','start, grow, estimate','ai-receptionist','start-brand, connect-digital, intelligence, coordinate, custom, ai-receptionist','connect-digital, connect-digital']) {
   assert.equal(Number((await row('select public.ascnd_catalog_value($1) as value',[solutions])).value),catalog.price(solutions));
 }
 await db.query("update opportunities set solutions='ai-receptionist',value=1 where id=$1",[o.id]);
 assert.equal(Number((await row('select value from opportunities where id=$1',[o.id])).value),2250);
 await db.query("update opportunities set stage='WON' where id=$1",[o.id]);
 const before=(await row('select workflow from opportunities where id=$1',[o.id])).workflow.won_at;assert.ok(before);
 await db.query("update opportunities set workflow='{}' where id=$1",[o.id]);
 assert.equal((await row('select workflow from opportunities where id=$1',[o.id])).workflow.won_at,before);
 const permissions=await row("select has_function_privilege('anon','public.ascnd_delete_opportunity(uuid)','execute') as anon,has_function_privilege('authenticated','public.ascnd_delete_opportunity(uuid)','execute') as authenticated");
 assert.equal(permissions.anon,false);assert.equal(permissions.authenticated,false);
 } finally {await db.close();}
});
