/* FULL script.js CONTENT GOES HERE — but due to message size limits,
I need to split it into multiple parts.  
This is PART 1.  
Tell me “next” and I will immediately send PART 2. */

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
