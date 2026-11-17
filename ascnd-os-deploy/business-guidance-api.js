'use strict';
const {compute} = require('./public/business-analysis');
function registerBusinessGuidance(app, supabase) {
    let cached = null, pending = null;
    app.get('/api/business-guidance', async (req,res) => {
        if(!req.authUser) return res.status(401).json({error:'Sign in to view business guidance.'});
        try {
            const [opps,assessments] = await Promise.all([
                supabase.from('opportunities').select('id,solutions,opportunity,value,stage,workflow,created_at,updated_at'),
                supabase.from('assessments').select('id,status,opportunity_id')
            ]);
            if(opps.error || assessments.error) return res.status(503).json({error:'Business guidance is temporarily unavailable.'});
            const snapshot=compute(opps.data || [],assessments.data || []);
            const baseline={snapshot,suggestions:snapshot.suggestions,source:'live-data',aiConnected:Boolean(process.env.OPENAI_API_KEY),generatedAt:new Date().toISOString()};
            if(!process.env.OPENAI_API_KEY) return res.json(baseline);
            const fingerprint=JSON.stringify(snapshot);
            if(cached?.fingerprint===fingerprint && Date.now()-cached.time < 600000) return res.json(cached.result);
            if(!pending) pending=(async()=>{
                // Only aggregated business metrics leave the server; no contact details or notes.
                const response=await fetch('https://api.openai.com/v1/chat/completions',{
                    method:'POST',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
                    body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini',response_format:{type:'json_object'},messages:[
                        {role:'system',content:'You advise ASCND, a small business systems provider, on reaching a $10,000 monthly sales target. Use only the supplied aggregate metrics. Pipeline is potential and won value is booked opportunity value, never collected revenue. Do not invent customers, outcomes, probabilities or urgency. Return JSON with suggestions: an array of 3 concise objects containing title and detail. Focus on concrete next steps and obstacles. No financial guarantees.'},
                        {role:'user',content:JSON.stringify(snapshot)}
                    ],max_tokens:700})
                });
                if(!response.ok) throw new Error('AI provider unavailable');
                const json=await response.json();
                const parsed=JSON.parse(json.choices?.[0]?.message?.content || '{}');
                if(!Array.isArray(parsed.suggestions) || !parsed.suggestions.length) throw new Error('Invalid AI response');
                const suggestions=parsed.suggestions.slice(0,5).map(s=>({title:String(s.title||'').slice(0,160),detail:String(s.detail||'').slice(0,1000)}));
                const result={...baseline,source:'ai',suggestions};cached={fingerprint,time:Date.now(),result};return result;
            })().finally(()=>{pending=null;});
            try {const result=await pending; res.json(result);}
            catch {res.json({...baseline,aiUnavailable:true});}
        } catch {res.status(503).json({error:'Business guidance could not be loaded. Try again.'});}
    });
}
module.exports={registerBusinessGuidance};
