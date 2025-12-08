/* My Planner - core logic (planner, notes, reminders, docs) */

// ---------- Utilities ----------
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);
const uid = () => Date.now() + Math.floor(Math.random()*999);

// ---------- Navigation ----------
qsa('.navbtn').forEach(b=>{
  b.addEventListener('click', e=>{
    qsa('.navbtn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const page = b.dataset.page;
    qsa('.page').forEach(p=>p.classList.remove('active-page'));
    qs(`#${page}`).classList.add('active-page');
  });
});

// ---------- WEEK & TAB colors ----------
const weekTab = qs('#weekTab');
const prevWeek = qs('#prevWeek');
const nextWeek = qs('#nextWeek');
const colors = ["#FF9AA2","#FFB7B2","#FFDAC1","#E2F0CB","#B5EAD7","#C7CEEA","#D7BDE2","#F7C6FF","#FFC0CB","#B4A6FF"]; // rainbow + pink/purple pool
let weekOffset = 0;

// get monday date from any date
function mondayFrom(d){
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day===0?-6:1);
  const m = new Date(dt.setDate(diff));
  m.setHours(0,0,0,0);
  return m;
}
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function fmt(d){ return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`; }
function weekBase(offset){
  const base = addDays(new Date(), offset*7);
  const mon = mondayFrom(base);
  const sun = addDays(mon,6);
  return {mon,sun};
}
function weekKey(mon){ return 'planner_week_' + mon.toISOString().slice(0,10); }

function setWeekTab(){
  const {mon,sun} = weekBase(weekOffset);
  weekTab.textContent = `${fmt(mon)} - ${fmt(sun)}`;
  // color index by week number
  const index = Math.abs(Math.floor(mon.getTime()/86400000/7)) % colors.length;
  weekTab.style.background = colors[index];
  // default page color pick set to complement (keep user selection if changed)
  qs('#pageColor').value = colorToInput(colors[index]) || qs('#pageColor').value;
  renderPlanner();
}

// helper to pick an input-safe color from array (makes nicer defaults)
function colorToInput(hex){ return hex; }

// ---------- Planner DOM building ----------
const leftSpread = qs('#leftSpread');
const rightSpread = qs('#rightSpread');

function buildPlannerDOM(){
  leftSpread.innerHTML=''; rightSpread.innerHTML='';
  const {mon} = weekBase(weekOffset);
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  for(let i=0;i<7;i++){
    const d = addDays(mon,i);
    const iso = d.toISOString().slice(0,10);
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.dataset.iso = iso;
    dayDiv.innerHTML = `
      <div class="day-header">
        <div>
          <div class="day-title">${labels[i]}</div>
          <div class="day-date">${fmt(d)}</div>
        </div>
        <div class="icons"></div>
      </div>
      <div class="events" data-events></div>
      <div class="add-row">
        <input type="time" data-time>
        <input type="text" data-text placeholder="Add event...">
        <button class="btn" data-add> <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#fff" d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"></path></svg></button>
      </div>
    `;
    if(i<3) leftSpread.appendChild(dayDiv); else rightSpread.appendChild(dayDiv);
  }
  // right side last box: notes box underneath days (as the 8th box)
  const notesBox = document.createElement('div');
  notesBox.className='day';
  notesBox.innerHTML = `<div class="day-header"><div class="day-title">Notes</div></div>
    <div class="events" id="weekNotesArea" contenteditable="true" style="min-height:120px;padding:12px"></div>`;
  rightSpread.appendChild(notesBox);

  // attach listeners for add buttons
  qsa('[data-add]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const root = btn.closest('.day');
      const iso = root.dataset.iso;
      const time = root.querySelector('[data-time]').value;
      const text = root.querySelector('[data-text]').value.trim();
      if(!text) return;
      const list = JSON.parse(localStorage.getItem(iso) || '[]');
      list.push({id:Date.now(),time:time||'00:00',text});
      // sort by time (if time present)
      list.sort((a,b)=> (a.time||'00:00') > (b.time||'00:00') ? 1 : -1);
      localStorage.setItem(iso, JSON.stringify(list));
      root.querySelector('[data-text]').value='';
      root.querySelector('[data-time]').value='';
      loadWeekEvents();
    });
  });
}

// render events into DOM
function loadWeekEvents(){
  qsa('.day').forEach(day=>{
    const iso = day.dataset.iso;
    const container = day.querySelector('[data-events]');
    if(!container) return;
    container.innerHTML='';
    const list = JSON.parse(localStorage.getItem(iso) || '[]');
    // show sorted by time
    list.sort((a,b)=> (a.time||'00:00') > (b.time||'00:00') ? 1 : -1);
    list.forEach(it=>{
      const el = document.createElement('div');
      el.className='event-item';
      el.innerHTML = `<div class="event-time">${it.time}</div><div style="flex:1">${escapeHtml(it.text)}</div>
        <button class="btn ghost" data-del="${it.id}" style="padding:6px 8px">x</button>`;
      container.appendChild(el);
      el.querySelector('[data-del]').addEventListener('click', ()=>{
        const arr = JSON.parse(localStorage.getItem(iso) || '[]').filter(x=>x.id!==it.id);
        localStorage.setItem(iso, JSON.stringify(arr));
        loadWeekEvents();
      });
    });
  });
  // load week notes
  const {mon} = weekBase(weekOffset);
  const weekNotesKey = weekKey(mon);
  const noteArea = qs('#weekNotesArea');
  noteArea.innerHTML = localStorage.getItem(weekNotesKey + '_notes') || '';
  noteArea.onblur = ()=> localStorage.setItem(weekNotesKey + '_notes', noteArea.innerHTML);
}

// helper to escape
function escapeHtml(s){ return s.replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// ---------- render flow ----------
function renderPlanner(){
  buildPlannerDOM();
  applyPageStyles();
  loadWeekEvents();
}
prevWeek.addEventListener('click', ()=>{ weekOffset--; setWeekTab(); });
nextWeek.addEventListener('click', ()=>{ weekOffset++; setWeekTab(); });

// when page color / bg choice changes
qs('#bgChoice').addEventListener('change', applyPageStyles);
qs('#pageColor').addEventListener('change', applyPageStyles);
qs('#plannerFontColor').addEventListener('change', applyFonts);
qs('#plannerFontSize').addEventListener('change', applyFonts);

function applyPageStyles(){
  const choice = qs('#bgChoice').value;
  const color = qs('#pageColor').value;
  const left = qs('#leftSpread');
  const right = qs('#rightSpread');
  left.style.background = color; right.style.background = color;
  left.style.backgroundSize = 'cover'; right.style.backgroundSize = 'cover';
  left.style.backgroundPosition = 'center'; right.style.backgroundPosition = 'center';
  if(choice==='spring'){ left.style.backgroundImage = "url('images/spring-cherry.jpg')"; right.style.backgroundImage = "url('images/spring-cherry.jpg')";}
  else if(choice==='summer'){ left.style.backgroundImage = "url('images/summer-beach.jpg')"; right.style.backgroundImage = "url('images/summer-beach.jpg')";}
  else if(choice==='fall'){ left.style.backgroundImage = "url('images/fall-leaves.jpg')"; right.style.backgroundImage = "url('images/fall-leaves.jpg')";}
  else if(choice==='winter'){ left.style.backgroundImage = "url('images/winter-snowman.jpg')"; right.style.backgroundImage = "url('images/winter-snowman.jpg')";}
  else { left.style.backgroundImage='none'; right.style.backgroundImage='none'; }
  applyFonts();
}

function applyFonts(){
  const color = qs('#plannerFontColor').value;
  const size = qs('#plannerFontSize').value + 'px';
  qsa('.day, .events, .day-title, .day-date').forEach(el=>{
    el.style.color = color;
    el.style.fontSize = size;
  });
}

// ---------- NOTES (stickies) ----------
const stickiesArea = qs('#stickiesArea');
qs('#addSticky').addEventListener('click', ()=> createSticky());
qs('#stickyColor').addEventListener('change', ()=>{ /* color default for new stickies */ });
qs('#notesFontColor').addEventListener('change', ()=> applyNotesFont());
qs('#notesFontSize').addEventListener('change', ()=> applyNotesFont());

function loadStickies(){
  stickiesArea.innerHTML='';
  const list = JSON.parse(localStorage.getItem('stickies')||'[]');
  list.forEach(s=> renderSticky(s));
}
function createSticky(data){
  const s = data || {id:uid(),text:'',color:qs('#stickyColor').value};
  const arr = JSON.parse(localStorage.getItem('stickies')||'[]');
  arr.push(s); localStorage.setItem('stickies', JSON.stringify(arr));
  renderSticky(s);
}
function renderSticky(s){
  const el = document.createElement('div');
  el.className='sticky';
  el.style.background = s.color || qs('#stickyColor').value;
  el.dataset.id = s.id;
  el.innerHTML = `<button class="remove" title="Remove">✕</button>
    <textarea>${s.text||''}</textarea>`;
  stickiesArea.prepend(el);
  el.querySelector('.remove').addEventListener('click', ()=>{
    const arr = JSON.parse(localStorage.getItem('stickies')||'[]').filter(x=>x.id!==s.id);
    localStorage.setItem('stickies', JSON.stringify(arr));
    el.remove();
  });
  const ta = el.querySelector('textarea');
  ta.addEventListener('blur', ()=> {
    const arr = JSON.parse(localStorage.getItem('stickies')||'[]');
    const idx = arr.findIndex(x=>x.id===s.id);
    if(idx>-1){ arr[idx].text = ta.value; arr[idx].color = el.style.background; localStorage.setItem('stickies', JSON.stringify(arr)) }
  });
  applyNotesFont();
}
function applyNotesFont(){
  const color = qs('#notesFontColor').value;
  const size = qs('#notesFontSize').value + 'px';
  qsa('.sticky textarea').forEach(t=>{ t.style.color = color; t.style.fontSize = size; });
}

// ---------- REMINDERS ----------
qs('#addRemBtn').addEventListener('click', addReminder);
function addReminder(){
  const text = qs('#remInput').value.trim(); if(!text) return;
  const list = JSON.parse(localStorage.getItem('reminders')||'[]');
  const item = {id:uid(),text,done:false, color: qs('#remBulletColor').value};
  list.push(item); localStorage.setItem('reminders', JSON.stringify(list));
  qs('#remInput').value=''; renderReminders();
}
function renderReminders(){
  const list = JSON.parse(localStorage.getItem('reminders')||'[]');
  const container = qs('#remList'); container.innerHTML='';
  list.forEach(it=>{
    const li = document.createElement('li'); li.className='rem-item';
    li.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><span class="rem-bullet" style="background:${it.color};opacity:${it.done?0.4:1}"></span><div style="flex:1;color:${qs('#remFontColor').value};font-size:${qs('#remFontSize').value}px">${it.text}</div></div>
      <div><button class="btn ghost" data-rid="${it.id}">x</button></div>`;
    container.appendChild(li);
    li.querySelector('.rem-bullet').addEventListener('click', ()=>{
      it.done = !it.done; const arr = JSON.parse(localStorage.getItem('reminders')||'[]'); const idx = arr.findIndex(x=>x.id===it.id); if(idx>-1){ arr[idx].done = it.done; localStorage.setItem('reminders', JSON.stringify(arr)) }
      renderReminders();
    });
    li.querySelector('[data-rid]').addEventListener('click', (e)=>{
      const id = e.target.dataset.rid;
      const arr = JSON.parse(localStorage.getItem('reminders')||'[]').filter(x=>x.id!=id);
      localStorage.setItem('reminders', JSON.stringify(arr)); renderReminders();
    });
  });
}
qs('#remBulletColor').addEventListener('change', renderReminders);
qs('#remFontColor').addEventListener('change', renderReminders);
qs('#remFontSize').addEventListener('change', renderReminders);

