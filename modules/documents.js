const DB_NAME    = 'ua_docs';
const DB_VERSION = 1;
const STORE      = 'documents';

const CATEGORY_LABELS = {
  flugticket: '✈ Flugticket',
  unterkunft: '🏨 Unterkunft',
  mietwagen: '🚗 Mietwagen',
  ausweis:    '🆔 Ausweis',
  sonstiges:  '📄 Sonstiges',
};

let db = null;

const docListEl = document.getElementById('doc-list');

// ---- IndexedDB helpers

export function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const idb = e.target.result;
      if (!idb.objectStoreNames.contains(STORE)) {
        idb.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(); };
    req.onerror   = ()  => reject(req.error);
  });
}

export function addDocument(doc) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).add(doc);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export function getAllDocuments() {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      resolve(req.result.map(({ data: _, ...meta }) => meta));
    };
    req.onerror = () => reject(req.error);
  });
}

export function getBlob(id) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const record = req.result;
      if (!record?.data) { resolve(null); return; }
      resolve(new Blob([record.data], { type: record.mimeType }));
    };
    req.onerror = () => reject(req.error);
  });
}

export function deleteDocument(id) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// ---- Rendering

function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function renderDocuments(docs, { onDownload, onDelete }) {
  docListEl.innerHTML = '';

  if (!docs.length) {
    const li = document.createElement('li');
    li.className = 'doc-item doc-item--empty';
    li.textContent = 'Noch keine Dokumente – lade etwas hoch!';
    docListEl.appendChild(li);
    return;
  }

  docs.forEach((doc) => {
    const li = document.createElement('li');
    li.className = 'doc-item';

    const badge = document.createElement('span');
    badge.className = `doc-badge doc-badge--${doc.category}`;
    badge.textContent = CATEGORY_LABELS[doc.category] ?? doc.category;

    const info = document.createElement('div');
    info.className = 'doc-info';

    const name = document.createElement('span');
    name.className = 'doc-name';
    name.textContent = doc.name;

    const meta = document.createElement('span');
    meta.className = 'doc-meta';
    meta.textContent = `${formatSize(doc.size)} · ${formatDate(doc.addedAt)}`;

    const dlBtn = document.createElement('button');
    dlBtn.className = 'ghost doc-download';
    dlBtn.setAttribute('aria-label', `Lade ${doc.name} herunter`);
    dlBtn.textContent = '⬇ Laden';
    dlBtn.addEventListener('click', () => onDownload(doc.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'delete';
    delBtn.setAttribute('aria-label', `Lösche ${doc.name}`);
    delBtn.innerHTML = '<span aria-hidden="true">&#128465;</span><span class="sr-only">Löschen</span>';
    delBtn.addEventListener('click', () => onDelete(doc.id));

    info.appendChild(name);
    info.appendChild(meta);
    li.appendChild(badge);
    li.appendChild(info);
    li.appendChild(dlBtn);
    li.appendChild(delBtn);
    docListEl.appendChild(li);
  });
}
