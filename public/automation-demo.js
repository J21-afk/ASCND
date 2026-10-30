(() => {
 const root = document.getElementById('automation-demo');
 if (!root) return;
 const states = [
 {type:'CUSTOMER ACTION',title:'A customer asks for a quote.',detail:'The customer enters their project details and chooses to submit the request.',label:'CUSTOMER-FACING FORM',content:[['Name','Jordan Lee'],['Service','Garage floor coating'],['Project','Two-car garage in San Antonio']],footer:'Request submitted by customer'},
 {type:'AUTOMATIC',title:'The details reach the right place.',detail:'An agreed rule creates or updates the customer record and adds the inquiry to the pipeline.',label:'TRIGGER → ACTION',content:[['Trigger','New valid form submission'],['Action','Create inquiry and customer record'],['Pipeline status','New · Awaiting owner response']],footer:'Rule-based automation · No AI required'},
 {type:'AUTOMATIC',title:'The owner knows what needs attention.',detail:'The system assigns an owner, creates a follow-up task, and sends an agreed notification.',label:'OWNER NOTIFICATION',content:[['Assigned to','Sales owner'],['Task','Review new garage coating request'],['Notification','New inquiry ready for your review']],footer:'Rule-based automation · No AI required'},
 {type:'AI-ASSISTED',title:'AI prepares a draft for review.',detail:'Optional AI assistance summarizes the submitted details and drafts a response. It does not approve the job or set a price.',label:'DRAFT · NOT SENT',content:[['Summary','Jordan wants coating for a two-car garage in San Antonio.'],['Draft response','Thanks for reaching out, Jordan. Could you share photos of the floor so we can review the project?'],['Owner check','Verify details, edit wording, and approve']],footer:'AI-generated content may need correction'},
 {type:'HUMAN DECISION',title:'You make the call.',detail:'The owner reviews the request and draft, decides the next step, and approves the customer response.',label:'OWNER REVIEW',content:[['Customer details','Reviewed'],['Response','Edited and approved by owner'],['Next step','Request photos before preparing a quote']],footer:'No automatic pricing, acceptance, or unapproved reply'}
 ];
 let index = 0;
 const panel = root.querySelector('#auto-state');
 const previous = root.querySelector('#auto-prev');
 const next = root.querySelector('#auto-next');
 function render(){
  const state = states[index];
  const content = document.createElement('div');content.className='auto-content';
  const badge=document.createElement('span');badge.className='auto-kind';badge.textContent=state.type;
  const title=document.createElement('h3');title.textContent=state.title;
  const detail=document.createElement('p');detail.textContent=state.detail;
  const screen=document.createElement('div');screen.className='auto-screen';
  const label=document.createElement('div');label.className='auto-screen-label';label.textContent=state.label;screen.append(label);
  state.content.forEach(([name,value])=>{const row=document.createElement('div');row.className='auto-row';const key=document.createElement('span');key.textContent=name;const text=document.createElement('strong');text.textContent=value;row.append(key,text);screen.append(row)});
  const footer=document.createElement('p');footer.className='auto-screen-footer';footer.textContent=state.footer;screen.append(footer);
  content.append(badge,title,detail,screen);panel.replaceChildren(content);
  root.querySelector('#auto-count').textContent='STEP '+(index+1)+' OF 5';
  root.querySelectorAll('.auto-stages span').forEach((stage,i)=>{stage.classList.toggle('active',i===index);if(i===index)stage.setAttribute('aria-current','step');else stage.removeAttribute('aria-current')});
  previous.disabled=index===0;next.textContent=index===4?'Replay example ↺':'Next step →';
 }
 previous.addEventListener('click',()=>{index=Math.max(0,index-1);render()});next.addEventListener('click',()=>{index=(index+1)%states.length;render()});render();
})();
