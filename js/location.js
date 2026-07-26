/* ================================================================
   LOCATION — lazy-loaded Google Map
   The map iframe is NOT created until the visitor taps "View Map".
   Until then only the static preview image + button are shown,
   which keeps the Location section fast and lag-free.

   The venue coordinates/link come from config.js:
     WEDDING_CONFIG.venue.mapsEmbedQuery  -> "lat,lng" or a place query
     WEDDING_CONFIG.venue.mapsLink        -> full Google Maps URL
                                              (used by content.js for the
                                               clickable preview + button)
   ================================================================ */
(function(){
  var cfg = window.WEDDING_CONFIG || {};
  var venue = cfg.venue || {};
  var query = encodeURIComponent(venue.mapsEmbedQuery || venue.name || 'Bengaluru, India');

  var cta = document.getElementById('mapCta');
  var box = document.getElementById('locMap');
  var overlay = document.getElementById('locPreviewOverlay');
  var closeBtn = document.getElementById('locPreviewClose');
  if (!cta || !box) return;

  function setHoverState(el, active){
    if (!el) return;
    el.classList.toggle('is-hovered', active);
    if (!active) el.classList.remove('is-pressed');
  }

  function bindInteractive(el){
    if (!el || el.__locBound) return;
    el.__locBound = true;
    el.addEventListener('pointerenter', function(){ setHoverState(el, true); }, { passive: true });
    el.addEventListener('pointerleave', function(){ setHoverState(el, false); }, { passive: true });
    el.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      el.classList.add('is-pressed');
    }, { passive: true });
    el.addEventListener('pointerup', function(){ setHoverState(el, false); }, { passive: true });
    el.addEventListener('pointercancel', function(){ setHoverState(el, false); }, { passive: true });
    el.addEventListener('focus', function(){ setHoverState(el, true); }, { passive: true });
    el.addEventListener('blur', function(){ setHoverState(el, false); }, { passive: true });
  }

  document.querySelectorAll('.ev-card').forEach(bindInteractive);

  cta.addEventListener('click', function(){
    if (box.querySelector('iframe')) return;   // already loaded

    var f = document.createElement('iframe');
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.setAttribute('title', 'Venue map');
    f.src = 'https://maps.google.com/maps?q=' + query + '&hl=en&z=15&output=embed';
    box.appendChild(f);

    requestAnimationFrame(function(){
      f.classList.add('on');
      cta.style.opacity = '0';
      setTimeout(function(){ cta.style.display = 'none'; }, 450);
    });
  });

  // ---- Tap the venue preview photo: open a premium in-page preview
  // without changing the page position or breaking the existing card animation.
  var photo = document.querySelector('.loc-frame[data-lc="photo"]');
  if (photo) {
    bindInteractive(photo);
    photo.setAttribute('tabindex', '0');
    photo.setAttribute('role', 'button');
    photo.setAttribute('aria-label', 'Preview venue photo');

    function setPreviewOpen(open){
      if (!overlay) return;
      overlay.classList.toggle('is-open', open);
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      photo.classList.toggle('zoomed', open);
    }

    function openZoom(e){
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setPreviewOpen(true);
    }

    function closePreview(){
      setPreviewOpen(false);
    }

    photo.addEventListener('click', openZoom);
    if (closeBtn) closeBtn.addEventListener('click', closePreview);
    if (overlay) {
      overlay.addEventListener('click', function(e){
        if (e.target === overlay || e.target.hasAttribute('data-loc-preview-close')) closePreview();
      });
    }
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closePreview();
    });
    photo.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openZoom(e); }
    });
  }
})();
