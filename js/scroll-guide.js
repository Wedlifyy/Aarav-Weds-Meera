/* ================================================================
   PREMIUM HERO SCROLL GUIDE + SMART AUTO SCROLL ENGINE
   ----------------------------------------------------------------
   1. Premium Gold Hand Scroll Guide:
      Displays a gold hand icon with upward swipe gesture, glowing
      pulse aura, and "Scroll to Explore" label after Hero loads.
      ALWAYS appears on every fresh page load / reload (no storage).
      Hides cleanly as soon as the visitor scrolls the Hero section.

   2. Smart Auto Scroll Engine:
      Triggers after 5 seconds of inactivity post-Hero load.
      Scrolls sequentially: Hero (0) -> Events (1) -> Gallery (2) -> Location (3).
      Fixed duration: 2.2s per section transition, 2.0s pause.
      Stops upon reaching Location. Never loops.

   3. Instant Cancellation & Lock:
      Prevents rapid wheel / reverse delta fluctuations.
      Any user gesture immediately cancels auto-scroll and restores
      native 60 FPS control to the visitor.
   ================================================================ */
(function(){
  var hint = document.getElementById('scrollGuide');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Always reset in memory on every fresh page load
  var dismissed = false;

  var autoScrollCancelled = false;
  var isAutoScrolling = false;
  var autoScrollRaf = null;
  var inactivityTimer = null;
  var sectionPauseTimer = null;
  var heroReady = false;
  var listenersAttached = false;

  // Dismiss hand scroll guide (per page load)
  function dismissGuide(){
    if (dismissed) return;
    dismissed = true;
    if (hint) {
      hint.classList.remove('on');
      hint.classList.add('hide');
      setTimeout(function(){
        if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
      }, 600);
    }
  }

  // Cancel Auto Scroll immediately & permanently for current page session
  function cancelAutoScroll(reason){
    if (autoScrollCancelled) return;
    autoScrollCancelled = true;

    if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; }
    if (sectionPauseTimer) { clearTimeout(sectionPauseTimer); sectionPauseTimer = null; }
    if (autoScrollRaf) { cancelAnimationFrame(autoScrollRaf); autoScrollRaf = null; }

    isAutoScrolling = false;
    dismissGuide();
    detachInteractionListeners();
  }

  function onUserInteraction(e){
    // Ignore clicks on opening poster button if opening layer is still active
    var op = document.getElementById('opening');
    if (op && !op.classList.contains('op-hidden') && !heroReady) return;

    // Ignore tiny reverse wheel jitter during active transition to prevent fluctuation
    if (e && e.type === 'wheel' && isAutoScrolling && e.deltaY < 0 && Math.abs(e.deltaY) < 4) {
      return;
    }

    cancelAutoScroll('user-input');
  }

  var interactionEvents = ['wheel', 'touchmove', 'touchstart', 'mousedown', 'pointerdown', 'keydown'];
  function attachInteractionListeners(){
    if (listenersAttached) return;
    listenersAttached = true;
    interactionEvents.forEach(function(evt){
      window.addEventListener(evt, onUserInteraction, { passive: true, capture: true });
    });
  }
  function detachInteractionListeners(){
    if (!listenersAttached) return;
    listenersAttached = false;
    interactionEvents.forEach(function(evt){
      window.removeEventListener(evt, onUserInteraction, { capture: true });
    });
  }

  // Exact cubic ease-in-out curve for cinematic scrolling
  function easeInOutCubic(t){
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function getSectionPositions(){
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return [0, 0, 0, 0];
    return [0, maxScroll * 0.333333, maxScroll * 0.666667, maxScroll];
  }

  var currentSectionIdx = 0;

  function scrollToNextSection(){
    if (autoScrollCancelled || reduce || isAutoScrolling) return;
    var positions = getSectionPositions();
    if (currentSectionIdx >= positions.length - 1){
      cancelAutoScroll('finished');
      return;
    }

    var nextIdx = currentSectionIdx + 1;
    var startY = window.scrollY;
    var targetY = positions[nextIdx];
    var distance = targetY - startY;

    if (Math.abs(distance) < 5){
      currentSectionIdx = nextIdx;
      scheduleNextSection();
      return;
    }

    isAutoScrolling = true;
    var duration = 2200; // Exact 2.2s transition time for every section
    var startTime = performance.now();

    function step(now){
      if (autoScrollCancelled) return;

      var elapsed = now - startTime;
      var progress = Math.min(1, elapsed / duration);
      var easeVal = easeInOutCubic(progress);

      var currentY = startY + distance * easeVal;
      window.scrollTo(0, currentY);

      if (progress < 1){
        autoScrollRaf = requestAnimationFrame(step);
      } else {
        autoScrollRaf = null;
        isAutoScrolling = false;
        currentSectionIdx = nextIdx;
        scheduleNextSection();
      }
    }

    autoScrollRaf = requestAnimationFrame(step);
  }

  function scheduleNextSection(){
    if (autoScrollCancelled || reduce) return;
    if (currentSectionIdx >= 3){
      cancelAutoScroll('finished');
      return;
    }
    // Pause exactly 2.0 seconds at each section
    sectionPauseTimer = setTimeout(function(){
      sectionPauseTimer = null;
      scrollToNextSection();
    }, 2000);
  }

  function startAutoScrollSequence(){
    if (autoScrollCancelled || reduce) return;
    dismissGuide();
    currentSectionIdx = 0;
    scrollToNextSection();
  }

  function onHeroReady(){
    if (heroReady || autoScrollCancelled) return;
    heroReady = true;

    // Show hand scroll guide (always on every reload)
    if (!dismissed && hint) {
      hint.classList.add('on');
    }

    // Attach listeners after Hero is visible
    attachInteractionListeners();

    // 5-second inactivity timer
    inactivityTimer = setTimeout(function(){
      inactivityTimer = null;
      if (!autoScrollCancelled && window.scrollY < 50) {
        startAutoScrollSequence();
      }
    }, 5000);
  }

  function init(){
    if (reduce) {
      dismissGuide();
      return;
    }

    // Wait until opening cinematic completes
    document.addEventListener('opening:complete', onHeroReady, { once: true });

    // Fallback if opening component is missing or already complete
    var op = document.getElementById('opening');
    if (!op || op.classList.contains('op-hidden')) {
      setTimeout(onHeroReady, 1000);
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
