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
        const t   = el.tags;
        const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
        return {
          id:            `osm-${el.id}`,
          name:          t.name || t.brand || t['name:de'] || 'Unbekannter Ort',
          category:      categoryKey,
          lat, lng,
          distance:      haversineMeters(accLat, accLng, lat, lng),
          saved:         false,
          website:       t.website       || t['contact:website'] || null,
          phone:         t.phone         || t['contact:phone']   || null,
          opening_hours: t.opening_hours || null,
          address:       street          || null,
          wikipedia:     t.wikipedia     || null,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  } catch {
    return [];
  }
}

async function fetchWikiSummary(wikipedia) {
  const sep  = wikipedia.indexOf(':');
  if (sep === -1) return null;
  const lang  = wikipedia.slice(0, sep);
  const title = encodeURIComponent(wikipedia.slice(sep + 1));
  try {
    const res  = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`);
    const data = await res.json();
    return {
      image:       data.thumbnail?.source ?? null,
      description: data.extract           ?? null,
    };
  } catch {
    return null;
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

    const hasExtra = place.website || place.phone || place.opening_hours || place.address || place.wikipedia;

    li.appendChild(info);
    li.appendChild(showBtn);
    li.appendChild(saveBtn);

    if (hasExtra) {
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'poi-details';
      detailsDiv.hidden = true;

      let loaded = false;
      const detailBtn = document.createElement('button');
      detailBtn.className = 'ghost';
      detailBtn.textContent = 'ℹ️ Details';
      detailBtn.addEventListener('click', async () => {
        detailsDiv.hidden = !detailsDiv.hidden;
        if (!detailsDiv.hidden && !loaded) {
          loaded = true;
          detailsDiv.innerHTML = '<p class="poi-detail-loading">Lädt…</p>';

          const fragment = document.createDocumentFragment();

          if (place.wikipedia) {
            const wiki = await fetchWikiSummary(place.wikipedia);
            if (wiki?.image) {
              const img = document.createElement('img');
              img.src = wiki.image;
              img.className = 'poi-detail-img';
              img.alt = place.name;
              fragment.appendChild(img);
            }
            if (wiki?.description) {
              const p = document.createElement('p');
              p.className = 'poi-detail-desc';
              p.textContent = wiki.description;
              fragment.appendChild(p);
            }
          }

          const rows = [
            place.address       && { icon: '📍', text: place.address },
            place.opening_hours && { icon: '⏰', text: place.opening_hours },
            place.phone         && { icon: '📞', text: place.phone },
          ].filter(Boolean);

          rows.forEach(({ icon, text }) => {
            const row = document.createElement('div');
            row.className = 'poi-detail-row';
            row.textContent = `${icon} ${text}`;
            fragment.appendChild(row);
          });

          if (place.website) {
            const url = place.website.startsWith('http') ? place.website : `https://${place.website}`;
            const row = document.createElement('div');
            row.className = 'poi-detail-row';
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = '🌐 Website öffnen';
            row.appendChild(a);
            fragment.appendChild(row);
          }

          detailsDiv.innerHTML = '';
          if (!fragment.children.length) {
            const p = document.createElement('p');
            p.className = 'poi-detail-loading';
            p.textContent = 'Keine weiteren Informationen verfügbar.';
            detailsDiv.appendChild(p);
          } else {
            detailsDiv.appendChild(fragment);
          }
        }
      });

      li.appendChild(detailBtn);
      li.appendChild(detailsDiv);
    }

    poiListEl.appendChild(li);
  });
}
