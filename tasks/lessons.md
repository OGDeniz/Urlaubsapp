# Lessons

## Code-Review ohne Code-Lesen ist wertlos

Externe Reviews (oder KI-generierte Reviews) die nur den Dateibaum und die README analysieren, treffen häufig Aussagen die schlicht falsch sind — z.B. "fehlende Modularisierung" obwohl Module bereits existieren. Vor jeder Review: tatsächliche Dateien lesen, nicht Struktur raten.

## git rm --cached reicht nicht für bereits getrackte Artefakte

`.gitignore` ignoriert nur ungetrackte Dateien. Bereits committete Build-Artefakte (APK, `.gradle/`, `.idea/`, `build/`) müssen explizit mit `git rm --cached -r` deindexiert werden, bevor `.gitignore` greift.

## Teilweise deindexieren führt zu inkonsistentem Zustand

Beim ersten Bereinigungscommit wurde `android-app/build/` übersehen (nur `app/build/` deindexiert). Immer `git status` nach dem Deindexieren prüfen um sicherzustellen dass nichts übrig bleibt.

## Doppelte Dateien ohne Build-Automatisierung divergieren

Root-level Web-Dateien und `android-app/assets/` waren manuell synchron gehalten — was zu Whitespace-Abweichungen geführt hat. Ohne Build-Step (Gradle-Copy-Task o.ä.) divergieren Duplikate zwangsläufig. Einzige Quelle definieren und die andere löschen.

## README muss den tatsächlichen Code widerspiegeln

Die ursprüngliche README referenzierte Root-Dateien die längst weg waren, falsche Storage-Keys (`ua_trip_date` statt `ua_current_trip`) und verschwieg die Hälfte der Features (Karte, POI, Dokumente, Unterkunft). README immer am Code verifizieren, nicht aus dem Gedächtnis schreiben.
