export const CATEGORIES = {
  attraction:  { label: '⭐ Must-See',    filters: [
    { key: 'tourism',  val: 'attraction|viewpoint|artwork|zoo|theme_park|aquarium|gallery|miniature_golf', regex: true },
    { key: 'historic', val: 'monument|memorial|castle|ruins|archaeological_site|building|fort|manor', regex: true },
  ]},
  museum:      { label: '🏛 Museen',      filters: [
    { key: 'tourism',  val: 'museum|gallery', regex: true },
  ]},
  restaurant:  { label: '🍽 Essen',       filters: [
    { key: 'amenity',  val: 'restaurant|cafe|fast_food|food_court|ice_cream', regex: true },
    { key: 'shop',     val: 'bakery|pastry|deli', regex: true },
  ]},
  park:        { label: '🌳 Parks',       filters: [
    { key: 'leisure',  val: 'park|garden|nature_reserve|recreation_ground|dog_park', regex: true },
  ]},
  beach:       { label: '🏖 Strand',      filters: [
    { key: 'natural',  val: 'beach|sand', regex: true },
    { key: 'leisure',  val: 'beach_resort|swimming_area', regex: true },
  ]},
  supermarket: { label: '🛒 Supermarkt',  filters: [
    { key: 'shop',     val: 'supermarket|convenience|grocery|hypermarket|department_store|mall', regex: true },
  ]},
  bus_stop:    { label: '🚇 ÖPNV',        filters: [
    { key: 'highway',  val: 'bus_stop' },
    { key: 'railway',  val: 'station|tram_stop|halt|subway_entrance', regex: true },
    { key: 'amenity',  val: 'ferry_terminal|bus_station', regex: true },
  ]},
  pharmacy:    { label: '💊 Gesundheit',  filters: [
    { key: 'amenity',  val: 'pharmacy|hospital|clinic|doctors|dentist', regex: true },
  ]},
  bar:         { label: '🍺 Bars & Pubs', filters: [
    { key: 'amenity',  val: 'bar|pub|biergarten|nightclub', regex: true },
  ]},
};

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function fetchPlaces(accLat, accLng, categoryKey, radius = 1500) {
  const cat = CATEGORIES[categoryKey];
  if (!cat) return [];

  const geo = `(around:${radius},${accLat},${accLng})`;
  const parts = cat.filters.map(f => {
    const sel = f.regex ? `["${f.key}"~"^(${f.val})$"]` : `["${f.key}"="${f.val}"]`;
    return `      node${sel}${geo};\n      way${sel}${geo};`;
  }).join('\n');

  const query = `
    [out:json][timeout:15];
    (
${parts}
    );
    out center 30;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    const data = await res.json();

    return data.elements
      .filter(el => (el.lat ?? el.center?.lat) != null)
      .map(el => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        return {
          id:       `osm-${el.id}`,
          name:     el.tags.name || el.tags.brand || el.tags['name:de'] || 'Unbekannter Ort',
          category: categoryKey,
          lat,
          lng,
          distance: haversineMeters(accLat, accLng, lat, lng),
          saved:    false,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  } catch {
    return [];
  }
}

const poiListEl = document.getElementById('poi-results');

export function renderPlaces(places, { onShow, onSave }, savedIds = []) {
  poiListEl.innerHTML = '';

  if (!places.length) {
    const li = document.createElement('li');
    li.className = 'poi-card';
    li.textContent = 'Keine Ergebnisse in der Nähe gefunden.';
    poiListEl.appendChild(li);
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
    meta.textContent = `${place.distance} m entfernt`;

    info.appendChild(name);
    info.appendChild(meta);

    const showBtn = document.createElement('button');
    showBtn.className = 'ghost';
    showBtn.textContent = '📍 Zeigen';
    showBtn.addEventListener('click', () => onShow(place));

    const isSaved = savedIds.includes(place.id);
    const saveBtn = document.createElement('button');
    if (isSaved) {
      saveBtn.className = 'ghost poi-saved';
      saveBtn.textContent = '✓ Gespeichert';
      saveBtn.disabled = true;
    } else {
      saveBtn.className = 'ghost';
      saveBtn.textContent = '❤️ Speichern';
      saveBtn.addEventListener('click', () => {
        onSave(place);
        saveBtn.textContent = '✓ Gespeichert';
        saveBtn.disabled = true;
      });
    }

    li.appendChild(info);
    li.appendChild(showBtn);
    li.appendChild(saveBtn);
    poiListEl.appendChild(li);
  });
}
