/* ================================================================
   CONTENT RENDERER
   ----------------------------------------------------------------
   Runs once, immediately, and copies every value from config.js
   onto the page: names, quote, save-the-date row, theme colors,
   the Events list, the Photo Gallery, and the Location text/links.

   This is the ONLY file that reads config.js and touches text —
   scene.js / gallery.js / music.js / countdown.js / location.js
   only need the DOM elements this script fills in to already exist.

   Nothing here needs to change for a new couple; only config.js does.
   ================================================================ */
(function(){
  var cfg = window.WEDDING_CONFIG || {};

  /* ---------------------------------------------------------------
     1) THEME COLORS -> CSS custom properties (see css/style.css :root)
     --------------------------------------------------------------- */
  (function applyTheme(){
    var t = cfg.theme || {};
    var root = document.documentElement.style;
    if (t.gold)      root.setProperty('--gold', t.gold);
    if (t.goldDeep)   root.setProperty('--gold-deep', t.goldDeep);
    if (t.goldLight)  root.setProperty('--gold-light', t.goldLight);
    if (t.ivory1)     root.setProperty('--ivory-1', t.ivory1);
    if (t.ivory2)     root.setProperty('--ivory-2', t.ivory2);
  })();

  /* ---------------------------------------------------------------
     2) COUPLE NAMES + QUOTE
     --------------------------------------------------------------- */
  var couple = cfg.couple || {};
  document.querySelectorAll('[data-cfg="groomName"]').forEach(function(el){
    setNameText(el, couple.groomName || 'Groom');
  });
  document.querySelectorAll('[data-cfg="brideName"]').forEach(function(el){
    setNameText(el, couple.brideName || 'Bride');
  });

  // The opening poster's names (inside .op-names) get a one-time
  // letter-by-letter reveal (see css/style.css .op-lt rules). The
  // Both the opening poster's names (inside .op-names) and the Hero's
  // names (elements with the .nm class) get a one-time letter-by-letter
  // reveal. Different classes (op-lt vs lt) keep their CSS/animation
  // timing independent even though the underlying technique is the same.
  function setNameText(el, text){
    var letterClass = (el.closest && el.closest('.op-names')) ? 'op-lt'
                     : (el.classList && el.classList.contains('nm')) ? 'lt'
                     : null;
    if (letterClass) {
      el.innerHTML = '';
      text.split('').forEach(function(ch, i){
        var span = document.createElement('span');
        span.className = letterClass;
        span.style.setProperty('--i', i);
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
      });
    } else {
      el.textContent = text;
    }
  }

  document.querySelectorAll('[data-cfg="quote"]').forEach(function(el){
    el.innerHTML = (couple.quote || '').split('\n').map(escapeHTML).join('<br>');
  });

  /* ---------------------------------------------------------------
     3) SAVE THE DATE ROW (day / number / month / year)
     Auto-computed from wedding.date unless a display* override is set.
     --------------------------------------------------------------- */
  (function fillDate(){
    var w = cfg.wedding || {};
    var d = w.date ? new Date(w.date) : null;
    var DOW = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    var MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    var day   = w.displayDay   || (d ? DOW[d.getDay()] : '');
    var num   = w.displayNum   || (d ? String(d.getDate()) : '');
    var month = w.displayMonth || (d ? MON[d.getMonth()] : '');
    var year  = w.displayYear  || (d ? String(d.getFullYear()) : '');

    setText('[data-cfg="dateDay"]', day);
    setText('[data-cfg="dateNum"]', num);
    setText('[data-cfg="dateMonth"]', month);
    setText('[data-cfg="dateYear"]', year);
  })();

  /* ---------------------------------------------------------------
     4) EVENTS LIST — rendered entirely from config.js
     --------------------------------------------------------------- */
  (function renderEvents(){
    var list = document.querySelector('[data-ev="list"]');
    if (!list) return;
    var events = cfg.events || [];

    // The card design itself (ivory glass background, gold frame,
    // rounded shape, spacing) is fixed/hardcoded in css/style.css —
    // only the content below is driven by config.js: title, date,
    // time, and the circular photo. A safe default image is used if
    // an event's `image` path is missing or fails to load, so a
    // typo in config.js never shows a broken image icon.
    var FALLBACK_IMG = 'assets/images/events/haldi.jpg';

    var html = events.map(function(ev){
      var img = escapeAttr(ev.image || FALLBACK_IMG);
      return (
        '<div class="ev-card">' +
          '<div class="ev-inner">' +
            '<div class="ev-ic">' +
              '<img src="' + img + '" alt="" loading="lazy" ' +
                'onerror="this.onerror=null;this.src=\'' + FALLBACK_IMG + '\';">' +
            '</div>' +
            '<div class="ev-mid">' +
              '<div class="t">' + escapeHTML((ev.title || '').toUpperCase()) + '</div>' +
              '<div class="d">' + escapeHTML(ev.date || '') + (ev.time ? '  |  ' + escapeHTML(ev.time) : '') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    list.innerHTML = html;
  })();

  function escapeAttr(s){
    return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ---------------------------------------------------------------
     5) PHOTO GALLERY — fixed asset filenames, no config needed.
     To add more than 4 photos, add more filenames to this list AND
     matching files in assets/images/ (advanced/optional edit).
     --------------------------------------------------------------- */
  (function renderGallery(){
    var track = document.getElementById('galTrack');
    if (!track) return;
    var photos = [
      'assets/images/gallery-1.jpg',
      'assets/images/gallery-2.jpg',
      'assets/images/gallery-3.jpg',
      'assets/images/gallery-4.jpg'
    ];
    track.innerHTML = photos.map(function(src){
      return '<div class="gal-item" style="background-image:url(' + src + ')"></div>';
    }).join('');
  })();

  /* ---------------------------------------------------------------
     6) LOCATION — venue name, address, maps links
     --------------------------------------------------------------- */
  var venue = cfg.venue || {};
  setText('[data-cfg="venueName"]', venue.name || '');
  document.querySelectorAll('[data-cfg="venueAddress"]').forEach(function(el){
    el.innerHTML = (venue.address || '').split('\n').map(escapeHTML).join('<br>');
  });
  document.querySelectorAll('[data-cfg-href="mapsLink"]').forEach(function(el){
    el.setAttribute('href', venue.mapsLink || '#');
  });

  /* ---------------------------------------------------------------
     helpers
     --------------------------------------------------------------- */
  function setText(sel, val){
    document.querySelectorAll(sel).forEach(function(el){ el.textContent = val; });
  }
  function escapeHTML(s){
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();
