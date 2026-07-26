/* ================================================================
   BACKGROUND MUSIC — global, persistent controller
   Loads the fixed file assets/music/wedding.mp3 (see CHANGE MUSIC
   HERE below) and plays it on a loop. There is exactly ONE audio
   instance for the whole site (window.__weddingMusic) so navigating
   between sections never restarts or duplicates the track.

   The floating gold music icon (button#musicBtn, fixed in every
   section) calls window.__weddingMusic.toggle() to play/pause.

   If assets/music/wedding.mp3 is missing or fails to load, this
   automatically falls back to a soft generated ambient tone so a
   client previewing the template before adding their own track
   never sees a broken button.
   ================================================================ */
(function(){
  var cfg = window.WEDDING_CONFIG || {};
  var musicCfg = cfg.music || {};

  // ============================
  // CHANGE MUSIC HERE
  // Replace assets/music/wedding.mp3 with your own file — same
  // filename, so nothing in this script needs to change.
  // ============================
  var MUSIC_SRC = 'assets/music/wedding.mp3';

  var btn = document.getElementById('musicBtn');
  if (!btn) return;
  if (window.__weddingMusic) { window.__weddingMusic.bind(btn); return; }

  var el = null, ac = null, master = null, built = false, on = false, lock = 0, usingFallback = false;

  function buildFile(){
    el = new Audio(MUSIC_SRC);
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0;
    el.setAttribute('playsinline', '');
    // If the file 404s or can't decode, gracefully fall back to a
    // generated tone rather than leaving the button non-functional.
    el.addEventListener('error', function(){
      if (usingFallback) return;
      usingFallback = true;
      el = null;
      buildTone();
      if (on) { try { ac.resume(); fade(0.5, 1.0); } catch(e){} }
    }, { once: true });
  }

  function buildTone(){
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0.0001; master.connect(ac.destination);
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 950; lp.connect(master);
    [[196,.055],[293.66,.045],[392,.038],[587.33,.022]].forEach(function(pair, i){
      var f = pair[0], g = pair[1];
      var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      var og = ac.createGain(); og.gain.value = g;
      var lfo = ac.createOscillator(); lfo.frequency.value = .07 + i * .031;
      var lg = ac.createGain(); lg.gain.value = g * .5;
      lfo.connect(lg); lg.connect(og.gain);
      o.connect(og); og.connect(lp); o.start(); lfo.start();
    });
  }

  function build(){
    if (built) return; built = true;
    buildFile();   // always try the real file first; falls back automatically on error
  }

  function fade(target, dur){
    if (el){
      var from = el.volume, t0 = performance.now();
      (function ramp(){
        var k = Math.min(1, (performance.now() - t0) / (dur * 1000));
        el.volume = from + (target - from) * (k < .5 ? 2*k*k : 1 - Math.pow(-2*k+2, 2)/2);
        if (k < 1) requestAnimationFrame(ramp);
      })();
    } else if (ac){
      var t = ac.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
      master.gain.exponentialRampToValueAtTime(Math.max(0.0001, target), t + dur);
    }
  }

  async function toggle(ev){
    var now = Date.now(); if (now - lock < 320) return; lock = now;
    if (ev) ev.preventDefault();
    build();
    on = !on;
    api.sync();
    try {
      if (on){
        if (el) { await el.play().catch(function(){}); }
        if (ac && ac.state !== 'running') { await ac.resume(); }
        fade(0.5, 1.1);
      } else {
        fade(0.0001, 0.7);
        if (el) setTimeout(function(){ if (!on) el.pause(); }, 750);
      }
    } catch(e){}
  }

  var api = {
    isOn: function(){ return on; },
    toggle: toggle,
    /** Called by poster.js the instant the visitor taps "Touch to
     *  Open", if config.js has music.enabledByDefault = true. That
     *  tap is the user gesture that satisfies browser autoplay
     *  policies, so music can start immediately and keep playing
     *  smoothly through the splash video and into the Hero. Set
     *  enabledByDefault to false in config.js to instead leave music
     *  off until the visitor taps the floating gold icon themselves. */
    turnOnIfConfigured: function(){
      if (musicCfg.enabledByDefault && !on) toggle();
    },
    sync: function(){
      var b = api._btn;
      if (!b) return;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    },
    bind: function(b){ api._btn = b; b.addEventListener('click', toggle); api.sync(); }
  };
  window.__weddingMusic = api;
  api.bind(btn);

  // Keep playing when the tab regains focus; never restart the track.
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden && on){
      if (el) el.play().catch(function(){});
      if (ac) ac.resume().catch(function(){});
    }
  });
})();
