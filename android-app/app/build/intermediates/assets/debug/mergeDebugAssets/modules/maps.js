let map = null;
let accommodationMarker = null;

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

  accommodationMarker = L.marker(position)
    .addTo(map)
    .bindPopup(`
      <strong>${name}</strong><br>
      ${address || ""}
    `);

  map.setView(position, 14);
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
