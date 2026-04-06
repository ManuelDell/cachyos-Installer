# OpenLP ChordView

Vollbild-Custom-Stage-View für OpenLP: **Liedtext + Akkorde**, wie die Main-Ansicht,
aber mit Akkorden über den Silben – ähnlich wie Songbeamer.

Ideal für einen zweiten Beamer (Musiker/Bühne), während der erste Beamer die normale
Main-Ansicht ohne Akkorde zeigt.

```
┌──────────────────────────────────────────┐
│   G       D    Em  C                     │  ← Akkorde (gold)
│   Großer Gott wir loben dich             │  ← Liedtext (weiß)
│   G       D        G    D               │
│   Herr wir preisen deine Stärke         │
└──────────────────────────────────────────┘
```

## Voraussetzungen

- OpenLP 3.x mit aktiviertem **Remote**-Plugin
  (`Einstellungen → Plugins → Remote → aktivieren`)
- Die Lieder müssen in OpenLP mit Akkorden versehen sein
  (Lied bearbeiten → Akkorde mit `[Am]`, `[G]`, `[D7]` usw. vor den Silben eintragen)

---

## Installation

### Windows

PowerShell öffnen (`Win + X → Windows PowerShell`) und folgendes ausführen:

```powershell
# 1. Repository klonen
git clone https://github.com/YOUR_GITHUB_USERNAME/openlp-chords-view.git

# 2. Stages-Ordner anlegen (falls nicht vorhanden) und View kopieren
New-Item -ItemType Directory -Force -Path "$env:APPDATA\openlp\stages"
Copy-Item -Recurse -Force "openlp-chords-view\stages\ChordView" "$env:APPDATA\openlp\stages\ChordView"

# 3. Temporären Klon aufräumen (optional)
Remove-Item -Recurse -Force openlp-chords-view
```

Pfad zur Kontrolle: `C:\Users\<Benutzername>\AppData\Roaming\openlp\stages\ChordView\`

---

### Linux (CachyOS / Arch / Ubuntu)

Terminal öffnen:

```bash
# 1. Repository klonen
git clone https://github.com/YOUR_GITHUB_USERNAME/openlp-chords-view.git

# 2. Stages-Ordner anlegen (falls nicht vorhanden) und View kopieren
mkdir -p ~/.local/share/openlp/stages
cp -r openlp-chords-view/stages/ChordView ~/.local/share/openlp/stages/ChordView

# 3. Temporären Klon aufräumen (optional)
rm -rf openlp-chords-view
```

Pfad zur Kontrolle: `~/.local/share/openlp/stages/ChordView/`

---

## Update (beide Plattformen)

Einfach die Installationsschritte erneut ausführen – `Copy-Item -Force` bzw. `cp -r`
überschreiben die vorhandenen Dateien.

---

## Nutzung

1. OpenLP starten und ein **Lied mit Akkorden** in die Service-Liste laden
2. Im Browser (oder zweiten Beamer) aufrufen:

```
http://<OpenLP-IP>:4316/stage/ChordView
```

Die IP-Adresse von OpenLP findest du unter
`Einstellungen → Fernsteuerung → Anzeige der IP-Adresse`

**Vollbild-Tipp:** Im Browser `F11` drücken für echten Vollbildmodus.

---

## Anpassung (Farben, Schriftgröße)

Ganz oben in `stage.css` findest du die CSS-Variablen:

```css
:root {
  --lyric-size: 6.5vh;       /* Liedtext-Schriftgröße */
  --chord-size: 3.8vh;       /* Akkord-Schriftgröße   */
  --lyric-color: #ffffff;    /* Liedtext-Farbe (weiß) */
  --chord-color: #FFD700;    /* Akkord-Farbe (gold)   */
  --bg-color:    #000000;    /* Hintergrundfarbe      */
}
```

Diese können direkt bearbeitet werden.

---

## Akkord-Format in OpenLP

Akkorde werden als `[Akkordname]` direkt vor der Silbe eingetragen, auf die sie fallen:

```
[G]Großer [D]Gott wir [Em]loben [C]dich
[G]Herr wir [D]preisen [G]deine [D]Stärke
```

OpenLP zeigt diese intern im Liededitor an. Die ChordView liest das `chords`-Feld
der OpenLP-API (`/api/v2/controller/live-items`) und rendert die Akkorde golden
über dem jeweiligen Wort/der Silbe.

---

## Lizenz

GPL v2 – basiert auf dem offiziellen OpenLP Custom Stage Template.
