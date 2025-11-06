# 🏖️ Urlaubsapp - Countdown & Packliste

Eine elegante Web- und Android-Anwendung zur Vorbereitung Ihres nächsten Urlaubs. Mit Live-Countdown bis zur Abreise und einer interaktiven Packliste, die komplett offline funktioniert.

![Hero Image](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80)

## ✨ Features

### 🕒 Countdown-Timer

- **Präziser Countdown** bis zu Ihrem Abreisedatum und -zeitpunkt
- Anzeige in Tagen, Stunden, Minuten und Sekunden
- Speicherung des Datums im Browser (localStorage)
- Automatische Glückwunsch-Nachricht bei Abreise

### 📋 Interaktive Packliste

- **Gegenstände hinzufügen** und verwalten
- **Abhaken** erledigter Aufgaben
- **Drag & Drop** zum Umsortieren der Listeneinträge
- Batch-Aktionen:
  - Alle abhaken
  - Alle zurücksetzen
  - Liste leeren
- **Offline-fähig** - alle Daten werden lokal gespeichert

### 🎨 Modernes Design

- Responsive Layout für alle Bildschirmgrößen
- Glasmorphismus-Effekte
- Sanfte Animationen und Übergänge
- Barrierefreie Navigation (ARIA-Labels)
- Schönes Hero-Banner mit Urlaubsmotiv

## 🚀 Schnellstart

### Web-Version

1. **Dateien öffnen:**

   ```bash
   # Einfach die index.html im Browser öffnen
   start index.html
   ```

   Oder mit einem lokalen Webserver:

   ```bash
   # Python 3
   python -m http.server 8000

   # Dann öffnen: http://localhost:8000
   ```

2. **Datum einstellen:**

   - Abreisedatum und Abflugzeit eingeben
   - "Countdown starten" klicken

3. **Packliste erstellen:**
   - Gegenstände in das Eingabefeld eintragen
   - Mit "Hinzufügen" zur Liste hinzufügen
   - Checkboxen zum Abhaken nutzen
   - Mit Drag-Handle (☰) umsortieren

### Android-Version

1. **Voraussetzungen:**

   - Android Studio Arctic Fox oder höher
   - JDK 17
   - Android SDK 24 oder höher

2. **Projekt öffnen:**

   ```bash
   cd android-app
   ```

   Öffnen Sie das Projekt in Android Studio

3. **Build & Run:**
   - In Android Studio: "Run" → "Run 'app'"
   - Oder via Kommandozeile:
     ```bash
     ./gradlew assembleDebug
     ```

## 📁 Projektstruktur

```
Urlaubsapp/
├── index.html              # Haupt-HTML-Datei
├── app.js                  # JavaScript-Logik
├── style.css               # Styling und Animationen
├── README.md               # Diese Datei
├── output-metadata.json    # Build-Metadaten
│
└── android-app/            # Android-App-Verzeichnis
    ├── build.gradle        # Projekt-Build-Konfiguration
    ├── settings.gradle     # Gradle-Einstellungen
    ├── gradle.properties   # Gradle-Properties
    ├── gradlew             # Gradle Wrapper (Unix)
    ├── gradlew.bat         # Gradle Wrapper (Windows)
    ├── local.properties    # Lokale SDK-Pfade
    │
    ├── app/
    │   ├── build.gradle    # App-spezifische Build-Konfiguration
    │   ├── proguard-rules.pro
    │   └── src/
    │       └── main/
    │           ├── AndroidManifest.xml
    │           ├── assets/
    │           ├── java/
    │           └── res/
    │
    └── gradle/
        └── wrapper/
            └── gradle-wrapper.properties
```

## 🛠️ Technologie-Stack

### Web-App

- **HTML5** - Semantisches Markup
- **CSS3** - Moderne Styling-Features (Grid, Flexbox, Custom Properties)
- **Vanilla JavaScript** - Keine Frameworks, pure Performance
- **LocalStorage API** - Offline-Datenpersistenz
- **Drag & Drop API** - Native Browser-Funktionalität

### Android-App

- **Kotlin** - Moderne Android-Entwicklung
- **Android SDK 34** (Target)
- **Minimum SDK 24** (Android 7.0+)
- **Material Design Components**
- **AndroidX Libraries**

## 💾 Datenspeicherung

Alle Daten werden **lokal** im Browser gespeichert:

- `ua_trip_date` - Abreisedatum und -zeit
- `ua_pack_items` - Packlisten-Einträge

**Keine Datenübertragung** an externe Server!

## 🎯 Browser-Kompatibilität

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📱 Android-Kompatibilität

- **Minimum:** Android 7.0 (API 24)
- **Target:** Android 14 (API 34)
- **Empfohlen:** Android 8.0+ für beste Performance

## 🔧 Konfiguration

### Reiseziel anpassen

In `index.html` können Sie das Reiseziel ändern:

```html
<span class="hero__eyebrow">Costa Brava, Spanien</span>
<h1 id="hero-title">Pineda de Mar</h1>
<p>Pläne schmieden, Sonne tanken und schon jetzt die Meeresbrise spüren.</p>
```

### Hero-Bild ändern

In `style.css` das Hintergrundbild des Hero-Bereichs anpassen:

```css
.hero {
  background: url("IHR-BILD-URL") center/cover no-repeat;
}
```

### Farben anpassen

CSS-Custom-Properties in `style.css`:

```css
:root {
  --bg: #fff9f1; /* Hintergrund */
  --accent: #ff8a5c; /* Hauptakzentfarbe */
  --accent-2: #08c7be; /* Sekundärfarbe */
  --danger: #e9665b; /* Warnfarbe */
  --text: #153243; /* Textfarbe */
  --muted: #4a6572; /* Gedämpfter Text */
}
```

## 🤝 Mitwirken

Verbesserungsvorschläge und Pull Requests sind willkommen!

1. Fork des Projekts erstellen
2. Feature Branch erstellen (`git checkout -b feature/NeuesFeature`)
3. Änderungen committen (`git commit -m 'Neues Feature hinzugefügt'`)
4. Branch pushen (`git push origin feature/NeuesFeature`)
5. Pull Request öffnen

## 📝 Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

## 🎓 Lernziele & Verwendung

Perfekt geeignet für:

- **Einsteiger:** Vanilla JavaScript ohne Framework-Komplexität
- **Projektunterricht:** Vollständige Web-App mit lokalem Speicher
- **PWA-Lernen:** Basis für Progressive Web App-Erweiterungen
- **Android-Hybrid:** WebView-Integration in nativer App

## 🔮 Geplante Features

- [ ] PWA-Support (Service Worker, Offline-First)
- [ ] Export/Import der Packliste
- [ ] Vordefinierte Packlisten-Templates
- [ ] Push-Benachrichtigungen (24h vor Abreise)
- [ ] Mehrere Reisen parallel verwalten
- [ ] Dark Mode
- [ ] Wetter-API-Integration für Reiseziel

## 📧 Kontakt

Bei Fragen oder Feedback können Sie gerne ein Issue erstellen.

---

**Viel Spaß beim Packen und eine gute Reise! ✈️🏖️**
