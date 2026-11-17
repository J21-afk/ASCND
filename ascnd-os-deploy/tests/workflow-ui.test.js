const {JSDOM}=require('jsdom');
const {test}=require('node:test');
const path=require('node:path');
const root=path.join(__dirname,'..');
const fs=require('fs'),assert=require('node:assert/strict');
test('dashboard workflow supports filters, editing, follow-ups, deletion, Connect, and AI Receptionist', async()=>{
const html=fs.readFileSync(root+'/public/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'dangerously',pretendToBeVisual:true});const w=dom.window;
let records=[{id:'one',business_name:'Test Plumbing',contact_name:'David',solutions:'start, grow, ai-receptionist',opportunity:'AI intake',stage:'NEW',value:1500,created_at:'2026-11-01T12:00:00Z',notes:'Discuss demo',workflow:{next_action:'Call David',priority:'high',follow_up_date:'2020-01-01'}},{id:'two',business_name:'Closed Company',stage:'WON',value:3000,solutions:'Website',created_at:'2026-11-01T12:00:00Z'}];
let fixtureCompanies=[{id:'company-one',name:'Test Plumbing',status:'PROSPECT',demo_tracking:{}}];
let fixtureContacts=[{id:'contact-one',first_name:'David',company_id:'company-one'}];
records[0].company_id='company-one';records[0].contact_id='contact-one';
let failSave=false,failDelete=false,mutations=0,confirm=true;
w.confirm=()=>confirm;w.alert=()=>{};
w.fetch=async(url,options={})=>{let body=[],status=200; if(url==='/api/companies'||url==='/api/company-demos')body=fixtureCompanies;else if(url==='/api/contacts')body=fixtureContacts;else if(url==='/api/opportunities'&&options.method==='POST'){mutations++;const item={...JSON.parse(options.body),id:'created',stage:'NEW'};records.push(item);body={opportunity:item};}else if(url==='/api/assessments')body={success:true,assessments:[]};else if(url==='/api/opportunities')body=records;else if(url==='/api/opportunities/one'&&options.method==='PATCH'){mutations++;if(failSave){status=500;body={error:'Test save failed'};}else{records[0]={...records[0],...JSON.parse(options.body)};body={opportunity:records[0]};}}else if(url==='/api/opportunities/one'&&options.method==='DELETE'){mutations++;if(failDelete){status=409;body={error:'Linked record prevents deletion'};}else{records=records.filter(r=>r.id!=='one');fixtureCompanies=[];fixtureContacts=[];body={success:true};}}return {ok:status===200,status,json:async()=>JSON.parse(JSON.stringify(body))};};
try {
{ const script=w.document.createElement('script');script.textContent=fs.readFileSync(root+'/public/solutions-catalog.js','utf8') + '\n' + fs.readFileSync(root+'/public/business-analysis.js','utf8') + '\n' + fs.readFileSync(root+'/public/app.js','utf8');w.document.body.append(script); }await new Promise(r=>setTimeout(r,30));
{ const script=w.document.createElement('script');script.textContent=fs.readFileSync(root+'/public/opportunity-workflow.js','utf8');w.document.body.append(script); }
{ const script=w.document.createElement('script');script.textContent=fs.readFileSync(root+'/public/company-demos.js','utf8');w.document.body.append(script); }
await new Promise(r=>setTimeout(r,240));
const q=s=>w.document.querySelector(s);const change=(s,value)=>{q(s).value=value;q(s).dispatchEvent(new w.Event('input',{bubbles:true}));q(s).dispatchEvent(new w.Event('change',{bubbles:true}));};
assert.equal(q('.ow-today'),null);assert.match(q('.briefing-panel').textContent,/Today's Briefing/);assert.equal(q('#overviewPipelineValue').textContent,'$4,549');assert.equal(w.document.querySelectorAll('.ow-row').length,1);
change('#ow-filter','all');assert.equal(w.document.querySelectorAll('.ow-row').length,2);change('#ow-search','plumbing');assert.equal(w.document.querySelectorAll('.ow-row').length,1);
q('#overviewAttentionList button').click();
assert.equal(q('#opportunityDetail').classList.contains('active'),true);
assert.match(q('#opportunityDetail h2').textContent,/Test Plumbing/);
assert.equal(q('[name="owSolution"][value="connect-digital"]').checked,true);
assert.equal(q('[name="owSolution"][value="intelligence"]').checked,true);
assert.equal(q('[name="owSolution"][value="ai-receptionist"]').checked,true);
assert.equal(q('[name="owSolution"][value="start-brand"]').checked,false);
assert.equal(q('[name="value"]').value,'4549');
change('[name="business_name"]','Edited Plumbing');change('[name="next_action"]','Send proposal');
failSave=true;await q('#ow-form').onsubmit({preventDefault(){}});assert.equal(q('#ow-message').textContent,'Test save failed');assert.equal(q('[name="business_name"]').value,'Edited Plumbing');
failSave=false;await q('#ow-form').onsubmit({preventDefault(){}});assert.equal(q('#ow-message').textContent,'Changes saved.');assert.equal(records[0].workflow.next_action,'Send proposal');assert.equal(records[0].business_name,'Edited Plumbing');
change('[name="stage"]','WON');await q('#ow-form').onsubmit({preventDefault(){}});assert.equal(q('#overviewFollowUps').textContent,'0');assert.equal(q('#overviewPipelineValue').textContent,'$0');
const before=mutations;confirm=false;await q('#ow-delete').onclick();assert.equal(mutations,before);
confirm=true;failDelete=true;await q('#ow-delete').onclick();assert.equal(records.length,2);assert.equal(q('#ow-message').textContent,'Linked record prevents deletion');
failDelete=false;await q('#ow-delete').onclick();assert.equal(records.length,1);assert.equal(q('#opportunities').classList.contains('active'),true);assert.equal(w.document.querySelectorAll('.ow-row').length,0);
// Creation uses the new catalog selections and refreshes without a page reload.
q('#newRadarOpportunity').click();assert.equal(q('#newOpportunityModal').classList.contains('active'),true);
change('#newOpportunityBusiness','New Service Company');
const connect=q('input[name="opportunitySolution"][value="connect-digital"]');const ai=q('input[name="opportunitySolution"][value="ai-receptionist"]');
assert.ok(connect);assert.ok(ai);
assert.equal(ai.disabled,false);
const intelligence=q('input[name="opportunitySolution"][value="intelligence"]'); intelligence.checked=true; intelligence.dispatchEvent(new w.Event('change',{bubbles:true}));
assert.equal(ai.disabled,false);assert.equal(q('input[name="opportunitySolution"][value="grow"]'),null);
ai.checked=true;
intelligence.checked=false; intelligence.dispatchEvent(new w.Event('change',{bubbles:true}));
assert.equal(ai.checked,true); assert.equal(ai.disabled,false);
intelligence.checked=true; intelligence.dispatchEvent(new w.Event('change',{bubbles:true}));
connect.checked=true;ai.checked=true;ai.dispatchEvent(new w.Event('change',{bubbles:true}));
assert.equal(q('#newOpportunityCalculatedValue').textContent,'$4,549');
q('#newOpportunityForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
for(let i=0;i<20 && !records.some(item=>item.id==='created');i++)await new Promise(r=>setTimeout(r,5));
await new Promise(r=>setTimeout(r,20));
assert.equal(records.find(item=>item.id==='created').solutions,'connect-digital, intelligence, ai-receptionist');
assert.equal(q('#newOpportunityModal').classList.contains('active'),false);
assert.match(q('#opportunityDetail').textContent,/New Service Company/);
// The old example values and businesses cannot appear as real data.
assert.doesNotMatch(html,/\$15,000|\$3,000|NXT LEVEL EPOXY|BLUE STAR BIKE SHOP|3 companies|3 contacts/);
assert.equal(q('#ow-stage-summary'),null);
assert.ok(q('#businessGoal'));assert.equal(q('#companyList'),null);assert.equal(q('#inboxRecentActivity'),null);assert.ok(q('#assessmentTableBody'));assert.ok(q('#companyDemoPipeline'));assert.equal(q('#contacts .company-list').children.length,0);


}finally{w.close();}
});
