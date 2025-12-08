const plannerGrid = document.getElementById("planner-grid");

// Create 7x5 boxes (like a monthly planner)
for (let i = 1; i <= 35; i++) {
  const box = document.createElement("div");
  box.classList.add("planner-box");

  const content = document.createElement("div");
  content.classList.add("box-content");

  const notesBtn = document.createElement("button");
  notesBtn.textContent = "Notes";
  notesBtn.classList.add("toggle-btn");

  const remindersBtn = document.createElement("button");
  remindersBtn.textContent = "Reminders";
  remindersBtn.classList.add("toggle-btn");

  const notesText = document.createElement("p");
  notesText.textContent = "Your notes here";

  const remindersText = document.createElement("p");
  remindersText.textContent = "Your reminders here";

  content.appendChild(notesBtn);
  content.appendChild(remindersBtn);
  content.appendChild(notesText);
  content.appendChild(remindersText);

  // Toggle functionality
  notesBtn.addEventListener("click", () => {
    notesText.style.display = notesText.style.display === "block" ? "none" : "block";
    remindersText.style.display = "none";
  });

  remindersBtn.addEventListener("click", () => {
    remindersText.style.display = remindersText.style.display === "block" ? "none" : "block";
    notesText.style.display = "none";
  });

  box.appendChild(content);

  // Show/hide content when box is clicked
  box.addEventListener("click", (e) => {
    // Prevent click on buttons from triggering this
    if (e.target.tagName !== "BUTTON") {
      content.style.display = content.style.display === "block" ? "none" : "block";
    }
  });

  plannerGrid.appendChild(box);
}
