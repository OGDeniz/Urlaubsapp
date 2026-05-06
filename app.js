import { save, load }                                              from './modules/storage.js';
import { startCountdown }                                          from './modules/countdown.js';
import { renderList, addItem, toggleItem, removeItem,
         reorderItems }                                            from './modules/list.js';

// ---- Elements
const tripDateInput = document.getElementById("tripDate");
const tripTimeInput = document.getElementById("tripTime");
const dateForm      = document.getElementById("date-form");
const addForm       = document.getElementById("add-form");
const itemInput     = document.getElementById("itemInput");
const btnCheckAll   = document.getElementById("btn-check-all");
const btnUncheckAll = document.getElementById("btn-uncheck-all");
const btnClear      = document.getElementById("btn-clear");

// ---- State
let tripDate = null;
let items    = [];

// ---- Render
function render() {
  renderList(items, {
    onToggle: (id) => {
      items = toggleItem(items, id);
      save(tripDate, items);
      render();
    },
    onRemove: (id) => {
      items = removeItem(items, id);
      save(tripDate, items);
      render();
    },
    onReorder: (sourceId, targetId, placeAfter) => {
      items = reorderItems(items, sourceId, targetId, placeAfter);
      save(tripDate, items);
      render();
    },
  });
}

// ---- Events
dateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = tripDateInput.value;
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
  save(tripDate, items);
  startCountdown(tripDate);
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  items = addItem(items, itemInput.value);
  save(tripDate, items);
  render();
  itemInput.value = "";
  itemInput.focus();
});

btnCheckAll.addEventListener("click", () => {
  items = items.map((it) => ({ ...it, done: true }));
  save(tripDate, items);
  render();
});

btnUncheckAll.addEventListener("click", () => {
  items = items.map((it) => ({ ...it, done: false }));
  save(tripDate, items);
  render();
});

btnClear.addEventListener("click", () => {
  if (confirm("Liste wirklich leeren?")) {
    items = [];
    save(tripDate, items);
    render();
  }
});

// ---- Init
(function init() {
  ({ tripDate, items } = load());

  if (tripDate instanceof Date && !isNaN(tripDate)) {
    const yyyy = tripDate.getFullYear();
    const mm   = String(tripDate.getMonth() + 1).padStart(2, "0");
    const dd   = String(tripDate.getDate()).padStart(2, "0");
    tripDateInput.value = `${yyyy}-${mm}-${dd}`;
    if (tripTimeInput) {
      const hh   = String(tripDate.getHours()).padStart(2, "0");
      const mins = String(tripDate.getMinutes()).padStart(2, "0");
      tripTimeInput.value = `${hh}:${mins}`;
    }
    startCountdown(tripDate);
  } else if (tripTimeInput) {
    tripTimeInput.value = "";
  }

  render();
})();
