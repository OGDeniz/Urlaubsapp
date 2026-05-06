export const LS_KEYS = {
  tripDate: "ua_trip_date",
  items: "ua_pack_items",
};

export const save = (tripDate, items) => {
  if (tripDate instanceof Date) {
    localStorage.setItem(LS_KEYS.tripDate, tripDate.toISOString());
  } else {
    localStorage.removeItem(LS_KEYS.tripDate);
  }
  localStorage.setItem(LS_KEYS.items, JSON.stringify(items));
};

export const load = () => {
  let tripDate = null;
  const d = localStorage.getItem(LS_KEYS.tripDate);
  if (d) {
    const parsed = new Date(d);
    tripDate = isNaN(parsed.getTime()) ? null : parsed;
  }

  let items = [];
  const raw = localStorage.getItem(LS_KEYS.items);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    items = Array.isArray(parsed) ? parsed : [];
  } catch {
    items = [];
  }

  return { tripDate, items };
};
