export const CATEGORIES = {
  attraction:  { label: '⭐ Must-See',   key: 'tourism',  val: 'attraction'  },
  museum:      { label: '🏛 Museen',     key: 'tourism',  val: 'museum'      },
  restaurant:  { label: '🍽 Essen',      key: 'amenity',  val: 'restaurant'  },
  park:        { label: '🌳 Parks',      key: 'leisure',  val: 'park'        },
  beach:       { label: '🏖 Strand',     key: 'natural',  val: 'beach'       },
  supermarket: { label: '🛒 Supermarkt', key: 'shop',     val: 'supermarket' },
  bus_stop:    { label: '🚇 ÖPNV',       key: 'highway',  val: 'bus_stop'    },
  pharmacy:    { label: '💊 Apotheke',   key: 'amenity',  val: 'pharmacy'    },
  bar:         { label: '🍺 Bars & Pubs', key: 'amenity',  val: 'bar|pub|biergarten|nightclub', regex: true },
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

  const selector = cat.regex
    ? `["${cat.key}"~"^(${cat.val})$"]`
    : `["${cat.key}"="${cat.val}"]`;

  const query = `
    [out:json][timeout:15];
    (
      node${selector}(around:${radius},${accLat},${accLng});
      way${selector}(around:${radius},${accLat},${accLng});
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
