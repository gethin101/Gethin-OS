// --- Boot + lock screen ---

const bootScreen = document.getElementById("boot-screen");
const lockScreen = document.getElementById("lock-screen");
const osRoot = document.getElementById("os");
const lockTime = document.getElementById("lock-time");
const unlockBtn = document.getElementById("unlock-btn");

function updateLockTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  lockTime.textContent = `${h}:${m}`;
}

setInterval(updateLockTime, 1000);
updateLockTime();

setTimeout(() => {
  bootScreen.classList.add("hidden");
  lockScreen.classList.remove("hidden");
}, 2600);

unlockBtn.addEventListener("click", () => {
  lockScreen.classList.add("hidden");
  osRoot.classList.remove("hidden");
});

// --- Clock in taskbar ---

const taskbarClock = document.getElementById("taskbar-clock");

function updateTaskbarClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  taskbarClock.textContent = `${h}:${m}`;
}

setInterval(updateTaskbarClock, 1000);
updateTaskbarClock();

// --- Start menu ---

const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");

startButton.addEventListener("click", () => {
  startMenu.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.classList.add("hidden");
  }
});

// --- Window + app system ---

const windowLayer = document.getElementById("window-layer");
const taskbarApps = document.getElementById("taskbar-apps");

let zCounter = 10;
const openWindows = {}; // appId -> { windowEl, taskbarEl }

const apps = {
  about: {
    title: "About Gethin OS",
    createContent() {
      const div = document.createElement("div");
      div.innerHTML = `
        <p><strong>Gethin OS</strong> — a web-based operating system experiment.</p>
        <p style="margin-top:8px;">Built in HTML, CSS and JavaScript.</p>
        <p style="margin-top:8px; opacity:0.7;">v0.1 • ${new Date().getFullYear()}</p>
      `;
      return div;
    },
  },
  notes: {
    title: "Notes",
    createContent() {
      const wrapper = document.createElement("div");
      const textarea = document.createElement("textarea");
      textarea.className = "notes-textarea";
      textarea.placeholder = "Write your notes here...";
      textarea.value = localStorage.getItem("gethin_os_notes") || "";
      textarea.addEventListener("input", () => {
        localStorage.setItem("gethin_os_notes", textarea.value);
      });
      wrapper.appendChild(textarea);
      return wrapper;
    },
  },
};

function createWindow(appId) {
  const app = apps[appId];
  if (!app) return;

  // Window element
  const win = document.createElement("div");
  win.className = "window";
  win.style.left = 80 + Math.random() * 120 + "px";
  win.style.top = 80 + Math.random() * 80 + "px";
  win.style.zIndex = ++zCounter;

  const header = document.createElement("div");
  header.className = "window-header";

  const title = document.createElement("div");
  title.className = "window-header-title";
  title.textContent = app.title;

  const controls = document.createElement("div");
  controls.className = "window-controls";

  const btnMin = document.createElement("button");
  btnMin.className = "window-btn min";

  const btnClose = document.createElement("button");
  btnClose.className = "window-btn close";

  controls.appendChild(btnMin);
  controls.appendChild(btnClose);

  header.appendChild(title);
  header.appendChild(controls);

  const content = document.createElement("div");
  content.className = "window-content";
  content.appendChild(app.createContent());

  win.appendChild(header);
  win.appendChild(content);
  windowLayer.appendChild(win);

  // Taskbar item
  const taskItem = document.createElement("button");
  taskItem.className = "taskbar-item active";
  taskItem.textContent = app.title;
  taskbarApps.appendChild(taskItem);

  openWindows[appId] = { windowEl: win, taskbarEl: taskItem };

  // Focus on click
  function focusWindow() {
    win.style.zIndex = ++zCounter;
    Object.values(openWindows).forEach((w) => w.taskbarEl.classList.remove("active"));
    taskItem.classList.add("active");
  }

  win.addEventListener("mousedown", focusWindow);
  taskItem.addEventListener("click", () => {
    if (win.classList.contains("hidden")) {
      win.classList.remove("hidden");
    }
    focusWindow();
  });

  // Dragging
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragging = false;

  header.addEventListener("mousedown", (e) => {
    dragging = true;
    dragOffsetX = e.clientX - win.offsetLeft;
    dragOffsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = "none";
    focusWindow();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = e.clientX - dragOffsetX + "px";
    win.style.top = e.clientY - dragOffsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    document.body.style.userSelect = "";
  });

  // Minimize
  btnMin.addEventListener("click", () => {
    win.classList.add("hidden");
    taskItem.classList.remove("active");
  });

  // Close
  btnClose.addEventListener("click", () => {
    win.remove();
    taskItem.remove();
    delete openWindows[appId];
  });

  focusWindow();
}

// Desktop icons
document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("dblclick", () => {
    const appId = icon.dataset.app;
    createWindow(appId);
  });
});

// Start menu apps
document.querySelectorAll(".start-app").forEach((btn) => {
  btn.addEventListener("click", () => {
    const appId = btn.dataset.app;
    createWindow(appId);
    startMenu.classList.add("hidden");
  });
});
