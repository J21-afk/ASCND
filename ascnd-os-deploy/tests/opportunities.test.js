const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { registerOpportunityRoutes, validateUpdate } = require('../opportunities-api');

test('reject invalid values, stages, dates, and unsupported update bodies', () => {
    for (const input of [null, [], {}, {value:-1}, {value:null}, {value:'oops'}, {business_name:''}, {notes:[]}, {stage:'invented'}, {workflow:{next_action:'Call',priority:'normal',follow_up_date:'2026-02-30'}}, {workflow:{next_action:'Call',priority:'normal',follow_up_date:'2026-11-01T12:00:00Z'}}]) assert.throws(() => validateUpdate(input));
    const result = validateUpdate({ business_name:' Test ', solutions:'AI intake', company_id:'overwrite', workflow:{next_action:' Call ',priority:'high',follow_up_date:'2028-02-29'} });
    assert.deepEqual(result, {business_name:'Test', solutions:'AI intake', opportunity:'AI intake', workflow:{next_action:'Call',priority:'high',follow_up_date:'2028-02-29'}});
    assert.equal(validateUpdate({value:0}).value, 0);
});

async function harness(t, result) {
    const calls = [];
    const db = { from(table) { calls.push(['from',table]); return { update(value) { calls.push(['update',value]); return this; }, delete() { calls.push(['delete']); return this; }, eq(...args) { calls.push(['eq',...args]); return this; }, select() { return this; }, async maybeSingle() { return result; } }; } };
    const app = express(); app.use(express.json());
    app.use('/api', (req,res,next) => req.headers.authorization === 'Bearer owner' ? (req.authUser = {id:'owner'}, next()) : res.status(401).json({error:'Unauthorized'}));
    registerOpportunityRoutes(app, db);
    const server = await new Promise(resolve => { const listener=app.listen(0,'127.0.0.1',()=>resolve(listener)); });
    t.after(() => server.close());
    return { calls, request: (method, body, token='owner') => fetch(`http://127.0.0.1:${server.address().port}/api/opportunities/123`, {method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:body === undefined ? undefined : JSON.stringify(body)}) };
}

test('authorized edits update only the selected opportunity and preserve links', async t => {
    const {calls,request}=await harness(t,{data:{id:'123',business_name:'Updated'},error:null});
    const response=await request('PATCH',{business_name:'Updated',company_id:'other',contact_id:'other'});
    assert.equal(response.status,200); assert.equal((await response.json()).opportunity.id,'123');
    assert.deepEqual(calls,[['from','opportunities'],['update',{business_name:'Updated'}],['eq','id','123']]);
});
test('unauthorized edits and deletes never reach storage', async t => {
    const {calls,request}=await harness(t,{data:{id:'123'},error:null});
    assert.equal((await request('PATCH',{notes:'changed'},'wrong')).status,401);
    assert.equal((await request('DELETE',undefined,'wrong')).status,401); assert.equal(calls.length,0);
});
test('deletion targets only the opportunity, never companies or contacts', async t => {
    const {calls,request}=await harness(t,{data:{id:'123'},error:null});
    assert.equal((await request('DELETE')).status,200);
    assert.deepEqual(calls,[['from','opportunities'],['delete'],['eq','id','123']]);
});
test('missing opportunities return 404 for edits and deletes', async t => {
    const {request}=await harness(t,{data:null,error:null});
    assert.equal((await request('PATCH',{notes:'changed'})).status,404);
    assert.equal((await request('DELETE')).status,404);
});
test('linked records prevent deletion; schema setup failure stays actionable', async t => {
    const linked=await harness(t,{data:null,error:{code:'23503'}});
    assert.equal((await linked.request('DELETE')).status,409);
    const missing=await harness(t,{data:null,error:{code:'PGRST204',message:'workflow column missing'}});
    const response=await missing.request('PATCH',{workflow:{next_action:'Call',priority:'normal',follow_up_date:null}});
    assert.equal(response.status,500); assert.match((await response.json()).error,/001-opportunity-workflow.sql/);
});

test('legacy Grow names normalize to Connect while preserving ordinary prose', () => {
    const { normalizeSolutionText } = require('../opportunities-api');
    assert.equal(normalizeSolutionText('start, grow, ai-receptionist'), 'start, connect, ai-receptionist');
    assert.equal(normalizeSolutionText('ASCND Grow — Lead & Customer System'), 'ASCND Connect — Lead & Customer System');
    assert.equal(normalizeSolutionText('Help the business grow'), 'Help the business grow');
});
