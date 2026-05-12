let dragSourceId = null;

function clearDropIndicators() {
  listEl.querySelectorAll('.drop-before, .drop-after').forEach((el) => {
    el.classList.remove('drop-before', 'drop-after');
  });
}

function handleItemDragOver(event, targetId, li) {
  if (!dragSourceId || dragSourceId === targetId) return;
  event.preventDefault();
  const rect = li.getBoundingClientRect();
  const isAfter = event.clientY > rect.top + rect.height / 2;
  clearDropIndicators();
  li.classList.add(isAfter ? 'drop-after' : 'drop-before');
}

function handleItemDrop(event, targetId, li, onReorder) {
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
  onReorder(sourceId, targetId, placeAfter);
}

export function renderList(items, { onToggle, onRemove, onReorder }) {
  const listEl = document.getElementById("list");
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
    cb.addEventListener("change", () => onToggle(it.id));

    const txt = document.createElement("span");
    txt.textContent = it.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.setAttribute("aria-label", `Lösche ${it.text}`);
    del.innerHTML = '<span aria-hidden="true">&#128465;</span><span class="sr-only">Löschen</span>';
    del.addEventListener("click", () => onRemove(it.id));

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
    li.addEventListener('drop', (ev) => handleItemDrop(ev, it.id, li, onReorder));

    listEl.appendChild(li);
  });
}

export const addItem = (items, text) => {
  const trimmed = text.trim();
  if (!trimmed) return items;
  return [...items, { id: crypto.randomUUID(), text: trimmed, done: false }];
};

export const toggleItem = (items, id) =>
  items.map((it) => (it.id === id ? { ...it, done: !it.done } : it));

export const removeItem = (items, id) =>
  items.filter((it) => it.id !== id);

export function reorderItems(items, sourceId, targetId, placeAfter) {
  const sourceIndex = items.findIndex((it) => it.id === sourceId);
  const targetIndex = items.findIndex((it) => it.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return items;
  if (sourceIndex === targetIndex) return items;

  const copy = [...items];
  const [moved] = copy.splice(sourceIndex, 1);
  let insertIndex = targetIndex;
  if (sourceIndex < targetIndex) insertIndex -= 1;
  if (placeAfter) insertIndex += 1;
  if (insertIndex < 0) insertIndex = 0;
  if (insertIndex > copy.length) {
    copy.push(moved);
  } else {
    copy.splice(insertIndex, 0, moved);
  }
  return copy;
}
