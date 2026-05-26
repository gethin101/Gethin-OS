const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const windowLayer = document.getElementById("window-layer");
const taskbarApps = document.getElementById("taskbar-apps");

const volumeButton = document.getElementById("volume-button");
const volumePopup = document.getElementById("volume-popup");
const volumeSlider = document.getElementById("volume-slider");
const volumeIcon = document.getElementById("volume-icon");
const volumeIconPopup = document.getElementById("volume-icon-popup");

const wifiButton = document.getElementById("wifi-button");
const wifiPopup = document.getElementById("wifi-popup");

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
  wifiPopup.classList.add("hidden");
  datetimePopup.classList.add("hidden");
};

document.addEventListener("click", () => {
  startMenu.classList.add("hidden");
  volumePopup.classList.add("hidden");
  wifiPopup.classList.add("hidden");
  datetimePopup.classList.add("hidden");
});

/* Stop clicks inside popups from closing everything */
[startMenu, volumePopup, wifiPopup, datetimePopup].forEach(el => {
  el.addEventListener("click", (e) => e.stopPropagation());
});

/* Volume popup + mute logic */
function updateVolumeUI() {
  const isMuted = muted || volumeSlider.value === "0";
  const cls = "tray-icon-muted";
  [volumeIcon, volumeIconPopup].forEach(icon => {
    if (!icon) return;
    if (isMuted) icon.classList.add(cls);
    else icon.classList.remove(cls);
  });
}

volumeButton.onclick = (e) => {
  e.stopPropagation();
  const isHidden = volumePopup.classList.contains("hidden");
  volumePopup.classList.add("hidden");
  wifiPopup.classList.add("hidden");
  datetimePopup.classList.add("hidden");
  if (isHidden) volumePopup.classList.remove("hidden");
};

volumeIconPopup.onclick = () => {
  muted = !muted;
  if (muted) {
    volumeSlider.value = 0;
  } else if (volumeSlider.value === "0") {
    volumeSlider.value = 50;
  }
  updateVolumeUI();
};

volumeSlider.oninput = () => {
  if (volumeSlider.value === "0") {
    muted = true;
  } else {
    muted = false;
  }
  updateVolumeUI();
};

updateVolumeUI();

/* WiFi popup */
wifiButton.onclick = (e) => {
  e.stopPropagation();
  const isHidden = wifiPopup.classList.contains("hidden");
  wifiPopup.classList.add("hidden");
  volumePopup.classList.add("hidden");
  datetimePopup.classList.add("hidden");
  if (isHidden) wifiPopup.classList.remove("hidden");
};

/* Date/time popup */
datetimeButton.onclick = (e) => {
  e.stopPropagation();
  const isHidden = datetimePopup.classList.contains("hidden");
  datetimePopup.classList.add("hidden");
  volumePopup.classList.add("hidden");
  wifiPopup.classList.add("hidden");
  if (isHidden) {
    renderCalendar();
    datetimePopup.classList.remove("hidden");
  }
};

/* File data */
const explorerFiles = [
  { name: "notes.txt", type: "text", folder: "Documents", content: "These are your notes.\nYou can edit them in the Notes app or here." },
  { name: "readme.txt", type: "text", folder: "Documents", content: "Welcome to Gethin OS.\nThis is a fake file explorer." },
  { name: "template1.txt", type: "text", folder: "Documents", content: "Template text file 1." },
  { name: "template2.txt", type: "text", folder: "Downloads", content: "Template text file 2." },
  { name: "wallpaper.jpg", type: "image", folder: "Assets", src: "assets/wallpaper.jpg" },
  { name: "notes.png", type: "image", folder: "Assets", src: "assets/notes.png" },
  { name: "terminal.png", type: "image", folder: "Assets", src: "assets/terminal.png" },
  { name: "explorer.png", type: "image", folder: "Assets", src: "assets/explorer.png" },
  { name: "start.png", type: "image", folder: "Assets", src: "assets/start.png" },
];

/* Apps */
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
        <div class="explorer-nav-item" data-folder="Home">Home</div>
        <div class="explorer-nav-item" data-folder="Desktop">Desktop</div>
        <div class="explorer-nav-item" data-folder="Documents">Documents</div>
        <div class="explorer-nav-item" data-folder="Downloads">Downloads</div>
        <div class="explorer-nav-item" data-folder="Pictures">Pictures</div>
        <div class="explorer-nav-item" data-folder="Assets">Assets</div>
      `;

      const main = document.createElement("div");
      main.className = "explorer-main";

      const header = document.createElement("div");
      header.className = "explorer-header";

      const filesContainer = document.createElement("div");
      filesContainer.className = "explorer-files";

      function renderFolder(folder) {
        header.textContent = folder === "Home" ? "Recent files" : folder;
        filesContainer.innerHTML = "";

        let files;
        if (folder === "Home") {
          files = explorerFiles;
        } else if (folder === "Assets") {
          files = explorerFiles.filter(f => f.folder === "Assets");
        } else {
          files = explorerFiles.filter(f => f.folder === folder);
        }

        if (!files.length && folder !== "Assets") {
          const msg = document.createElement("div");
          msg.textContent = "This folder is empty.";
          filesContainer.appendChild(msg);
          return;
        }

        if (!files.length && folder === "Assets") {
          const msg = document.createElement("div");
          msg.textContent = "No assets found.";
          filesContainer.appendChild(msg);
          return;
        }

        files.forEach(file => {
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
      }

      sidebar.querySelectorAll(".explorer-nav-item").forEach(item => {
        item.addEventListener("click", () => {
          sidebar.querySelectorAll(".explorer-nav-item").forEach(i => i.classList.remove("active"));
          item.classList.add("active");
          renderFolder(item.dataset.folder);
        });
      });

      // default
      sidebar.querySelector('[data-folder="Home"]').classList.add("active");
      renderFolder("Home");

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
    title: "Terminal",
    createContent() {
      const root = document.createElement("div");
      root.className = "terminal-root";

      const titlebar = document.createElement("div");
      titlebar.className = "terminal-titlebar";
      titlebar.textContent = "Terminal";

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

      print("Microsoft Windows [Version 10.0.19045.0000]");
      print("(c) Microsoft Corporation. All rights reserved.");
      print("");
      print("C:\\Users\\user> Type 'help'");

      setTimeout(() => input.focus(), 50);

      return root;
    },
  },
};

/* File viewer (editable text + images) */
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
  content.className = "window-content viewer-content";

  let textarea = null;

  if (file.type === "text") {
    textarea = document.createElement("textarea");
    textarea.className = "viewer-textarea";
    textarea.value = file.content || "";
    content.appendChild(textarea);

    const saveBtn = document.createElement("button");
    saveBtn.className = "popup-button viewer-save";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      file.content = textarea.value;
    });
    content.appendChild(saveBtn);
  } else if (file.type === "image") {
    const img = document.createElement("img");
    img.className = "viewer-image";
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

  min.onclick = () => win.classList.add("hidden");

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

  openWindows[appId] = { win, taskItem, isMax: false, prevPos: {} };

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

  min.onclick = () => win.classList.add("hidden");

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
    win.remove();
    taskItem.remove();
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
  btn.onclick = () => createWindow(btn.dataset.app);
});

/* Auto-open terminal on right */
createWindow("terminal", { right: true });
