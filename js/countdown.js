/* ================================================================
   COUNTDOWN TIMER
   Reads the wedding date/time from config.js (WEDDING_CONFIG.wedding.date)
   — an ISO 8601 string, e.g. "2026-12-21T06:30:00+05:30".
   No other file needs to change if the client edits config.js.
   ================================================================ */
(function(){
  var cfg = window.WEDDING_CONFIG || {};
  var iso = (cfg.wedding && cfg.wedding.date) || '2026-12-21T06:30:00+05:30';
  var target = new Date(iso).getTime();

  var els = { days:null, hours:null, minutes:null, seconds:null };
  document.querySelectorAll('[data-cd]').forEach(function(e){ els[e.dataset.cd] = e; });

  function upd(){
    var d = Math.max(0, target - Date.now());
    var dd = Math.floor(d/86400000); d -= dd*86400000;
    var hh = Math.floor(d/3600000);  d -= hh*3600000;
    var mm = Math.floor(d/60000);    d -= mm*60000;
    var ss = Math.floor(d/1000);
    if (els.days)    els.days.textContent    = String(dd).padStart(2,'0');
    if (els.hours)   els.hours.textContent   = String(hh).padStart(2,'0');
    if (els.minutes) els.minutes.textContent = String(mm).padStart(2,'0');
    if (els.seconds) els.seconds.textContent = String(ss).padStart(2,'0');
  }
  upd();
  setInterval(upd, 1000);
})();
