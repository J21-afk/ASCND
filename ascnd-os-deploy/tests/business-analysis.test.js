const {test}=require('node:test');
const assert=require('node:assert/strict');
const {compute}=require('../public/business-analysis');
const {registerBusinessGuidance}=require('../business-guidance-api');
const express=require('express');
test('goal tracking separates open potential from monthly wins and uses current catalog prices',()=>{
 const data=compute([
  {stage:'NEW',solutions:'connect-digital',value:50000,workflow:{}},
  {stage:'WON',solutions:'ai-receptionist',updated_at:'2026-11-10',workflow:{won_at:'2026-10-31'}},
  {stage:'WON',solutions:'intelligence',workflow:{won_at:'2026-11-01'}},
  {stage:'LOST',solutions:'custom'}
 ],[],{now:'2026-11-17T12:00:00'});
 assert.equal(data.goal,10000);assert.equal(data.openValue,799);assert.equal(data.wonValue,1500);assert.equal(data.coverageGap,7701);assert.equal(data.activeCount,1);assert.equal(data.missingNextCount,1);
 assert.ok(data.suggestions.some(s=>s.title.includes('coverage')));
});
test('empty and fully covered pipelines stay finite and do not claim collected revenue',()=>{
 const empty=compute([],[],{now:'2026-11-30T12:00:00'});
 assert.equal(empty.dailyRequired,10000);assert.equal(empty.projection,0);assert.equal(empty.coveragePercent,0);
 const full=compute([{stage:'NEW',solutions:'start-brand, connect-digital, intelligence, coordinate, custom, ai-receptionist'},{stage:'NEW',solutions:'ai-receptionist, intelligence'}]);
 assert.equal(full.coveragePercent,100);assert.equal(full.coverageGap,0);assert.equal(full.wonValue,0);
});
test('guidance requires authentication and returns an explicitly labeled live-data fallback without an AI key',async t=>{
 const original=process.env.OPENAI_API_KEY; delete process.env.OPENAI_API_KEY;t.after(()=>{if(original)process.env.OPENAI_API_KEY=original;});
 const app=express();app.use((req,res,next)=>{if(req.headers.authorization==='owner')req.authUser={id:'owner'};next();});
 const db={from(table){return {async select(){return {data:table==='opportunities'?[{stage:'NEW',solutions:'connect-digital'}]:[],error:null};}};}};
 registerBusinessGuidance(app,db);
 const server=await new Promise(r=>{const s=app.listen(0,'127.0.0.1',()=>r(s));});t.after(()=>server.close());
 const url=`http://127.0.0.1:${server.address().port}/api/business-guidance`;
 assert.equal((await fetch(url)).status,401);
 const data=await (await fetch(url,{headers:{authorization:'owner'}})).json();
 assert.equal(data.source,'live-data');assert.equal(data.aiConnected,false);assert.equal(data.snapshot.openValue,799);assert.ok(data.suggestions.length>0);
});
