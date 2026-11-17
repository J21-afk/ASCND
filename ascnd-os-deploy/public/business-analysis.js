/* The same live-data calculations power the browser and the server advisor. */
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./solutions-catalog'));
    else root.ASCNDBusinessAnalysis = factory(root.ASCNDSolutions);
})(typeof globalThis !== 'undefined' ? globalThis : this, function(catalog) {
    const closed = o => ['WON','LOST','CLOSED'].includes(String(o.stage).toUpperCase());
    function compute(opportunities, assessments = [], options = {}) {
        const now = new Date(options.now || Date.now());
        const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const month = today.slice(0,7);
        const goal = options.goal || 10000;
        const active = opportunities.filter(o => !closed(o));
        const value = o => catalog.price(o.solutions || o.opportunity);
        const openValue = active.reduce((s,o) => s + value(o),0);
        const won = opportunities.filter(o => o.stage === 'WON' && String(o.workflow?.won_at || o.updated_at || o.created_at || '').slice(0,7) === month);
        const wonValue = won.reduce((s,o) => s + value(o),0);
        const due = active.filter(o => o.workflow?.follow_up_date && o.workflow.follow_up_date <= today);
        const uncontacted = active.filter(o => ['NEW','REVIEW'].includes(o.stage || 'NEW'));
        const noNext = active.filter(o => !o.workflow?.next_action?.trim());
        const noDate = active.filter(o => !o.workflow?.follow_up_date);
        const proposals = active.filter(o => o.stage === 'PROPOSAL');
        const unreviewed = assessments.filter(a => !a.opportunity_id && String(a.status || 'NEW').toUpperCase() === 'NEW');
        const days = new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
        const elapsed = now.getDate();
        const remaining = Math.max(0,goal-wonValue);
        const coverageGap = Math.max(0,remaining-openValue);
        const dailyRequired = remaining / Math.max(1,days-elapsed+1);
        const projection = wonValue / Math.max(1,elapsed) * days;
        const suggestions = [];
        if(due.length) suggestions.push({title:'Complete overdue and due follow-ups',detail:`${due.length} active opportunities have a follow-up due. Start with the oldest due date.`,action:'due'});
        if(uncontacted.length) suggestions.push({title:'Start the sales conversations',detail:`${uncontacted.length} opportunities are still New or Review. Contact the strongest-fit businesses and record the result.`,action:'new'});
        if(noNext.length || noDate.length) suggestions.push({title:'Give every active opportunity a next move',detail:`${noNext.length} have no next action; ${noDate.length} have no follow-up date. Assign a specific task and date after each conversation.`,action:'missing'});
        if(unreviewed.length) suggestions.push({title:'Review inbound assessments',detail:`${unreviewed.length} assessments are awaiting review. Qualify them before adding sales value.`,action:'assessments'});
        if(coverageGap>0) suggestions.push({title:'Build enough opportunity coverage',detail:`The open pipeline is $${coverageGap.toLocaleString()} short of covering the remaining $${remaining.toLocaleString()} target. Add qualified prospects; estimated value is not a sale.`,action:'opportunities'});
        else if(remaining>0) suggestions.push({title:'Focus on conversion, not just pipeline size',detail:`Your $${openValue.toLocaleString()} open pipeline covers the $${remaining.toLocaleString()} remaining target in potential value. Progress conversations to proposals and confirmed wins.`,action:'opportunities'});
        if(proposals.length) suggestions.push({title:'Get decisions on proposals',detail:`${proposals.length} proposals are awaiting decisions. Confirm the decision-maker, outstanding question, and review date.`,action:'proposals'});
        if(!active.length) suggestions.push({title:'Create the next qualified opportunity',detail:'There are no active opportunities. Use referrals, outreach, or Radar to find a business with a clear need.',action:'opportunities'});
        return {goal,month,today,days,elapsed,openValue,wonValue,activeCount:active.length,dueCount:due.length,uncontactedCount:uncontacted.length,missingNextCount:noNext.length,missingDateCount:noDate.length,proposalCount:proposals.length,unreviewedCount:unreviewed.length,remaining,coverageGap,dailyRequired,projection,coveragePercent:Math.min(100,(openValue+wonValue)/goal*100),wonPercent:Math.min(100,wonValue/goal*100),suggestions};
    }
    return {compute,closed};
});
