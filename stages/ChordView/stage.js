/*
 * OpenLP ChordView – stage.js
 * Vollbild-Ansicht mit Akkorden (wie Songbeamer / Main-Ansicht + Akkorde).
 *
 * Akkorde werden aus dem "chords"-Feld der OpenLP-API gelesen.
 * Format: [Am]Text [G]mehr [F]Text  →  Akkord über der Silbe/dem Wort.
 *
 * Basiert auf dem offiziellen OpenLP custom_stage Template (GPL v2).
 */

window.OpenLP = {

  /* ── Hilfsfunktionen ──────────────────────────────────── */

  escHtml: function(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  /*
   * Rendert eine einzelne Liedzeile mit [Akkord]-Markierungen.
   * Gibt HTML mit .lyric-line > .word-unit-Struktur zurück.
   *
   * Eingabe-Beispiel:  "[Am]Großer [D]Gott wir [Em]loben [C]dich"
   * Ausgabe: Akkorde erscheinen goldgelb über den Silben.
   */
  renderLine: function(line) {
    var hasChord = /\[[^\]]+\]/.test(line);

    if (!hasChord) {
      // Normale Zeile ohne Akkorde: Platzhalter-Zeile für Akkordraum
      return '<div class="lyric-line">'
           + '<span class="word-unit">'
           + '<span class="chord-text">\u00a0</span>'
           + '<span class="lyric-text">' + OpenLP.escHtml(line) + '</span>'
           + '</span></div>';
    }

    /*
     * Zerlege die Zeile in [Akkord]+Text-Paare.
     * Regex matched: optionaler [Akkord], dann beliebiger Text bis zum nächsten [ oder Zeilenende.
     */
    var html = '<div class="lyric-line">';
    var regex = /(\[[^\]]*\])?([^\[]*)/g;
    var match;

    while ((match = regex.exec(line)) !== null) {
      if (!match[0]) break;                   // leerer Match am Ende
      var chord = match[1] ? match[1].slice(1, -1) : '';
      var text  = match[2] || '';
      if (!chord && !text) continue;

      var chordHtml = chord ? OpenLP.escHtml(chord) : '\u00a0';
      /*
       * Text: Wenn leer aber ein Akkord vorhanden ist, brauchen wir
       * trotzdem einen Platzhalter damit der Akkord sichtbar ist.
       */
      var textHtml  = text ? OpenLP.escHtml(text) : '\u00a0';

      html += '<span class="word-unit">'
            + '<span class="chord-text">' + chordHtml + '</span>'
            + '<span class="lyric-text">'  + textHtml  + '</span>'
            + '</span>';
    }

    html += '</div>';
    return html;
  },

  /*
   * Rendert den kompletten Folieninhalt.
   * rawText: Mehrzeiliger String aus slide["chords"] oder slide["text"].
   */
  renderSlide: function(rawText) {
    if (!rawText) return '';
    var lines = rawText.split('\n');
    var html = '';

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') {
        html += '<div class="verse-break"></div>';
      } else {
        html += OpenLP.renderLine(lines[i]);
      }
    }
    return html;
  },

  /* ── Folie aktualisieren ──────────────────────────────── */

  updateSlide: function() {
    if (!OpenLP.currentSlides || OpenLP.currentSlides.length === 0) return;

    var slide = OpenLP.currentSlides[OpenLP.currentSlide];
    if (!slide) return;

    /*
     * "chords" enthält den Text MIT [Am]-Markierungen (HTML-Tags entfernt).
     * "text"   enthält den Text OHNE Akkorde.
     * Wir bevorzugen "chords" damit die Akkorde angezeigt werden.
     */
    var raw = slide['chords'] || slide['text'] || slide['title'] || '';

    // Bilder (Thumbnails) für Nicht-Song-Folien
    var extraHtml = '';
    if (slide['img']) {
      extraHtml += '<br><img src="' + slide['img'] + '" style="max-width:80%;max-height:40vh;">';
    }

    $('#currentslide').html(OpenLP.renderSlide(raw) + extraHtml);
  },

  /* ── Folien laden ─────────────────────────────────────── */

  loadSlides: function() {
    $.getJSON('/api/v2/controller/live-items', function(data) {
      OpenLP.currentSlides = data.slides;
      OpenLP.currentSlide  = 0;

      $.each(data.slides, function(idx, slide) {
        if (slide.selected) {
          OpenLP.currentSlide = idx;
        }
      });

      OpenLP.updateSlide();
    });
  },

  /* ── WebSocket-Verbindung zu OpenLP ───────────────────── */

  myWebSocket: function() {
    var host = window.location.hostname;
    var ws   = new WebSocket('ws://' + host + ':4317');

    ws.onmessage = function(event) {
      var reader = new FileReader();
      reader.onload = function() {
        var data = JSON.parse(reader.result).results;

        if (OpenLP.currentItem    !== data.item ||
            OpenLP.currentService !== data.service) {
          // Neues Lied / neuer Eintrag
          OpenLP.currentItem    = data.item;
          OpenLP.currentService = data.service;
          OpenLP.loadSlides();

        } else if (OpenLP.currentSlide !== parseInt(data.slide, 10)) {
          // Neue Folie desselben Lieds
          OpenLP.currentSlide = parseInt(data.slide, 10);
          OpenLP.updateSlide();
        }
      };
      reader.readAsText(event.data);
    };

    ws.onclose = function() {
      // Automatisch neu verbinden nach 2 Sekunden
      setTimeout(function() { OpenLP.myWebSocket(); }, 2000);
    };

    ws.onerror = function() {
      ws.close();
    };
  },
};

$.ajaxSetup({ cache: false });
OpenLP.myWebSocket();
