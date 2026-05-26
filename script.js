const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const windowLayer = document.getElementById("window-layer");
const taskbarApps = document.getElementById("taskbar-apps");
const minimizedArea = document.getElementById("minimized-area");

const volumeButton = document.getElementById("volume-button");
const volumePopup = document.getElementById("volume-popup");
const volumeSlider = document.getElementById("volume-slider");
const volumeIcon = document.getElementById("volume-icon");
const volumeIconPopup = document.getElementById("volume-icon-popup");

const wifiButton = document.getElementById("wifi-button");
const wifiPopup = document.getElementById("wifi-popup");

const batteryButton = document.getElementById("battery-button");
const batteryPopup = document.getElementById("battery-popup");
const batteryStatusMain = document.getElementById("battery-status-main");
const batteryStatusSub = document.getElementById("battery-status-sub");

const datetimeButton = document.getElementById("datetime-button");
const datetimePopup = document.getElementById("datetime-popup");
const trayTime = document.getElementById("tray-time");
const trayDate = document.getElementById("tray-date");
const popupDateTitle = document.getElementById("popup-date-title");
const calendarGrid = document.getElementById("calendar-grid");

let z = 10;
const openWindows = {};
let muted = false;

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

    img.src = file.src;
    content.appendChild(img);
  }

  win.appendChild(header);
  win.appendChild(content);
  windowLayer.appendChild(win);

  win.style.left = "140px";
  win.style.top = "120px";
  win.style.zIndex = ++z;

  let isMax = false;
  const prevPos = { left: 0, top: 0, width: 0, height: 0 };
  let pill = null;

  function focusWin() {
    win.style.zIndex = ++z;
  }

  win.addEventListener("mousedown", focusWin);

  let drag = false, dx = 0, dy = 0;
  header.addEventListener("mousedown", (e) => {
    if (isMax) return;
    drag = true;
    dx = e.clientX - win.offsetLeft;
    dy = e.clientY - win.offsetTop;
  });
  document.addEventListener("mousemove", (e) => {
    if (!drag) return;
    win.style.left = e.clientX - dx + "px";
    win.style.top = e.clientY - dy + "px";
  });
  document.addEventListener("mouseup", () => drag = false);

  min.onclick = () => {
    win.style.display = "none";
    if (!pill) {
      pill = createMinimizedPill(
        "viewer-" + file.name,
        file.name,
        file.type === "image" ? file.src : null,
        () => {
          win.style.display = "";
          focusWin();
          pill = null;
        }
      );
    }
  };

  max.onclick = () => {
    if (!isMax) {
      prevPos.left = win.offsetLeft;
      prevPos.top = win.offsetTop;
      prevPos.width = win.offsetWidth;
      prevPos.height = win.offsetHeight;
      win.style.left = "0px";
      win.style.top = "0px";
      win.style.width = window.innerWidth + "px";
      win.style.height = (window.innerHeight - 52) + "px";
      isMax = true;
    } else {
      win.style.left = prevPos.left + "px";
      win.style.top = prevPos.top + "px";
      win.style.width = prevPos.width + "px";
      win.style.height = prevPos.height + "px";
      isMax = false;
    }
  };

  close.onclick = () => {
    win.remove();
    if (pill) pill.remove();
  };
}

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
  min.textContent = "–";

  const max = document.createElement("button");
  max.className = "window-btn max";
  max.textContent = "□";

  const close = document.createElement("button");
  close.className = "window-btn close";
  close.textContent = "X";

  controls.appendChild(min);
  controls.appendChild(max);
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

  openWindows[appId] = {
    win,
    taskItem,
    isMax: false,
    prevPos: {},
    pill: null,
  };

  function focusThis() {
    win.style.zIndex = ++z;
    document.querySelectorAll(".taskbar-item").forEach((i) =>
      i.classList.remove("active")
    );
    taskItem.classList.add("active");
  }

  win.addEventListener("mousedown", focusThis);
  taskItem.addEventListener("click", focusThis);

  let drag = false, dx = 0, dy = 0;

  header.addEventListener("mousedown", (e) => {
    if (openWindows[appId].isMax) return;
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

  min.onclick = () => {
    win.style.display = "none";
    const entry = openWindows[appId];
    if (!entry.pill) {
      entry.pill = createMinimizedPill(
        appId,
        app.title,
        app.icon,
        () => {
          win.style.display = "";
          focusThis();
          entry.pill = null;
        }
      );
    }
  };

  max.onclick = () => {
    const entry = openWindows[appId];
    if (!entry.isMax) {
      entry.prevPos = {
        left: win.offsetLeft,
        top: win.offsetTop,
        width: win.offsetWidth,
        height: win.offsetHeight,
      };
      win.style.left = "0px";
      win.style.top = "0px";
      win.style.width = window.innerWidth + "px";
      win.style.height = (window.innerHeight - 52) + "px";
      entry.isMax = true;
    } else {
      win.style.left = entry.prevPos.left + "px";
      win.style.top = entry.prevPos.top + "px";
      win.style.width = entry.prevPos.width + "px";
      win.style.height = entry.prevPos.height + "px";
      entry.isMax = false;
    }
  };

  close.onclick = () => {
    const entry = openWindows[appId];
    win.remove();
    taskItem.remove();
    if (entry.pill) entry.pill.remove();
    delete openWindows[appId];
  };

  focusThis();
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

/* Desktop icons (double-click like Windows) */
document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("dblclick", () => createWindow(icon.dataset.app));
});

/* Start menu apps (single click) */
document.querySelectorAll(".start-app").forEach((btn) => {
  btn.onclick = () => {
    createWindow(btn.dataset.app);
    startMenu.classList.add("hidden");
  };
});

/* Pinned apps (single click) */
document.querySelectorAll(".pinned").forEach((btn) => {
  btn.onclick = () => createWindow(btn.dataset.app));
});

/* Auto-open terminal on right */
createWindow("terminal", { right: true });








