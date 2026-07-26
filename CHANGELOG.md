# Changelog

All notable changes to this template are documented in this file.

## [2.3.0] — Stability & Performance Pass

### Fixed
- **Events-scroll jitter (root cause).** The camera-drive loop read
  `stage.clientWidth` every animation frame right after writing a
  `transform` style, forcing a synchronous layout recalculation
  ("layout thrashing") 60 times/sec. The value is now cached once and
  only refreshed on resize.
- **Hero/Events ghosting overlap.** The Hero fade-out window and the
  Events fade-in window overlapped by several percent of scroll
  progress, so both layered panels painted simultaneously. The
  windows are now non-overlapping with a safety gap.
- **Heart photo vanishing when scrolling back to Hero.** A `display:
  none` toggle (added to help with the overlap above) could stop the
  masked heart photo from repainting correctly in WebKit after
  returning from `display:none`. Removed in favor of opacity +
  visibility only, which doesn't share that issue.
- **Poster names overflowing the screen edges.** `white-space:nowrap`
  on the full "Groom & Bride" string prevented wrapping even when the
  rendered width exceeded the viewport. Each name is now its own
  unbreakable unit, with the row allowed to wrap between names/amp
  if needed — text can no longer clip past the screen edges.
- **Touch-to-open sometimes skipped the splash video.** A 12s
  failsafe timer started at page load instead of at the tap, so
  waiting near/past 12s before tapping could fire mid-video. It now
  starts from the tap itself.
- **Gallery tap-preview never auto-closed.** Tapping a photo now
  automatically closes the enlarged preview and resumes rotation
  after 3 seconds, with no second tap required.
- **Heart photo crop position.** `background-position` was `center`,
  which could crop through the face on portrait photos with the head
  in the upper part of the frame. Now biased toward the upper 25%.

### Changed
- Gallery auto-rotation speed increased ~17.5%.
- Gallery resume-after-release delay removed (already immediate from
  a prior fix); tap-preview interactions now share the same instant,
  eased resume.
- Hero and poster names now reveal with a one-time letter-by-letter
  stagger (fade + upward motion), scoped so it can't affect the
  gold-shimmer gradient rendering.
- `README.md`: corrected stale "soft backdrop" hero-photo wording
  (left over from an earlier, since-reverted design) and added a
  **Hero Photo Requirements** section (resolution, aspect ratio,
  minimum size, face placement, crop padding).

## [2.1.0] — Design Restoration & Fixes

### Fixed
- **3D hero background restored and embedded.** The palace scene
  layers, bell ornaments, and event-card gold frame are no longer
  stored as separate files in `assets/images/` — they're embedded
  directly in `css/style.css` as permanent, non-editable design
  assets, exactly as in the original design. This also makes them
  immune to broken relative paths after deployment.
- **Event card design fully preserved** — the ivory/gold card layout,
  border, and spacing remain hardcoded; only title, date, time, and
  a circular photo are configurable per event.
- **Event icons replaced with real circular photos**, stored in the
  new `assets/images/events/` folder and editable via `image` fields
  in `config.js`. Includes automatic fallback if an image is missing.
- **Location preview photo is no longer clickable** — only the "Open
  in Google Maps" button opens the map link, as intended.
- **Splash video audio removed**; background music now starts the
  instant the visitor taps "Touch to Open" (a single persistent
  instance, never restarting between sections).
- **Cinematic transition added** between the splash video and the
  Hero: a soft gold light sweep, gentle opacity fade, and a brief
  twinkling particle shimmer — replacing the previous instant cut.
- **Opening sequence (poster + splash video) now stays inside the
  same 9:16 frame** as the rest of the site, with the gold gradient
  background filling the sides on desktop — it no longer stretches
  full-width.

### Changed
- **Hero redesigned**: the heart-shaped photo frame was replaced with
  the couple's photo shown as a soft, low-opacity backdrop behind
  their names, keeping the names themselves as the clear visual
  focus. Added a letter-by-letter reveal animation, a slow glow
  pulse, and refined the existing gold-highlight shimmer.
- `config.js`: events now use an `image` path instead of a fixed
  `icon` keyword; `music.enabledByDefault` now defaults to `true`
  to match the new tap-to-start music behavior.

### Housekeeping
- Fixed two CSS bugs introduced during the previous refactor (a stray
  injected character and orphaned keyframe fragments) that were
  silently harmless but worth cleaning up; verified with a full
  brace-balance pass.
- Removed the now-unused `assets/images/scene/` and
  `assets/images/decor/` folders (their contents are embedded in CSS).

---

## [2.0.0] — Commercial Template Release

### Added
- **Central `config.js`** — every editable value (names, wedding
  date, countdown, events, venue, RSVP link, music default, theme
  colors) now lives in one file. The page reads everything from it
  at load time via `js/content.js`.
- **Opening cinematic sequence**: full-screen poster with the
  couple's names and a glowing/shimmering "Touch to Open" button,
  a canvas-based gold particle burst on tap, a crossfade into an
  autoplaying splash video (with sound), and a final crossfade into
  the Hero section. Scrolling is locked until the sequence completes.
- **Scroll guide hint**: a small animated hand icon shows briefly
  (~1s) the first time each section becomes visible, for first-time
  visitors only, tracked via `localStorage`. Dismissed instantly and
  permanently the moment a visitor scrolls on their own.
- **Modular JavaScript**: split the former single inline script into
  `scene.js`, `gallery.js`, `music.js`, `countdown.js`, `location.js`,
  `content.js`, `poster.js`, and `scroll-guide.js`.
- **External `css/style.css`** replacing the previous inline
  `<style>` block, with a `:root` theme-variable block driven by
  `config.js`.
- **Real asset files**: all previously base64-embedded images were
  extracted into `assets/images/`, removing ~900KB of inline data
  from the page and enabling proper browser caching.
- **README.md** with full instructions for non-technical clients
  (changing names/dates/events/venue, replacing photos/video/music,
  publishing to GitHub Pages, supported formats and sizes).

### Changed
- Background music now loads a real file
  (`assets/music/wedding.mp3`) instead of only a generated tone; the
  generated ambient tone is now a graceful fallback if the file is
  ever missing or fails to load.
- Google Maps location switched from a placeholder query to a
  fully configurable venue (`config.js: venue.mapsLink` /
  `mapsEmbedQuery`), still lazy-loaded on tap.
- Gallery photos and event cards are now rendered at runtime rather
  than hardcoded in HTML, so adding/removing events requires no
  markup changes.

### Performance
- Deduplicated two accidentally-duplicated embedded images found
  during the asset extraction.
- Poster/splash assets are optimised for mobile delivery (video
  re-encoded to 720p with faststart flag; poster and content photos
  compressed to sensible file sizes).
- All new opening-sequence and scroll-guide animations use only
  GPU-friendly `transform`/`opacity` properties.

---

## [1.x] — Prior iterative development

Earlier versions of this project were developed as a single
self-contained HTML file with all images embedded as base64 data
URIs, and progressively added:
- The scroll-driven 3D palace camera journey (4 sections, 3
  cinematic zoom transitions).
- Swinging bell ornaments, gold-dust particles, and depth-layered
  parallax.
- The heart-shaped couple photo frame.
- The Events, Photo Gallery, and Location foreground sections.
- The rolling 3D photo gallery with momentum-based drag and
  tap-to-center.
- The global, persistent background music controller.
- Numerous bug fixes: gallery touch/drag responsiveness, hero image
  stretching, real Google Maps integration, countdown box alignment,
  and general 60 FPS performance hardening.

These are consolidated into the single **2.0.0** release above, which
is the first version organised as a reusable, config-driven template.
