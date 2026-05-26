// Elements
const bootScreen = document.getElementById("boot-screen");
const lockScreen = document.getElementById("lock-screen");
const osRoot = document.getElementById("os");
const lockTime = document.getElementById("lock-time");
const lockDate = document.getElementById("lock-date");
const unlockBtn = document.getElementById("unlock-btn");

const trayTime = document.getElementById("tray-time");
const trayDate = document.getElementById("tray-date");

const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const windowLayer = document.getElementById("window-layer");
const taskbarApps = document.getElementById("taskbar-apps");

let zCounter = 10;
const openWindows = {}; // appId -> { win, taskItem }

// Time + date helpers
function formatTime(d) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDateShort(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateLong(d) {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function updateAllClocks() {
  const now = new Date();
  lockTime.textContent = formatTime(now);
  lockDate.textContent = formatDateLong(now);
  trayTime.textContent = formatTime(now);
  trayDate.textContent = formatDateShort(now);
}

setInterval(updateAllClocks, 1000);
updateAllClocks();

// Boot -> lock
setTimeout(() => {
  bootScreen.classList.add("hidden");
  lockScreen.classList.remove("hidden");
}, 2600);

// Lock -> desktop
unlockBtn.addEventListener("click", () => {
  lockScreen.classList.add("hidden");
  osRoot.classList.remove("hidden");
  // Auto-open terminal on the right
  createWindow("terminal", { rightSide: true });
});

// Start menu
startButton.addEventListener("click", (e) => {
  e.stopPropagation();
  startMenu.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.classList.add("hidden");
  }
});

// Apps definition
const apps = {
  about: {
    title: "About Gethin OS",
    createContent() {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>Gethin OS</h3>
        <p style="margin-top:6px;">A Windows-style web OS built by Gethin.</p>
        <p style="margin-top:6px; opacity:0.7;">Version 1.0</p>
      `;
      return div;
    },
  },

  notes: {
    title: "Notes",
    createContent() {
      const textarea = document.createElement("textarea");
      textarea.className = "notes-textarea";
      textarea.placeholder = "Write your notes here...";
      textarea.value = localStorage.getItem("gethin_os_notes") || "";
      textarea.addEventListener("input", () => {
        localStorage.setItem("gethin_os_notes", textarea.value);
      });
      return textarea;
    },
  },

  terminal: {
    title: "Terminal",
    createContent() {
      const root = document.createElement("div");
      root.className = "terminal-root";

      const header = document.createElement("div");
      header.className = "terminal-header";
      header.textContent = "Gethin OS Terminal";

      const output = document.createElement("div");
      output.className = "terminal-output";

      const inputRow = document.createElement("div");
      inputRow.className = "terminal-input-row";

      const prompt = document.createElement("span");
      prompt.className = "terminal-prompt";
      prompt.textContent = "C:\\Users\\gethin>";

      const input = document.createElement("input");
      input.className = "terminal-input";
      input.autocomplete = "off";

      inputRow.appendChild(prompt);
      inputRow.appendChild(input);

      root.appendChild(header);
      root.appendChild(output);
      root.appendChild(inputRow);

      function print(text) {
        output.textContent += text + "\n";
        output.scrollTop = output.scrollHeight;
      }

      const commands = {
        help() {
          print("Commands:");
          print("  help          Show this help");
          print("  apps          List apps");
          print("  open <app>    Open an app");
          print("  clear         Clear the screen");
          print("  about         About this terminal");
        },
        apps() {
          print("Available apps:");
          Object.keys(apps).forEach((a) => print("  " + a));
        },
        clear() {
          output.textContent = "";
        },
        about() {
          print("Gethin OS Terminal v1.0");
        },
        open(arg) {
          if (!arg) {
            print("Usage: open <app>");
            return;
          }
          if (!apps[arg]) {
            print("Unknown app: " + arg);
            return;
          }
          createWindow(arg);
          print("Opened " + arg);
        },
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const text = input.value.trim();
          if (!text) return;
          print(prompt.textContent + " " + text);
          input.value = "";

          const [cmd, ...rest] = text.split(" ");
          const arg = rest.join(" ");

          if (commands[cmd]) {
            commands[cmd](arg);
          } else {
            print("Unknown command. Type 'help'");
          }
        }
      });

      // Focus input when window opens
      setTimeout(() => input.focus(), 50);

      // Initial message
      print("Gethin OS Terminal");
      print("Type 'help' for a list of commands.");
      print("");

      return root;
    },
  },
};

// Window system
function createWindow(appId, options = {}) {
  const app = apps[appId];
  if (!app) return;

  if (openWindows[appId]) {
    focusWindow(appId);
    return;
  }

  const win = document.createElement("div");
  win.className = "window";

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

  // Position
  if (options.rightSide) {
    win.style.left = window.innerWidth - 440 + "px";
    win.style.top = 80 + "px";
  } else {
    win.style.left = 80 + Math.random() * 120 + "px";
    win.style.top = 80 + Math.random() * 80 + "px";
  }
  win.style.zIndex = ++zCounter;

  // Taskbar item
  const taskItem = document.createElement("button");
  taskItem.className = "taskbar-item active";
  taskItem.textContent = app.title;
  taskbarApps.appendChild(taskItem);

  openWindows[appId] = { win, taskItem };

  function focusWindow() {
    win.style.zIndex = ++zCounter;
    document.querySelectorAll(".taskbar-item").forEach((el) =>
      el.classList.remove("active")
    );
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
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = "none";
    focusWindow();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
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

function focusWindow(appId) {
  const entry = openWindows[appId];
  if (!entry) return;
  entry.win.style.zIndex = ++zCounter;
  document.querySelectorAll(".taskbar-item").forEach((el) =>
    el.classList.remove("active")
  );
  entry.taskItem.classList.add("active");
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

// Pinned taskbar icons
document.querySelectorAll(".taskbar-icon.pinned").forEach((btn) => {
  btn.addEventListener("click", () => {
    const appId = btn.dataset.app;
    createWindow(appId);
  });
});
