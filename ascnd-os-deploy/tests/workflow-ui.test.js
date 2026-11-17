const {JSDOM}=require('jsdom');
const {test}=require('node:test');
const path=require('node:path');
const root=path.join(__dirname,'..');
const fs=require('fs'),assert=require('node:assert/strict');
test('dashboard workflow supports filters, editing, follow-ups, deletion, Connect, and AI Receptionist', async()=>{
const html=fs.readFileSync(root+'/public/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'dangerously',pretendToBeVisual:true});const w=dom.window;
let records=[{id:'one',business_name:'Test Plumbing',contact_name:'David',solutions:'AI intake',opportunity:'AI intake',stage:'NEW',value:1500,created_at:'2026-11-01T12:00:00Z',notes:'Discuss demo',workflow:{next_action:'Call David',priority:'high',follow_up_date:'2020-01-01'}},{id:'two',business_name:'Closed Company',stage:'WON',value:3000,solutions:'Website',created_at:'2026-11-01T12:00:00Z'}];
let failSave=false,failDelete=false,mutations=0,confirm=true;
w.confirm=()=>confirm;w.alert=()=>{};
w.fetch=async(url,options={})=>{let body=[],status=200; if(url==='/api/opportunities'&&options.method==='POST'){mutations++;const item={...JSON.parse(options.body),id:'created',stage:'NEW'};records.push(item);body={opportunity:item};}else if(url==='/api/assessments')body={success:true,assessments:[]};else if(url==='/api/opportunities')body=records;else if(url==='/api/opportunities/one'&&options.method==='PATCH'){mutations++;if(failSave){status=500;body={error:'Test save failed'};}else{records[0]={...records[0],...JSON.parse(options.body)};body={opportunity:records[0]};}}else if(url==='/api/opportunities/one'&&options.method==='DELETE'){mutations++;if(failDelete){status=409;body={error:'Linked record prevents deletion'};}else{records=records.filter(r=>r.id!=='one');body={success:true};}}return {ok:status===200,status,json:async()=>JSON.parse(JSON.stringify(body))};};
try {
{ const script=w.document.createElement('script');script.textContent=fs.readFileSync(root+'/public/app.js','utf8');w.document.body.append(script); }await new Promise(r=>setTimeout(r,30));
{ const script=w.document.createElement('script');script.textContent=fs.readFileSync(root+'/public/opportunity-workflow.js','utf8');w.document.body.append(script); }
const q=s=>w.document.querySelector(s);const change=(s,value)=>{q(s).value=value;q(s).dispatchEvent(new w.Event('input',{bubbles:true}));q(s).dispatchEvent(new w.Event('change',{bubbles:true}));};
assert.match(q('.ow-today').textContent,/1 follow-up due/);assert.equal(q('#overviewPipelineValue').textContent,'$1,500');assert.equal(w.document.querySelectorAll('.ow-row').length,1);
change('#ow-filter','all');assert.equal(w.document.querySelectorAll('.ow-row').length,2);change('#ow-search','plumbing');assert.equal(w.document.querySelectorAll('.ow-row').length,1);
q('.ow-row').click();change('[name="business_name"]','Edited Plumbing');change('[name="next_action"]','Send proposal');
failSave=true;await q('#ow-form').onsubmit({preventDefault(){}});assert.equal(q('#ow-message').textContent,'Test save failed');assert.equal(q('[name="business_name"]').value,'Edited Plumbing');
failSave=false;await q('#ow-form').onsubmit({preventDefault(){}});assert.equal(q('#ow-message').textContent,'Changes saved.');assert.equal(records[0].workflow.next_action,'Send proposal');assert.equal(records[0].business_name,'Edited Plumbing');
change('[name="stage"]','WON');await q('#ow-form').onsubmit({preventDefault(){}});assert.match(q('.ow-today').textContent,/No follow-ups due/);assert.equal(q('#overviewPipelineValue').textContent,'$0');
const before=mutations;confirm=false;await q('#ow-delete').onclick();assert.equal(mutations,before);
confirm=true;failDelete=true;await q('#ow-delete').onclick();assert.equal(records.length,2);assert.equal(q('#ow-message').textContent,'Linked record prevents deletion');
failDelete=false;await q('#ow-delete').onclick();assert.equal(records.length,1);assert.equal(q('#opportunities').classList.contains('active'),true);assert.equal(w.document.querySelectorAll('.ow-row').length,0);
// Creation uses the new catalog selections and refreshes without a page reload.
q('#newRadarOpportunity').click();assert.equal(q('#newOpportunityModal').classList.contains('active'),true);
change('#newOpportunityBusiness','New Service Company');
const connect=q('input[name="opportunitySolution"][value="connect"]');const ai=q('input[name="opportunitySolution"][value="ai-receptionist"]');
assert.ok(connect);assert.ok(ai);assert.equal(q('input[name="opportunitySolution"][value="grow"]'),null);
connect.checked=true;ai.checked=true;ai.dispatchEvent(new w.Event('change',{bubbles:true}));
assert.match(q('#newOpportunityCalculatedValue').textContent,/custom quote/);
q('#newOpportunityForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
for(let i=0;i<20 && !records.some(item=>item.id==='created');i++)await new Promise(r=>setTimeout(r,5));
await new Promise(r=>setTimeout(r,20));
assert.equal(records.find(item=>item.id==='created').solutions,'connect, ai-receptionist');
assert.equal(q('#newOpportunityModal').classList.contains('active'),false);
assert.match(q('#opportunityDetail').textContent,/New Service Company/);
// The old example values and businesses cannot appear as real data.
assert.doesNotMatch(html,/\$15,000|\$3,000|NXT LEVEL EPOXY|BLUE STAR BIKE SHOP|3 companies|3 contacts/);
assert.ok(q('#ow-stage-summary'));

}finally{w.close();}
});
