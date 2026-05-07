export const LS_KEYS = {
  items: "ua_pack_items",
};

export const save = (items) => {
  localStorage.setItem(LS_KEYS.items, JSON.stringify(items));
};

export const load = () => {
  let items = [];
  const raw = localStorage.getItem(LS_KEYS.items);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    items = Array.isArray(parsed) ? parsed : [];
  } catch {
    items = [];
  }
  return { items };
};
