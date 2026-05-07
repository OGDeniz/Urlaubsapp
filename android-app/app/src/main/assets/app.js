import { save, load }                                              from './modules/storage.js';
import { startCountdown }                                          from './modules/countdown.js';
import { renderList, addItem, toggleItem, removeItem,
         reorderItems }                                            from './modules/list.js';
import { initDB, addDocument, getAllDocuments,
         getBlob, deleteDocument, renderDocuments }               from './modules/documents.js';
import { loadTrip, updateTrip }                                   from './modules/trip.js';
import { Accommodation }                                          from './modules/accomodation.js';
import { initMap, showAccommodationOnMap, geocodeAddress, showPlaceOnMap } from './modules/maps.js';
import { fetchPlaces, renderPlaces, CATEGORIES }                           from './modules/places.js';


// ---- Elements
const addForm               = document.getElementById("add-form");
const itemInput             = document.getElementById("itemInput");
const btnCheckAll           = document.getElementById("btn-check-all");
const btnUncheckAll         = document.getElementById("btn-uncheck-all");
const btnClear              = document.getElementById("btn-clear");
const docForm               = document.getElementById("doc-form");
const docNameInput          = document.getElementById("docName");
const docCategoryInput      = document.getElementById("docCategory");
const docFileInput          = document.getElementById("docFile");
const tripForm              = document.getElementById("trip-form");
const tripTitleInput        = document.getElementById("tripTitle");
const tripDestinationInput  = document.getElementById("tripDestination");
const tripStartDateInput    = document.getElementById("tripStartDate");
const tripEndDateInput      = document.getElementById("tripEndDate");
const tripDepartureTimeInput = document.getElementById("tripDepartureTime");
const tripSummary           = document.getElementById("trip-summary");
const accommodationForm      = document.getElementById("accommodation-form");
const accommodationNameInput = document.getElementById("accommodationName");
const accommodationTypeInput = document.getElementById("accommodationType");
const accommodationAddressInput = document.getElementById("accommodationAddress");
const accommodationCheckInInput = document.getElementById("accommodationCheckIn");
const accommodationCheckOutInput = document.getElementById("accommodationCheckOut");
const accommodationSummary = document.getElementById("accommodation-summary");

// ---- State
let items       = [];
let docs        = [];
let currentTrip = loadTrip();
let currentAccommodation = null;

// ---- Countdown (einzige Quelle: trip.js)
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
  if (!isNaN(date.getTime())) startCountdown(date);
}

// ---- Render
function render() {
  renderList(items, {
    onToggle: (id) => {
      items = toggleItem(items, id);
      save(items);
      render();
    },
    onRemove: (id) => {
      items = removeItem(items, id);
      save(items);
      render();
    },
    onReorder: (sourceId, targetId, placeAfter) => {
      items = reorderItems(items, sourceId, targetId, placeAfter);
      save(items);
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
  tripTitleInput.value         = currentTrip.title         || '';
  tripDestinationInput.value   = currentTrip.destination   || '';
  tripStartDateInput.value     = currentTrip.startDate     || '';
  tripEndDateInput.value       = currentTrip.endDate       || '';
  tripDepartureTimeInput.value = currentTrip.departureTime || '';

  if (currentTrip.title || currentTrip.destination) {
    tripSummary.textContent = `${currentTrip.title} · ${currentTrip.destination}`;
  }
}

function renderAccommodation() {
  if (!currentTrip.accommodation) return;

  const acc = currentTrip.accommodation;

  accommodationNameInput.value = acc.name || '';
  accommodationTypeInput.value = acc.type || 'hotel';
  accommodationAddressInput.value = acc.address || '';
  accommodationCheckInInput.value = acc.checkIn || '';
  accommodationCheckOutInput.value = acc.checkOut || '';

  accommodationSummary.textContent =
    `${acc.name} · ${acc.address}`;
}

// ---- Events
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  items = addItem(items, itemInput.value);
  save(items);
  render();
  itemInput.value = "";
  itemInput.focus();
});

btnCheckAll.addEventListener("click", () => {
  items = items.map((it) => ({ ...it, done: true }));
  save(items);
  render();
});

btnUncheckAll.addEventListener("click", () => {
  items = items.map((it) => ({ ...it, done: false }));
  save(items);
  render();
});

btnClear.addEventListener("click", () => {
  if (confirm("Liste wirklich leeren?")) {
    items = [];
    save(items);
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

accommodationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const address = accommodationAddressInput.value.trim();

  const coordinates = await geocodeAddress(address);

  currentAccommodation = new Accommodation({
  name: accommodationNameInput.value.trim(),
  type: accommodationTypeInput.value,
  address,
  checkIn: accommodationCheckInInput.value,
  checkOut: accommodationCheckOutInput.value,
  lat: coordinates?.lat ?? null,
  lng: coordinates?.lng ?? null
  });

  currentTrip = updateTrip({
    accommodation: currentAccommodation
  });

  renderAccommodation();
  showAccommodationOnMap(currentTrip.accommodation);
});

// ---- POI
function renderCategoryChips() {
  const row = document.getElementById('poi-categories');
  if (row.children.length) return;
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = cat.label;
    chip.addEventListener('click', () => loadPOIs(key, chip));
    row.appendChild(chip);
  });
}

