import { save, load }                                              from './modules/storage.js';
import { startCountdown }                                          from './modules/countdown.js';
import { renderList, addItem, toggleItem, removeItem,
         reorderItems }                                            from './modules/list.js';
import { initDB, addDocument, getAllDocuments,
         getBlob, deleteDocument, renderDocuments }               from './modules/documents.js';
import {loadTrip, updateTrip} from './modules/trip.js';

// ---- Elements
const addForm          = document.getElementById("add-form");
const itemInput        = document.getElementById("itemInput");
const btnCheckAll      = document.getElementById("btn-check-all");
const btnUncheckAll    = document.getElementById("btn-uncheck-all");
const btnClear         = document.getElementById("btn-clear");
const docForm          = document.getElementById("doc-form");
const docNameInput     = document.getElementById("docName");
const docCategoryInput = document.getElementById("docCategory");
const docFileInput     = document.getElementById("docFile");
const tripForm              = document.getElementById("trip-form");
const tripTitleInput        = document.getElementById("tripTitle");
const tripDestinationInput  = document.getElementById("tripDestination");
const tripStartDateInput    = document.getElementById("tripStartDate");
const tripEndDateInput      = document.getElementById("tripEndDate");
const tripDepartureTimeInput = document.getElementById("tripDepartureTime");
const tripSummary           = document.getElementById("trip-summary");

// ---- State
let tripDate = null;
let items    = [];
let docs     = [];
let currentTrip = loadTrip();

// ---- Countdown sync
function syncCountdown(trip) {
  if (!trip.startDate) return;
  const [year, month, day] = trip.startDate.split('-').map(Number);
  let hours = 0, minutes = 0;
  if (trip.departureTime) {
    const [h, m] = trip.departureTime.split(':').map(Number);
    if (!isNaN(h)) hours = h;
    if (!isNaN(m)) minutes = m;
  }
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (!isNaN(date.getTime())) {
    tripDate = date;
    save(tripDate, items);
    startCountdown(tripDate);
  }
}

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

async function renderDocs() {
  docs = await getAllDocuments();
  renderDocuments(docs, {
    onDownload: async (id) => {
      const blob = await getBlob(id);
      const doc  = docs.find(d => d.id === id);
      if (!blob || !doc) return;

      if (window.AndroidInterface) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          window.AndroidInterface.openFile(base64, doc.mimeType || '', doc.fileName);
        };
        reader.readAsDataURL(blob);
      } else {
        const url = URL.createObjectURL(blob);
        const a   = Object.assign(document.createElement('a'), { href: url, download: doc.fileName });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    onDelete: async (id) => {
      await deleteDocument(id);
      renderDocs();
    },
  });
}

function renderTrip() {
  tripTitleInput.value        = currentTrip.title        || '';
  tripDestinationInput.value  = currentTrip.destination  || '';
  tripStartDateInput.value    = currentTrip.startDate    || '';
  tripEndDateInput.value      = currentTrip.endDate      || '';
  tripDepartureTimeInput.value = currentTrip.departureTime || '';

  if (currentTrip.title || currentTrip.destination) {
    tripSummary.textContent = `${currentTrip.title} · ${currentTrip.destination}`;
  }
}

// ---- Events
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

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

docForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = docFileInput.files[0];
  if (!file) return;
  try {
    const data = await readAsArrayBuffer(file);
    await addDocument({
      id:       `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:     docNameInput.value.trim(),
      category: docCategoryInput.value,
      fileName: file.name,
      mimeType: file.type,
      size:     file.size,
      addedAt:  new Date().toISOString(),
      data,
    });
    docForm.reset();
    await renderDocs();
  } catch (err) {
    alert(`Dokument konnte nicht gespeichert werden: ${err.message}`);
  }
});

tripForm.addEventListener("submit", (e) => {
  e.preventDefault();
  currentTrip = updateTrip({
    title:         tripTitleInput.value.trim(),
    destination:   tripDestinationInput.value.trim(),
    startDate:     tripStartDateInput.value,
    endDate:       tripEndDateInput.value,
    departureTime: tripDepartureTimeInput.value,
  });
  renderTrip();
  syncCountdown(currentTrip);
});

// ---- Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// ---- Init
(async function init() {
  ({ items } = load());
  currentTrip = loadTrip();
  await initDB();

  renderTrip();
  syncCountdown(currentTrip);
  render();
  await renderDocs();
})();
