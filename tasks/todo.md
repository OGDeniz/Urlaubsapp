# Offene Verbesserungen

## Bugs & Code-Qualität

- [x] **POI-Marker-Leak beheben** (`maps.js:52`) — `placeMarker`-Variable + Cleanup vor neuem Marker
- [x] **Kategorie-Inkonsistenz klären** (`documents.js:5` vs `index.html:162`) — `mietwagen` und `ausweis` in HTML-`<select>` ergänzt
- [x] **Module-level DOM-Queries** (`countdown.js`, `list.js`, `documents.js`) — Queries in Funktionen verschoben

## Nächste Features

- [ ] **Flüge** — `flights: []` im Trip-Modell bereits vorhanden; UI implementieren (Flugnummer, Abflug, Ankunft, Airline)
