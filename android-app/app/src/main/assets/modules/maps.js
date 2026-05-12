let map = null;
let accommodationMarker = null;
let placeMarker = null;

export function initMap() {
    const mapEl = document.getElementById('map');

     if (!mapEl || typeof L === "undefined") return;

  if (map) {
    setTimeout(() => map.invalidateSize(), 100);
    return map;
  }

  map = L.map("map").setView([51.1657, 10.4515], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 100);

  return map;
}

export function showAccommodationOnMap(accommodation) {
  if (!map || !accommodation) return;

  const { name, address, lat, lng } = accommodation;

  if (lat === null || lng === null) {
    console.warn("Unterkunft hat noch keine Koordinaten:", accommodation);
    return;
  }

  const position = [lat, lng];

  if (accommodationMarker) {
    accommodationMarker.remove();
  }

  const redIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#e9665b" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });

  accommodationMarker = L.marker(position, { icon: redIcon })
    .addTo(map)
    .bindPopup(`<strong>${name}</strong><br>${address || ''}`);

  map.setView(position, 14);
}

export function showPlaceOnMap(place) {
  if (!map) return;
  if (placeMarker) placeMarker.remove();
  placeMarker = L.marker([place.lat, place.lng])
    .addTo(map)
    .bindPopup(`<strong>${place.name}</strong>`)
    .openPopup();
  map.setView([place.lat, place.lng], 16);
}

export async function geocodeAddress(address) {
  if (!address) return null;

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };

  } catch (err) {
    console.error("Geocoding Fehler:", err);
    return null;
  }
}
