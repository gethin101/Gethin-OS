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

/* Apps */
const explorerFiles = [
  { name: "notes.txt", type: "text", content: "These are your notes.\nYou can edit them in the Notes app." },
  { name: "readme.txt", type: "text", content: "Welcome to Gethin OS.\nThis is a fake file explorer." },
  { name: "wallpaper.jpg", type: "image", src: "assets/wallpaper.jpg" },
  { name: "notes.png", type: "image", src: "assets/notes.png" },
  { name: "terminal.png", type: "image", src: "assets/terminal.png" },
  { name: "explorer.png", type: "image", src: "assets/explorer.png" },
  { name: "start.png", type: "image", src: "assets/start.png" },
  { name: "template1.txt", type: "text", content: "Template text file 1." },
  { name: "template2.txt", type: "text", content: "Template text file 2." },
  { name: "photo1.jpg", type: "image", src: "assets/wallpaper.jpg" },
];

const apps = {
  explorer: {
    title: "File Explorer",
    createContent() {
      const root = document.createElement("div");
      root.className = "explorer-root";

      const sidebar = document.createElement("div");
      sidebar.className = "explorer-sidebar";
      sidebar.innerHTML = `
        <h4>Home</h4>
        <div class="explorer-nav-item">Desktop</div>
        <div class="explorer-nav-item">Downloads</div>
        <div class="explorer-nav-item">Documents</div>
        <div class="explorer-nav-item">Pictures</div>
        <div class="explorer-nav-item">Music</div>
      `;

      const main = document.createElement("div");
      main.className = "explorer-main";

      const header = document.createElement("div");
      header.className = "explorer-header";
      header.textContent = "Recent files";

      const filesContainer = document.createElement("div");
      filesContainer.className = "explorer-files";

      explorerFiles.forEach(file => {
        const row = document.createElement("div");
        row.className = "explorer-file-row";

        const name = document.createElement("div");
        name.className = "explorer-file-name";
        name.textContent = file.name;

        const type = document.createElement("div");
        type.className = "explorer-file-type";
        type.textContent = file.type === "text" ? "Text" : "Image";

        row.appendChild(name);
        row.appendChild(type);

        row.addEventListener("click", () => openFileViewer(file));

        filesContainer.appendChild(row);
      });

      main.appendChild(header);
      main.appendChild(filesContainer);

      root.appendChild(sidebar);
      root.appendChild(main);

      return root;
    },
  },

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
    title: "Windows PowerShell",
    createContent() {
      const root = document.createElement("div");
      root.className = "terminal-root";

      const titlebar = document.createElement("div");
      titlebar.className = "terminal-titlebar";
      titlebar.textContent = "Windows PowerShell";

      const output = document.createElement("div");
      output.className = "terminal-output";

      const row = document.createElement("div");
      row.className = "terminal-input-row";

      const prompt = document.createElement("span");
      prompt.className = "terminal-prompt";
      prompt.textContent = "C:\\Users\\user>";

      const input = document.createElement("input");
      input.className = "terminal-input";

      row.appendChild(prompt);
      row.appendChild(input);

      root.appendChild(titlebar);
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

      print("Windows PowerShell");
      print("(Fake) Gethin OS shell");
      print("Type 'help'");

      setTimeout(() => input.focus(), 50);

      return root;
    },
  },
};

/* File viewer (separate window) */
function openFileViewer(file) {
  const win = document.createElement("div");
  win.className = "window";

  const header = document.createElement("div");
  header.className = "window-header";

  const title = document.createElement("div");
  title.className = "window-header-title";
  title.textContent = file.name;

  const controls = document.createElement("div");
  controls.className = "window-controls";

  const close = document.createElement("button");
  close.className = "window-btn close";

  controls.appendChild(close);
  header.appendChild(title);
  header.appendChild(controls);

  const content = document.createElement("div");
  content.className = "window-content viewer-content";

  if (file.type === "text") {
    const pre = document.createElement("div");
    pre.className = "viewer-text";
    pre.textContent = file.content || "";
    content.appendChild(pre);
  } else if (file.type === "image") {
    const img = document.createElement("img");
    img.className = "viewer-image";
    img.src = file.src;
    content.appendChild(img);
  }

  win.appendChild(header);
  win.appendChild(content);
  windowLayer.appendChild(win);

  win.style.left = "120px";
  win.style.top = "120px";
  win.style.zIndex = ++z;

  function focus() {
    win.style.zIndex = ++z;
  }

  win.addEventListener("mousedown", focus);

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
  document.addEventListener("mouseup", () => drag = false);

  close.onclick = () => win.remove();
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

  min.onclick = () => win.classList.add("hidden");

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