async function loadPOIs(categoryKey, chipBtn) {
  const acc = currentTrip.accommodation;
  if (!acc?.lat) {
    alert('Bitte zuerst eine Unterkunft mit Adresse speichern.');
    return;
  }
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chipBtn.classList.add('active');

  const loading = document.getElementById('poi-loading');
  loading.hidden = false;
  const places = await fetchPlaces(acc.lat, acc.lng, categoryKey);
  loading.hidden = true;

  const savedIds = (currentTrip.savedPlaces || []).map(p => p.id);
  renderPlaces(places, {
    onShow: (place) => showPlaceOnMap(place),
    onSave: (place) => {
      if (!(currentTrip.savedPlaces || []).find(p => p.id === place.id)) {
        currentTrip = updateTrip({
          savedPlaces: [...(currentTrip.savedPlaces || []), place],
        });
      }
    },
  }, savedIds);
}

// ---- Gespeicherte Orte
function renderSavedPlaces() {
  const list = document.getElementById('saved-list');
  const places = currentTrip.savedPlaces || [];
  list.innerHTML = '';

  if (!places.length) {
    const li = document.createElement('li');
    li.className = 'poi-card';
    li.textContent = 'Noch keine Orte gespeichert.';
    list.appendChild(li);
    return;
  }

  places.forEach(place => {
    const li = document.createElement('li');
    li.className = 'poi-card';

    const info = document.createElement('div');
    info.className = 'poi-info';
    const name = document.createElement('div');
    name.className = 'poi-name';
    name.textContent = place.name;
    const meta = document.createElement('div');
    meta.className = 'poi-meta';
    meta.textContent = `${CATEGORIES[place.category]?.label ?? place.category} · ${place.distance} m`;
    info.appendChild(name);
    info.appendChild(meta);

    const showBtn = document.createElement('button');
    showBtn.className = 'ghost';
    showBtn.textContent = '📍 Auf Karte';
    showBtn.addEventListener('click', () => {
      document.querySelector('[data-target="tab-map"]').click();
      setTimeout(() => showPlaceOnMap(place), 150);
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'danger';
    removeBtn.textContent = '🗑 Entfernen';
    removeBtn.addEventListener('click', () => {
      currentTrip = updateTrip({
        savedPlaces: (currentTrip.savedPlaces || []).filter(p => p.id !== place.id),
      });
      renderSavedPlaces();
    });

    li.appendChild(info);
    li.appendChild(showBtn);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

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
    if (btn.dataset.target === 'tab-map') {
      initMap();
      showAccommodationOnMap(currentTrip.accommodation);
      renderCategoryChips();
    }
    if (btn.dataset.target === 'tab-saved') {
      renderSavedPlaces();
    }
  });
});

// ---- Init
(async function init() {
  ({ items } = load());
  currentTrip = loadTrip();
  await initDB();

  renderTrip();
  syncCountdown(currentTrip);
  renderAccommodation();
  initMap();
  showAccommodationOnMap(currentTrip.accommodation);
  render();
  await renderDocs();
})();
