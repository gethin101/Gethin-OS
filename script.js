const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const windowLayer = document.getElementById("window-layer");
const taskbarApps = document.getElementById("taskbar-apps");

const volumeButton = document.getElementById("volume-button");
const volumePopup = document.getElementById("volume-popup");
const muteButton = document.getElementById("mute-button");
const volumeSlider = document.getElementById("volume-slider");

const datetimeButton = document.getElementById("datetime-button");
const datetimePopup = document.getElementById("datetime-popup");
const trayTime = document.getElementById("tray-time");
const trayDate = document.getElementById("tray-date");
const popupDateTitle = document.getElementById("popup-date-title");
const calendarGrid = document.getElementById("calendar-grid");
const focusDurationEl = document.getElementById("focus-duration");

let z = 10;
const openWindows = {};
let muted = false;
let focusMinutes = 30;

/* Clock + date */
function updateClock() {
  const now = new Date();
  trayTime.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  trayDate.textContent = now.toLocaleDateString();
}
setInterval(updateClock, 1000);
updateClock();

/* Calendar rendering */
function renderCalendar() {
  const now = new Date();
  popupDateTitle.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  calendarGrid.innerHTML = "";

  const headers = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  headers.forEach(h => {
    const el = document.createElement("div");
    el.className = "calendar-day header";
    el.textContent = h;
    calendarGrid.appendChild(el);
  });

  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    calendarGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement("div");
    el.className = "calendar-day";
    el.textContent = d;
    if (d === now.getDate()) el.classList.add("today");
    calendarGrid.appendChild(el);
  }
}

/* Start menu */
startButton.onclick = (e) => {
  e.stopPropagation();
  startMenu.classList.toggle("hidden");
  volumePopup.classList.add("hidden");
  datetimePopup.classList.add("hidden");
};

document.addEventListener("click", () => {
  startMenu.classList.add("hidden");
  volumePopup.classList.add("hidden");
  datetimePopup.classList.add("hidden");
});

/* Stop clicks inside popups from closing everything */
[startMenu, volumePopup, datetimePopup].forEach(el => {
  el.addEventListener("click", (e) => e.stopPropagation());
});

/* Volume popup */
volumeButton.onclick = (e) => {
  e.stopPropagation();
  const isHidden = volumePopup.classList.contains("hidden");
  volumePopup.classList.add("hidden");
  datetimePopup.classList.add("hidden");
  if (isHidden) volumePopup.classList.remove("hidden");
};

muteButton.onclick = () => {
  muted = !muted;
  muteButton.textContent = muted ? "Unmute" : "Mute";
};

volumeSlider.oninput = () => {
  if (volumeSlider.value === "0") {
    muted = true;
    muteButton.textContent = "Unmute";
  } else if (muted) {
    muted = false;
    muteButton.textContent = "Mute";
  }
};

/* Date/time popup */
datetimeButton.onclick = (e) => {
  e.stopPropagation();
  const isHidden = datetimePopup.classList.contains("hidden");
  datetimePopup.classList.add("hidden");
  volumePopup.classList.add("hidden");
  if (isHidden) {
    renderCalendar();
    datetimePopup.classList.remove("hidden");
  }
};

/* Focus controls */
document.querySelector(".focus-minus").onclick = (e) => {
  e.stopPropagation();
  focusMinutes = Math.max(5, focusMinutes - 5);
  focusDurationEl.textContent = `${focusMinutes} mins`;
};

document.querySelector(".focus-plus").onclick = (e) => {
  e.stopPropagation();
  focusMinutes = Math.min(180, focusMinutes + 5);
  focusDurationEl.textContent = `${focusMinutes} mins`;
};

