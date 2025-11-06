// ---- LocalStorage Keys
const LS_KEYS = {
  tripDate: "ua_trip_date",
  items: "ua_pack_items",
};

// ---- Elements
const tripDateInput = document.getElementById("tripDate");
const tripTimeInput = document.getElementById("tripTime");
const dateForm = document.getElementById("date-form");
const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMins = document.getElementById("cd-mins");
const cdSecs = document.getElementById("cd-secs");
const countdownNote = document.getElementById("countdown-note");

const addForm = document.getElementById("add-form");
const itemInput = document.getElementById("itemInput");
const listEl = document.getElementById("list");

const btnCheckAll = document.getElementById("btn-check-all");
const btnUncheckAll = document.getElementById("btn-uncheck-all");
const btnClear = document.getElementById("btn-clear");

// ---- State
let tripDate = null; // Date or null
let items = [];      // [{id, text, done}]
let dragSourceId = null;

// ---- Utils
const save = () => {
  if (tripDate instanceof Date) {
    localStorage.setItem(LS_KEYS.tripDate, tripDate.toISOString());
  }
  localStorage.setItem(LS_KEYS.items, JSON.stringify(items));
};

const load = () => {
  const d = localStorage.getItem(LS_KEYS.tripDate);
  if (d) tripDate = new Date(d);

  const raw = localStorage.getItem(LS_KEYS.items);
  items = raw ? JSON.parse(raw) : [];
};

const pad = (n) => String(n).padStart(2, "0");

// ---- Countdown
let timer = null;

function startCountdown() {
  if (!(tripDate instanceof Date)) return;
  if (timer) clearInterval(timer);

  function tick() {
    const now = new Date();
    const diff = tripDate - now;

    if (isNaN(diff)) return;

    if (diff <= 0) {
      cdDays.textContent = "00";
      cdHours.textContent = "00";
      cdMins.textContent = "00";
      cdSecs.textContent = "00";
      countdownNote.textContent = "Gute Reise! ✈️";
      clearInterval(timer);
      return;
    }

    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent = pad(mins);
    cdSecs.textContent = pad(secs);

    const dStr = tripDate.toLocaleDateString("de-DE", {
      year: "numeric", month: "2-digit", day: "2-digit"
    });
    const tStr = tripDate.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    countdownNote.textContent = `Abreise am ${dStr} um ${tStr} Uhr`;
  }

  tick();
  timer = setInterval(tick, 1000);
}

// ---- Drag & Drop Helpers for Packliste
function clearDropIndicators() {
  listEl.querySelectorAll('.drop-before, .drop-after').forEach((el) => {
    el.classList.remove('drop-before', 'drop-after');
  });
}

