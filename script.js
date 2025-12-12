// Colors for tabs and coordinated backgrounds
const tabColors = ["#e53935","#fbc02d","#43a047","#1e88e5","#8e24aa","#ff9800","#d81b60"];
const bgColors = ["#ffcdd2","#fff9c4","#c8e6c9","#bbdefb","#e1bee7","#ffe0b2","#f8bbd0"];
const leftDays = ["Monday","Tuesday","Wednesday","Thursday"];
const rightDays = ["Friday","Saturday","Sunday"];

const leftColumn = document.getElementById("left-column");
const rightColumn = document.getElementById("right-column");

// Function to create a day box
function createDayBox(day, tabColor, bgColor) {
  const box = document.createElement("div");
  box.className = "day-box";
  box.style.background = bgColor;

  const tab = document.createElement("div");
  tab.className = "color-tab";
  tab.style.background = tabColor;
  tab.textContent = day + " 12-08-2025"; // example date

  box.appendChild(tab);

  // Event list container
  const eventsContainer = document.createElement("div");
  box.appendChild(eventsContainer);

  // Add event on click
  box.addEventListener("dblclick", () => {
    const eventName = prompt("Enter event name");
    if (eventName) {
      const eventEl = document.createElement("div");
      eventEl.className = "event";
      eventEl.textContent = eventName;
      eventEl.style.background = tabColor; // simple color for now
      eventsContainer.appendChild(eventEl);
    }
  });

  // Background color picker
  box.addEventListener("contextmenu", (e)=>{
    e.preventDefault();
    const color = prompt("Enter background color in hex (e.g., #ffeecc):");
    if(color) box.style.background = color;
  });

  return box;
}

// Create left side boxes
leftDays.forEach((day,i)=>{
  const box = createDayBox(day, tabColors[i], bgColors[i]);
  leftColumn.appendChild(box);
});

// Create right side boxes
rightDays.forEach((day,i)=>{
  const box = createDayBox(day, tabColors[i+4], bgColors[i+4]);
  rightColumn.appendChild(box);
});

// Notes Section
const notesContainer = document.getElementById("notes-container");
const notesColorPicker = document.getElementById("notes-color-picker");

const note = document.createElement("div");
note.className = "note";
note.contentEditable = true;
note.style.background = notesColorPicker.value;
notesContainer.appendChild(note);

notesColorPicker.addEventListener("input", ()=>{
  note.style.background = notesColorPicker.value;
});

// Reminders Section
const remindersContainer = document.getElementById("reminders-container");
const addReminderBtn = document.getElementById("add-reminder");
const reminderColors = ["#e53935","#fbc02d","#43a047","#1e88e5","#8e24aa","#ff9800","#d81b60"];

addReminderBtn.addEventListener("click", ()=>{
  const text = prompt("Enter reminder:");
  if(text){
    const reminder = document.createElement("div");
    reminder.className = "reminder";

    const bullet = document.createElement("span");
    bullet.className = "reminder-bullet";
    bullet.style.background = reminderColors[Math.floor(Math.random()*reminderColors.length)];

    const label = document.createElement("span");
    label.textContent = text;

    reminder.appendChild(bullet);
    reminder.appendChild(label);
    remindersContainer.appendChild(reminder);
  }
});

// Document Section
const quill = new Quill('#doc-editor', {
  theme: 'snow'
});
