# ✈️ TripOrg

Dein persönlicher Reise-Assistent für Countdown, Packliste & Reiseplanung. Läuft als PWA im Browser oder als native Android-App – alle Daten bleiben lokal auf dem Gerät.

## ✨ Features

### ⏳ Countdown
- Präziser Countdown bis zur Abreise (Tage, Stunden, Minuten, Sekunden)
- Eingetragene Flüge werden nach Datum sortiert direkt im Countdown-Tab angezeigt

### 📋 Packliste
- Gegenstände hinzufügen, abhaken, löschen
- Drag & Drop zum Umsortieren
- Batch-Aktionen: Alle abhaken, alle zurücksetzen, Liste leeren

### 🧳 Reise, Unterkunft & Flüge
- Reisedaten speichern: Titel, Ziel, Abreise/Rückkehr, Abflugzeit
- Unterkunft verwalten: Name, Typ, Adresse, Check-in/Check-out
- Flüge eintragen: Flugnummer, Von/Nach, Datum, Abflug-/Ankunftszeit
- Adressen werden automatisch geokodiert (Nominatim/OpenStreetMap)

### 🗺️ Karte & POI-Suche
- Interaktive Karte (Leaflet + OpenStreetMap)
- Unterkunft wird automatisch auf der Karte markiert
- POI-Suche in 9 Kategorien via Overpass API (OSM):
  Must-See, Museen, Essen, Parks, Strand, Supermarkt, ÖPNV, Gesundheit, Bars & Pubs
- Einstellbarer Suchradius (500 m – 10 km)
- POI-Details: Öffnungszeiten, Adresse, Telefon, Website, Wikipedia-Bild

### ❤️ Gespeicherte Orte
- POIs aus der Suche speichern und auf der Karte anzeigen

### 📄 Dokumente
- Reisedokumente (PDF, Bilder) lokal im Browser speichern (IndexedDB)
- Auf Android: Dokumente mit nativen Apps öffnen

## 📁 Projektstruktur

```
TripOrg/
├── README.md
├── .gitignore
├── tasks/
│   └── todo.md
└── android-app/
    ├── build.gradle
    ├── settings.gradle
    ├── gradlew / gradlew.bat
    └── app/
        ├── build.gradle
        └── src/main/
            ├── AndroidManifest.xml
            ├── java/com/example/urlaubsapp/
            │   └── MainActivity.kt        # WebView-Setup, JS-Bridge
            ├── res/                       # App-Icons, Themes
            └── assets/                    # Web-App (einzige Quelle)
                ├── index.html
                ├── app.js                 # Einstiegspunkt, Event-Handler
                ├── style.css
                ├── manifest.json          # PWA-Manifest
                ├── sw.js                  # Service Worker (Offline-Cache)
                ├── icon.svg               # App-Icon
                └── modules/
                    ├── accommodation.js   # Accommodation-Klasse
                    ├── countdown.js       # Countdown-Timer
                    ├── documents.js       # IndexedDB-Wrapper
                    ├── flight.js          # Flight-Klasse
                    ├── list.js            # Packliste + Drag & Drop
                    ├── maps.js            # Leaflet, Geocoding
                    ├── places.js          # Overpass-API, POI-Rendering
                    ├── storage.js         # localStorage-Abstraktion
                    └── trip.js            # Reisedaten-Persistenz
```

## 🛠️ Tech-Stack

### Web-App
- **Vanilla JavaScript** (ES Modules, kein Framework)
- **HTML5 / CSS3** (Custom Properties, Flexbox, Grid)
- **PWA** – `manifest.json` + Service Worker, installierbar ohne App Store
- **Leaflet.js** – interaktive Karte
- **Overpass API** – POI-Daten aus OpenStreetMap
- **Nominatim** – Adress-Geokodierung
- **localStorage** – Reisedaten, Packliste & Flüge
- **IndexedDB** – Dokument-Binärdaten

### Android
- **Kotlin**
- **WebView** mit `WebViewAssetLoader` (lädt Assets über `https://appassets.androidplatform.net`)
- **JavaScript-Bridge** (`window.AndroidInterface`):
  - `openUrl(url)` – öffnet Links im System-Browser
  - `openFile(base64, mimeType, fileName)` – öffnet Dokumente mit nativen Apps
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 34 (Android 14)

## 💾 Datenspeicherung

| Schlüssel / Storage | Inhalt |
|---|---|
| `ua_current_trip` (localStorage) | Reisedaten, Unterkunft, Flüge, gespeicherte Orte |
| `ua_pack_items` (localStorage) | Packlisten-Einträge |
| IndexedDB `reisedokumente` | Dokument-Binärdaten |
| Service Worker Cache `triporg-v1` | App-Shell, Fonts, Leaflet, OSM-Tiles |

Keine persönlichen Daten werden an externe Server übertragen (außer Karten-Tiles, Geocoding und POI-Anfragen an OpenStreetMap-Dienste).

## 🚀 Build & Run

### Als PWA im Browser

```bash
cd android-app/app/src/main/assets
python -m http.server 8000
# http://localhost:8000
```

Chrome zeigt einen Install-Button in der Adressleiste — die App lässt sich damit auf dem Homescreen installieren und läuft im Standalone-Modus.

### Android-App

**Voraussetzungen:** Android Studio, JDK 17, Android SDK 24+

```bash
cd android-app
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

Oder direkt in Android Studio: **Run → Run 'app'**

## 🎨 Anpassung

### Farben (`style.css`)

```css
:root {
  --bg:       #fff9f1;  /* Hintergrund */
  --accent:   #ff8a5c;  /* Hauptakzentfarbe */
  --accent-2: #08c7be;  /* Sekundärfarbe */
  --danger:   #e9665b;  /* Warnfarbe */
  --text:     #153243;  /* Textfarbe */
  --muted:    #4a6572;  /* Gedämpfter Text */
}
```

### Hero-Bild (`style.css`)

```css
.hero {
  background: url("DEIN-BILD") center/cover no-repeat;
}
```

## 🔮 Geplante Features

- [ ] Export/Import der Reisedaten
- [ ] Vordefinierte Packlisten-Templates
- [ ] Mehrere Reisen parallel verwalten
- [ ] Dark Mode
- [ ] Wetter-Integration für das Reiseziel
- [ ] Push-Benachrichtigungen (Web Push via PWA)