function reorderItems(sourceId, targetId, placeAfter) {
  const sourceIndex = items.findIndex((it) => it.id === sourceId);
  const targetIndex = items.findIndex((it) => it.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return;
  if (sourceIndex === targetIndex) return;

  const [moved] = items.splice(sourceIndex, 1);
  let insertIndex = targetIndex;
  if (sourceIndex < targetIndex) insertIndex -= 1;
  if (placeAfter) insertIndex += 1;
  if (insertIndex < 0) insertIndex = 0;
  if (insertIndex > items.length) {
    items.push(moved);
  } else {
    items.splice(insertIndex, 0, moved);
  }
  save();
  renderList();
}

function handleItemDragOver(event, targetId, li) {
  if (!dragSourceId || dragSourceId === targetId) return;
  event.preventDefault();
  const rect = li.getBoundingClientRect();
  const isAfter = event.clientY > rect.top + rect.height / 2;
  clearDropIndicators();
  li.classList.add(isAfter ? 'drop-after' : 'drop-before');
}

function handleItemDrop(event, targetId, li) {
  event.preventDefault();
  const sourceId = event.dataTransfer?.getData('text/plain') || dragSourceId;
  if (!sourceId || sourceId === targetId) {
    clearDropIndicators();
    return;
  }
  const rect = li.getBoundingClientRect();
  const placeAfter = event.clientY > rect.top + rect.height / 2;
  clearDropIndicators();
  dragSourceId = null;
  reorderItems(sourceId, targetId, placeAfter);
}

// ---- Packliste rendern
function renderList() {
  listEl.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "item";
    li.textContent = "Noch leer – füge etwas hinzu!";
    listEl.appendChild(li);
    return;
  }

  items.forEach((it) => {
    const li = document.createElement("li");
    li.className = "item" + (it.done ? " completed" : "");
    li.dataset.id = it.id;

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "drag-handle";
    handle.setAttribute("aria-label", `Verschiebe ${it.text}`);
    handle.innerHTML = '<span aria-hidden="true">&#9776;</span><span class="sr-only">Verschieben</span>';

    const label = document.createElement("label");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = it.done;
    cb.addEventListener("change", () => toggleItem(it.id));

    const txt = document.createElement("span");
    txt.textContent = it.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.setAttribute("aria-label", `Lösche ${it.text}`);
    del.innerHTML = '<span aria-hidden="true">&#128465;</span><span class="sr-only">Löschen</span>';
    del.addEventListener("click", () => removeItem(it.id));

    label.appendChild(cb);
    label.appendChild(txt);
    li.appendChild(handle);
    li.appendChild(label);
    li.appendChild(del);

    li.draggable = true;
    li.addEventListener('dragstart', (ev) => {
      dragSourceId = it.id;
      li.classList.add('dragging');
      if (ev.dataTransfer) {
        ev.dataTransfer.effectAllowed = 'move';
        ev.dataTransfer.setData('text/plain', it.id);
      }
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      clearDropIndicators();
      dragSourceId = null;
    });
    li.addEventListener('dragover', (ev) => handleItemDragOver(ev, it.id, li));
    li.addEventListener('dragleave', () => {
      li.classList.remove('drop-before', 'drop-after');
    });
    li.addEventListener('drop', (ev) => handleItemDrop(ev, it.id, li));

    listEl.appendChild(li);
  });
}

function addItem(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  items.push({ id: crypto.randomUUID(), text: trimmed, done: false });
  save();
  renderList();
}

function toggleItem(id) {
  items = items.map((it) => it.id === id ? { ...it, done: !it.done } : it);
  save();
  renderList();
}

function removeItem(id) {
  items = items.filter((it) => it.id !== id);
  save();
  renderList();
}

// ---- Events
dateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = tripDateInput.value; // yyyy-mm-dd
  if (!v) return;

  const timeValue = tripTimeInput ? tripTimeInput.value : "";
  const [year, month, day] = v.split("-").map(Number);
  if (!year || !month || !day) return;

  let hours = 0;
  let minutes = 0;
  if (timeValue) {
    const [h, m] = timeValue.split(":");
    const parsedH = Number(h);
    const parsedM = Number(m);
    if (!Number.isNaN(parsedH)) hours = parsedH;
    if (!Number.isNaN(parsedM)) minutes = parsedM;
  }

  const selected = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (isNaN(selected.getTime())) return;

  tripDate = selected;
  save();
  startCountdown();
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addItem(itemInput.value);
  itemInput.value = "";
  itemInput.focus();
});

btnCheckAll.addEventListener("click", () => {
  items = items.map((it) => ({ ...it, done: true }));
  save(); renderList();
});

btnUncheckAll.addEventListener("click", () => {
  items = items.map((it) => ({ ...it, done: false }));
  save(); renderList();
});

btnClear.addEventListener("click", () => {
  if (confirm("Liste wirklich leeren?")) {
    items = [];
    save(); renderList();
  }
});

// ---- Init
(function init(){
  load();

  // Prefill date input falls gespeichert
  if (tripDate instanceof Date && !isNaN(tripDate)) {
    const yyyy = tripDate.getFullYear();
    const mm = String(tripDate.getMonth() + 1).padStart(2, "0");
    const dd = String(tripDate.getDate()).padStart(2, "0");
    tripDateInput.value = `${yyyy}-${mm}-${dd}`;
    if (tripTimeInput) {
      const hh = String(tripDate.getHours()).padStart(2, "0");
      const mins = String(tripDate.getMinutes()).padStart(2, "0");
      tripTimeInput.value = `${hh}:${mins}`;
    }
    startCountdown();
  } else if (tripTimeInput) {
    tripTimeInput.value = "";
  }

  renderList();
})();