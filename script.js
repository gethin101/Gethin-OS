// Boot + Lock Screen
const boot = document.getElementById("boot-screen");
const lock = document.getElementById("lock-screen");
const os = document.getElementById("os");

setTimeout(() => {
  boot.classList.add("hidden");
  lock.classList.remove("hidden");
}, 2600);

document.getElementById("unlock-btn").onclick = () => {
  lock.classList.add("hidden");
  os.classList.remove("hidden");
};

// Lock screen clock
function updateLockTime() {
  const t = new Date();
  document.getElementById("lock-time").textContent =
    t.getHours().toString().padStart(2, "0") + ":" +
    t.getMinutes().toString().padStart(2, "0");
}
setInterval(updateLockTime, 1000);
updateLockTime();

// Taskbar clock
function updateClock() {
  const t = new Date();
  document.getElementById("taskbar-clock").textContent =
    t.getHours().toString().padStart(2, "0") + ":" +
    t.getMinutes().toString().padStart(2, "0");
}
setInterval(updateClock, 1000);
updateClock();

// Start Menu
const startBtn = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");

startBtn.onclick = () => startMenu.classList.toggle("hidden");

document.addEventListener("click", (e) => {
  if (!startMenu.contains(e.target) && e.target !== startBtn) {
    startMenu.classList.add("hidden");
  }
});

// Window System
const windowLayer = document.getElementById("window-layer");
const taskbarApps = document.getElementById("taskbar-apps");
let z = 10;
const openWindows = {};

function createWindow(appId) {
  const app = apps[appId];
  if (!app) return;

  if (openWindows[appId]) {
    focusWindow(appId);
    return;
  }

  const win = document.createElement("div");
  win.className = "window";
  win.style.left = 100 + Math.random() * 100 + "px";
  win.style.top = 100 + Math.random() * 100 + "px";
  win.style.zIndex = ++z;

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

  const taskItem = document.createElement("button");
  taskItem.className = "taskbar-item active";
  taskItem.textContent = app.title;
  taskbarApps.appendChild(taskItem);

  openWindows[appId] = { win, taskItem };

  function focusWindow() {
    win.style.zIndex = ++z;
    document.querySelectorAll(".taskbar-item").forEach(i => i.classList.remove("active"));
    taskItem.classList.add("active");
  }

  win.addEventListener("mousedown", focusWindow);
  taskItem.addEventListener("click", focusWindow);

  // Dragging
  let dragging = false, dx = 0, dy = 0;

  header.addEventListener("mousedown", (e) => {
    dragging = true;
    dx = e.clientX - win.offsetLeft;
    dy = e.clientY - win.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = e.clientX - dx + "px";
    win.style.top = e.clientY - dy + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    document.body.style.userSelect = "";
  });

  // Minimize
  min.onclick = () => win.classList.add("hidden");

  // Close
  close.onclick = () => {
    win.remove();
    taskItem.remove();
    delete openWindows[appId];
  };

  focusWindow();
}

// Apps
const apps = {
  about: {
    title: "About Gethin OS",
    createContent() {
      const d = document.createElement("div");
      d.innerHTML = `
        <h3>Gethin OS</h3>
        <p>A web‑based OS built by Gethin.</p>
        <p>Version 1.0</p>
      `;
      return d;
    }
  },

  notes: {
    title: "Notes",
    createContent() {
      const t = document.createElement("textarea");
      t.className = "notes-textarea";
      t.value = localStorage.getItem("notes") || "";
      t.oninput = () => localStorage.setItem("notes", t.value);
      return t;
    }
  },

  terminal: {
    title: "Terminal",
    createContent() {
      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.flexDirection = "column";
      wrap.style.height = "100%";

      const out = document.createElement("div");
      out.style.flex = "1";
      out.style.overflowY = "auto";
      out.style.fontFamily = "monospace";
      out.style.whiteSpace = "pre-wrap";

      const input = document.createElement("input");
      input.style.padding = "6px";
      input.style.background = "#0f172a";
      input.style.border = "1px solid #334155";
      input.style.color = "white";
      input.style.borderRadius = "6px";
      input.placeholder = "Type a command...";

      function print(t) {
        out.textContent += t + "\n";
        out.scrollTop = out.scrollHeight;
      }

      const commands = {
        help() {
          print("Commands:\nhelp\napps\nopen <app>\nclear\nabout");
        },
        apps() {
          print("Apps:\n" + Object.keys(apps).join("\n"));
        },
        clear() {
          out.textContent = "";
        },
        about() {
          print("Gethin OS Terminal v1.0");
        },
        open(app) {
          if (!apps[app]) return print("Unknown app: " + app);
          createWindow(app);
          print("Opened " + app);
        }
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const text = input.value.trim();
          input.value = "";
          print("> " + text);

          const [cmd, arg] = text.split(" ");

          if (commands[cmd]) commands[cmd](arg);
          else print("Unknown command. Type 'help'");
        }
      });

      wrap.appendChild(out);
      wrap.appendChild(input);
      return wrap;
    }
  }
};

// Desktop icons
document.querySelectorAll(".desktop-icon").forEach(icon => {
  icon.addEventListener("dblclick", () => createWindow(icon.dataset.app));
});

// Start menu apps
document.querySelectorAll(".start-app").forEach(btn => {
  btn.onclick = () => {
    createWindow(btn.dataset.app);
    startMenu.classList.add("hidden");
  };
});