// ---------- DOCUMENTS ----------
const docsList = qs('#docsList');
const docEditor = qs('#docEditor');
const docTitle = qs('#docTitle');

function loadDocs(){
  docsList.innerHTML='';
  const docs = JSON.parse(localStorage.getItem('docs')||'[]');
  docs.forEach(d=>{
    const li = document.createElement('li');
    li.innerHTML = `<div style="flex:1">${d.title}</div><div><button class="btn" data-open="${d.id}">Open</button><button class="btn ghost" data-del="${d.id}">Del</button></div>`;
    docsList.appendChild(li);
    li.querySelector('[data-open]').addEventListener('click', ()=> openDoc(d.id));
    li.querySelector('[data-del]').addEventListener('click', ()=> { deleteDoc(d.id); });
  });
}
function newDoc(){
  docEditor.innerHTML = '<p></p>'; docTitle.value = 'Untitled';
}
function saveDoc(){
  const docs = JSON.parse(localStorage.getItem('docs')||'[]');
  const id = uid();
  const obj = {id, title: docTitle.value||'Untitled', content: docEditor.innerHTML, updated: Date.now()};
  docs.push(obj); localStorage.setItem('docs', JSON.stringify(docs)); loadDocs(); alert('Saved');
}
function openDoc(id){
  const docs = JSON.parse(localStorage.getItem('docs')||'[]'); const doc = docs.find(d=>d.id==id);
  if(doc){ docTitle.value = doc.title; docEditor.innerHTML = doc.content; }
}
function deleteDoc(id){
  const docs = JSON.parse(localStorage.getItem('docs')||'[]').filter(d=>d.id!=id); localStorage.setItem('docs', JSON.stringify(docs)); loadDocs();
}
qs('#newDoc').addEventListener('click', newDoc);
qs('#saveDoc').addEventListener('click', saveDoc);
qs('#downloadDoc').addEventListener('click', ()=>{
  const blob = new Blob([docEditor.innerHTML], {type:'text/html'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (docTitle.value||'document') + '.html'; a.click();
});
// toolbar exec
qsa('.docs-toolbar [data-cmd]').forEach(b=>{
  b.addEventListener('click', ()=> document.execCommand(b.dataset.cmd, false, null));
});
qs('#docFontSize').addEventListener('change', ()=>{ docEditor.style.fontSize = qs('#docFontSize').value + 'px'; });
qs('#docFontColor').addEventListener('change', ()=>{ docEditor.style.color = qs('#docFontColor').value; });

// ---------- init ----------
function init(){
  setWeekTab();
  loadStickies();
  renderReminders();
  loadDocs();
  // save week notes area on change handled in loadWeekEvents
}
init();
