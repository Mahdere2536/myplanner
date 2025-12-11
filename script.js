/* ---------- TABS ---------- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ---------- PLANNER ---------- */
const rainbow = ['#e91e63','#9c27b0','#3f51b5','#03a9f4','#009688','#8bc34a','#ffc107'];
let weekOffset = 0;
function renderWeek(){
  const mon = new Date();
  mon.setDate(mon.getDate() - mon.getDay() + 1 + weekOffset*7);
  const sun = new Date(mon); sun.setDate(mon.getDate()+6);
  const label = `${mon.toLocaleDateString()} – ${sun.toLocaleDateString()}`;
  document.getElementById('weekLabel').textContent = label;
  // rainbow tab
  const color = rainbow[Math.abs(weekOffset) % rainbow.length];
  document.documentElement.style.setProperty('--tabRainbow', color);
  // background
  const theme = localStorage.getItem('theme') || 'solid';
  setTheme(theme);
}
document.getElementById('prevWeek').onclick = ()=>{ weekOffset--; renderWeek(); };
document.getElementById('nextWeek').onclick = ()=>{ weekOffset++; renderWeek(); };
document.getElementById('themeSelect').onchange = e=>{ localStorage.setItem('theme', e.target.value); setTheme(e.target.value); };
function setTheme(t){
  const root = document.documentElement;
  if(t==='spring')  root.style.setProperty('--bgSolid', "url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=60') center/cover no-repeat");
  else if(t==='summer') root.style.setProperty('--bgSolid', "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=60') center/cover no-repeat");
  else if(t==='autumn') root.style.setProperty('--bgSolid', "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=60') center/cover no-repeat");
  else if(t==='winter') root.style.setProperty('--bgSolid', "url('https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1400&q=60') center/cover no-repeat");
  else root.style.setProperty('--bgSolid', '#fce4ec');
}
renderWeek();

/* font controls planner */
document.getElementById('fontColor').oninput = e=> document.querySelectorAll('.day-box textarea').forEach(t=>t.style.color=e.target.value);
document.getElementById('fontSize').oninput = e=> document.querySelectorAll('.day-box textarea').forEach(t=>t.style.fontSize=e.target.value+'px');

/* ---------- NOTES ---------- */
let noteCount=0;
document.getElementById('addNote').onclick = ()=>{
  const board = document.getElementById('notesBoard');
  const sticky = document.createElement('div'); sticky.className='sticky';
  sticky.innerHTML = `<button class="del">✖</button><textarea placeholder="Type here…"></textarea>`;
  board.appendChild(sticky);
  sticky.querySelector('.del').onclick = ()=>sticky.remove();
  applyNoteStyles(sticky);
};
function applyNoteStyles(sticky){
  sticky.style.background = document.getElementById('noteColor').value;
  const ta = sticky.querySelector('textarea');
  ta.style.color = document.getElementById('noteFontColor').value;
  ta.style.fontSize = document.getElementById('noteFontSize').value+'px';
}
['noteColor','noteFontColor','noteFontSize'].forEach(id=>{
  document.getElementById(id).oninput = ()=> document.querySelectorAll('.sticky').forEach(applyNoteStyles);
});

/* ---------- REMINDERS ---------- */
document.getElementById('addReminder').onclick = ()=>{
  const ul = document.getElementById('reminderList');
  const li = document.createElement('li'); li.className='reminder';
  li.innerHTML = `<input type="text" placeholder="Reminder…">
                  <input type="datetime-local">
                  <button class="del">✖</button>`;
  ul.appendChild(li);
  li.querySelector('.del').onclick = ()=>li.remove();
  applyRemStyles(li);
};
function applyRemStyles(li){
  const color = document.getElementById('bulletColor').value;
  li.style.setProperty('--bulletColor', color);
  const inp = li.querySelector('input[type=text]');
  inp.style.color = document.getElementById('remFontColor').value;
  inp.style.fontSize = document.getElementById('remFontSize').value+'px';
}
['bulletColor','remFontColor','remFontSize'].forEach(id=>{
  document.getElementById(id).oninput = ()=> document.querySelectorAll('.reminder').forEach(applyRemStyles);
});

/* ---------- DOCS ---------- */
let docs = JSON.parse(localStorage.getItem('myDocs')||'{}');
function listDocs(){
  const box = document.getElementById('docList');
  box.innerHTML = '';
  Object.keys(docs).forEach(title=>{
    const card = document.createElement('div'); card.className='docCard';
    card.textContent = title;
    card.onclick = ()=>{ document.getElementById('docTitle').value = title; document.getElementById('docEditor').innerHTML = docs[title]; };
    box.appendChild(card);
  });
}
document.getElementById('saveDoc').onclick = ()=>{
  const title = document.getElementById('docTitle').value.trim() || 'Untitled';
  docs[title] = document.getElementById('docEditor').innerHTML;
  localStorage.setItem('myDocs', JSON.stringify(docs));
  listDocs();
};
document.getElementById('newDoc').onclick = ()=>{
  document.getElementById('docTitle').value='';
  document.getElementById('docEditor').innerHTML='';
};
listDocs();