/* Apps */
const apps = {
  notes: {
    title: "Notes",
    createContent() {
      const t = document.createElement("textarea");
      t.className = "notes-textarea";
      t.value = localStorage.getItem("notes") || "";
      t.oninput = () => localStorage.setItem("notes", t.value);
      return t;
    },
  },

  terminal: {
    title: "Terminal",
    createContent() {
      const root = document.createElement("div");
      root.className = "terminal-root";

      const output = document.createElement("div");
      output.className = "terminal-output";

      const row = document.createElement("div");
      row.className = "terminal-input-row";

      const prompt = document.createElement("span");
      prompt.className = "terminal-prompt";
      prompt.textContent = "C:\\Gethin>";

      const input = document.createElement("input");
      input.className = "terminal-input";

      row.appendChild(prompt);
      row.appendChild(input);

      root.appendChild(output);
      root.appendChild(row);

      function print(t) {
        output.textContent += t + "\n";
        output.scrollTop = output.scrollHeight;
      }

      const commands = {
        help() {
          print("help, apps, open <app>, clear");
        },
        apps() {
          print(Object.keys(apps).join("\n"));
        },
        clear() {
          output.textContent = "";
        },
        open(app) {
          if (!apps[app]) return print("Unknown app");
          createWindow(app);
        },
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const text = input.value.trim();
          input.value = "";
          print(prompt.textContent + " " + text);

          const [cmd, arg] = text.split(" ");
          if (commands[cmd]) commands[cmd](arg);
          else print("Unknown command");
        }
      });

      print("Gethin OS Terminal");
      print("Type 'help'");

      return root;
    },
  },
};

/* Window system */
function createWindow(appId, opts = {}) {
  const app = apps[appId];
  if (!app) return;

  if (openWindows[appId]) {
    focus(appId);
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

  const min = document.createElement("button");
  min.className = "window-btn min";

  const close = document.createElement("button");
  close.className = "window-btn close";

  controls.appendChild(min);
  controls.appendChild(close);

  header.appendChild(title);
  header.appendChild(controls);

  const content = document.createElement("div");
  content.className = "window-content";
  content.appendChild(app.createContent());

  win.appendChild(header);
  win.appendChild(content);
  windowLayer.appendChild(win);

  win.style.left = opts.right ? window.innerWidth - 440 + "px" : "80px";
  win.style.top = "80px";
  win.style.zIndex = ++z;

  const taskItem = document.createElement("button");
  taskItem.className = "taskbar-item";
  taskItem.textContent = app.title;
  taskbarApps.appendChild(taskItem);

  openWindows[appId] = { win, taskItem };

  function focus() {
    win.style.zIndex = ++z;
    document.querySelectorAll(".taskbar-item").forEach((i) =>
      i.classList.remove("active")
    );
    taskItem.classList.add("active");
  }

  win.addEventListener("mousedown", focus);
  taskItem.addEventListener("click", focus);

  /* Dragging */
  let drag = false, dx = 0, dy = 0;

  header.addEventListener("mousedown", (e) => {
    drag = true;
    dx = e.clientX - win.offsetLeft;
    dy = e.clientY - win.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!drag) return;
    win.style.left = e.clientX - dx + "px";
    win.style.top = e.clientY - dy + "px";
  });

  document.addEventListener("mouseup", () => (drag = false));

  /* Minimize */
  min.onclick = () => win.classList.add("hidden");

  /* Close */
  close.onclick = () => {
    win.remove();
    taskItem.remove();
    delete openWindows[appId];
  };

  focus();
}

function focus(appId) {
  const entry = openWindows[appId];
  if (!entry) return;
  entry.win.style.zIndex = ++z;
  document.querySelectorAll(".taskbar-item").forEach((i) =>
    i.classList.remove("active")
  );
  entry.taskItem.classList.add("active");
}

/* Desktop icons */
document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("dblclick", () => createWindow(icon.dataset.app));
});

/* Start menu apps */
document.querySelectorAll(".start-app").forEach((btn) => {
  btn.onclick = () => {
    createWindow(btn.dataset.app);
    startMenu.classList.add("hidden");
  };
});

/* Pinned apps */
document.querySelectorAll(".pinned").forEach((btn) => {
  btn.onclick = () => createWindow(btn.dataset.app);
});

/* Auto-open terminal on right */
createWindow("terminal", { right: true });
