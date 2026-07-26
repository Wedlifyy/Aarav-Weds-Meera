/* ================================================================
   OPENING SEQUENCE CONTROLLER
   ----------------------------------------------------------------
   Poster (tap "Touch to Open") -> gold particle burst + music starts
   -> crossfade into the (silent) splash video -> cinematic gold-light
   transition -> crossfade into the Hero, unlocking scroll.

   Assets used (fixed filenames — see config.js header comment):
     assets/poster/poster.jpg
     assets/videos/splash.mp4   (video only — no audio track)

   Runs independently of the 3D scene/gallery/music modules; it only
   needs to exist long enough to reveal the page underneath, then
   removes itself from the DOM.
   ================================================================ */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var root      = document.documentElement;
  var opening   = document.getElementById('opening');
  var poster    = document.getElementById('opPoster');
  var videoWrap = document.getElementById('opVideoWrap');
  var video     = document.getElementById('opVideo');
  var btn       = document.getElementById('opBtn');
  var burstCv   = document.getElementById('opBurst');
  if (!opening || !poster || !btn) { root.classList.add('hero-ready', 'hero-settled'); return; }   // fail safe: never block the page

  // Lock scrolling until the sequence completes.
  root.classList.add('opening-lock');

  var finishing = false;

  /** Cinematic close: gold light sweep + a few seconds of gentle
   *  particle shimmer while the whole opening layer fades to reveal
   *  the Hero underneath — no sudden appearance or flash. */
  function finish(){
    if (finishing) return;
    finishing = true;

    opening.classList.add('op-outro');   // CSS: opacity fade + gold light sweep
    shimmer();                            // small twinkling gold particles

    // Start the Hero's one-time entrance reveal (background fade, heart
    // frame, photo, letter-by-letter names, subtitle, etc.) right NOW,
    // concurrent with the opening overlay's own fade-out — not after it
    // finishes. Waiting until the overlay was fully gone left a static
    // gap where the 3D background became visible through the fading
    // overlay with nothing yet animating on top of it. Starting both
    // together turns that gap into a single smooth crossfade.
    root.classList.add('hero-ready');
    // Once the one-time reveal has finished playing (see the CSS
    // delays it's built from), release these elements from CSS
    // animation control so the ongoing scroll-driven fade in
    // scene.js (which sets opacity via inline style) can take over
    // cleanly — a still-active CSS animation would otherwise keep
    // overriding that inline style indefinitely.
    setTimeout(function(){ root.classList.add('hero-settled'); }, reduce ? 0 : 3000);

    setTimeout(function(){
      root.classList.remove('opening-lock');
      opening.classList.add('op-hidden');
      // Free the video element's memory once it's no longer needed.
      if (video){ video.pause(); video.removeAttribute('src'); video.load(); }

      // Let the scroll-guide know it's safe to start watching sections.
      document.dispatchEvent(new CustomEvent('opening:complete'));
    }, reduce ? 60 : 2000);  // matches the CSS outro transition duration (~2s cinematic fade)
  }

  btn.addEventListener('click', function onTap(ev){
    btn.removeEventListener('click', onTap);
    btn.disabled = true;

    // Background music starts right on the tap — this single user
    // gesture is what satisfies the browser's autoplay-with-sound
    // requirement for both the video (silent, so moot) and the music.
    if (window.__weddingMusic) window.__weddingMusic.turnOnIfConfigured();

    // Kick the video off immediately (paused/hidden) so it's ready
    // the instant we crossfade — this avoids any black-frame flash.
    playSplash();

    // Safety net starts HERE, from the moment of the tap — not from
    // page load. (Bug fix: the previous version started this timer
    // as soon as the script ran, so waiting any amount of time
    // before tapping "Touch to Open" could make it fire mid-video,
    // or even before the tap, forcing an early skip straight to the
    // Hero. Anchoring it to the tap means it only ever protects
    // against the video itself getting stuck, and never interferes
    // with a normal, in-progress playback no matter how long the
    // visitor waited before tapping.)
    setTimeout(function(){
      if (!opening.classList.contains('op-hidden')) finish();
    }, 15000);
  }, { once: true });

  /* ---- gentle twinkling gold shimmer, used during the closing
     transition into the Hero (separate from the button burst above) ---- */
  function shimmer(){
    if (reduce || !burstCv) return;
    var ctx = burstCv.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = innerWidth, h = innerHeight;
    burstCv.width = w * dpr; burstCv.height = h * dpr;
    burstCv.style.width = w + 'px'; burstCv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var N = 22;
    var dots = [];
    for (var i = 0; i < N; i++){
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25,
        vy: -(0.15 + Math.random() * 0.3)
      });
    }
    var t0 = performance.now();
    var DURATION = 1900;   // shimmer spans nearly the full ~2s transition
    function tick(now){
      var el = now - t0;
      var envelope = Math.sin(Math.min(1, el / DURATION) * Math.PI); // fades in then out
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++){
        var d = dots[i];
        d.y += d.vy;
        var tw = 0.4 + 0.6 * Math.sin(d.phase + el * 0.005 * (1 + d.speed));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 238, 196, ' + Math.max(0, tw * envelope) + ')';
        ctx.shadowColor = 'rgba(255, 224, 160, .9)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      if (el < DURATION) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(tick);
  }

  /* ---- splash video: silent, autoplay, crossfade in, then transition to hero ---- */
  function playSplash(){
    if (!video){ crossfadeToVideo(); setTimeout(finish, 100); return; }

    // The template ships without audio in splash.mp4 by design (music
    // handles the soundtrack instead) — muted keeps autoplay reliable
    // on every browser even if a client adds a track back later.
    video.muted = true;
    video.preload = 'auto';
    video.load();

    var played = false;
    function tryPlay(){
      if (played) return;
      var p = video.play();
      if (p && p.catch){
        p.then(function(){ played = true; crossfadeToVideo(); })
         .catch(function(){ skipToHero(); });
      } else {
        played = true; crossfadeToVideo();
      }
    }

    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('canplay', tryPlay, { once: true });
    // Safety net: never leave the visitor stuck on the poster.
    setTimeout(function(){ if (!played) tryPlay(); }, 1200);
  }

  function skipToHero(){ finish(); }

  function crossfadeToVideo(){
    videoWrap.classList.add('op-show');
    poster.classList.add('op-fade');
  }

  if (video){
    video.addEventListener('ended', finish, { once: true });
    // Extra safety net in case 'ended' doesn't fire on some mobile browsers.
    video.addEventListener('timeupdate', function onTime(){
      if (video.duration && video.currentTime >= video.duration - 0.15){
        video.removeEventListener('timeupdate', onTime);
        finish();
      }
    });
  }

})();
