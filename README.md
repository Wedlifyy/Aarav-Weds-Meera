# Luxury Wedding Invitation Template

A premium, single-page, cinematic wedding invitation website: a gold
palace scene rendered in a scroll-driven 3D camera journey, an
opening poster + splash video sequence, a rolling photo gallery, an
events timeline with countdown, and a location section with Google
Maps — all running at a smooth 60 FPS on desktop, Android, and iPhone.

**You do not need to know how to code to use this template.** Almost
everything you'll want to change lives in **one file** — `config.js`
— plus a folder of images/video/music you replace by filename.

---

## Quick start

1. Open `config.js` in any text editor and change the names, date,
   events, and venue (see [Editing config.js](#editing-configjs) below).
2. Replace the files inside `assets/` with your own photos, poster,
   splash video, and music — **keep the exact filenames** (see
   [Replacing assets](#replacing-assets) below).
3. Upload the whole folder to GitHub Pages, Netlify, or any static
   host (see [Publishing](#publishing-to-github-pages)).

That's it — you never need to open `index.html`, `css/style.css`, or
anything inside `js/`.

---

## Folder structure

```
Wedding-Template/
│
├── index.html            <- the page itself (do not edit)
├── config.js              <- ALL editable text/data lives here
├── README.md               <- this file
├── CHANGELOG.md
│
├── assets/
│   ├── poster/
│   │   └── poster.jpg          <- opening poster background
│   ├── videos/
│   │   └── splash.mp4          <- opening splash video (NO audio —
│   │                               see "Splash video has no sound" below)
│   ├── music/
│   │   └── wedding.mp3         <- background music
│   ├── images/
│   │   ├── hero-photo.jpg      <- couple photo inside the gold heart
│   │   │                          frame on the Hero screen
│   │   ├── gallery-1.jpg       <- photo gallery, slot 1
│   │   ├── gallery-2.jpg       <- photo gallery, slot 2
│   │   ├── gallery-3.jpg       <- photo gallery, slot 3
│   │   ├── gallery-4.jpg       <- photo gallery, slot 4
│   │   ├── location-preview.jpg<- venue preview photo (not clickable —
│   │   │                          see "Location section" below)
│   │   ├── logo.png            <- optional couple monogram (advanced)
│   │   └── events/             <- circular event card photos
│   │       ├── haldi.jpg
│   │       ├── wedding-ceremony.jpg
│   │       ├── reception.jpg
│   │       └── brunch.jpg
│
├── css/
│   └── style.css          <- all styling, INCLUDING the embedded 3D
│                              palace background, bells, and event
│                              card frame (advanced editors only)
│
└── js/
    ├── content.js          <- reads config.js, fills in the page
    ├── poster.js           <- opening poster/splash sequence
    ├── scene.js            <- the 3D palace scene + camera
    ├── gallery.js           <- rolling photo gallery
    ├── countdown.js        <- the countdown timer
    ├── music.js            <- background music controller
    ├── location.js          <- lazy-loaded Google Map
    └── scroll-guide.js     <- first-time "swipe up" hint
```

**What's NOT in the assets folder, and why:** the 3D palace background,
the swinging bell ornaments, and the ornate gold event-card frame are
permanent parts of this template's design. They're embedded directly
inside `css/style.css` as the site loads — not stored as separate
image files — specifically so they can never be accidentally replaced
or broken by editing the assets folder. Everything you *are* meant to
customise is listed with a `<-` comment above.

---

## Editing config.js

Open `config.js` in any text editor (Notepad, VS Code, TextEdit —
anything that saves plain text). It is organised into clearly labeled
blocks. Look for headers like:

```js
// ============================
// CHANGE COUPLE NAMES HERE
// ============================
```

### How to change names

```js
couple: {
  groomName: "Aarav",
  brideName: "Meera",
  initials: "",              // leave blank to auto-generate "A & M"
  quote: "We promise to love, laugh\nand grow together forever"
}
```
`\n` inside a quote string creates a manual line break. Delete it to
let the sentence wrap naturally instead.

### How to change the wedding date & countdown

```js
wedding: {
  date: "2026-12-21T06:30:00+05:30",
  displayDay: "", displayNum: "", displayMonth: "", displayYear: ""
}
```
The `date` field alone drives **both** the live countdown timer and
the "SAT · 21 · DEC · 2026" row under the couple's names. The
`display*` fields are optional manual overrides — leave them blank
(`""`) and they will be computed automatically from `date`.

The format is `YYYY-MM-DDTHH:MM:SS+HH:MM` (ISO 8601). The `+05:30`
part is the timezone offset of the wedding venue (India Standard
Time in the default example) — change it to match your venue's
timezone so the countdown is accurate for guests anywhere.

### How to change event details

```js
events: [
  { title: "Haldi Ceremony",   date: "19 Dec 2026", time: "10:00 AM", image: "assets/images/events/haldi.jpg" },
  { title: "Wedding Ceremony", date: "21 Dec 2026", time: "06:30 AM", image: "assets/images/events/wedding-ceremony.jpg" },
  ...
]
```
Add, remove, or reorder entries freely — the Events section renders
exactly this list, in this order. The premium card design itself
(ivory background, gold border, rounded shape, spacing) is fixed and
not editable — only the title, date, time, and circular photo for
each event come from `config.js`.

`image` points to a small circular photo shown on the left of the
card — see [Replacing event images](#replacing-event-images) below.
If a path is ever missing or a file fails to load, the template
automatically falls back to a default image rather than showing a
broken icon.

### How to change the venue / Google Maps

```js
venue: {
  name: "Cubbon Park, Bengaluru",
  address: "Kasturba Road, Sampangi Rama Nagara,\nBengaluru, Karnataka 560001",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=12.9763%2C77.5929",
  mapsEmbedQuery: "12.9763,77.5929"
}
```
Easiest way to get `mapsLink`: open Google Maps, search your venue,
tap **Share → Copy link**, and paste it in. `mapsEmbedQuery` can be a
`"latitude,longitude"` pair (recommended, most reliable) or a plain
address/place name.

### How to change RSVP, music default, and theme colors

```js
rsvp:  { link: "" },                 // e.g. a Google Form URL
music: { enabledByDefault: false },  // true = auto-plays after intro
theme: {
  gold: "#b78a3c", goldDeep: "#8f6a2a", goldLight: "#e8c76f",
  ivory1: "#f3e2c0", ivory2: "#dcbe8a"
}
```
`theme` recolors the primary gold accent (buttons, icon strokes) and
the ivory page background wash. The template's detailed tonal
shading elsewhere is intentionally fixed to preserve the premium
look — for a full re-skin, a developer can adjust `css/style.css`.

---

## Replacing assets

All of these are found by **exact filename** — you don't need to
edit any code, just overwrite the file with your own using the
**same name and folder**.

| Replace this file                     | With...                                   |
|----------------------------------------|--------------------------------------------|
| `assets/poster/poster.jpg`             | Your opening poster background photo       |
| `assets/videos/splash.mp4`             | Your opening splash/intro video (**no audio needed** — see below) |
| `assets/music/wedding.mp3`             | Your background music track                |
| `assets/images/hero-photo.jpg`         | Couple photo shown inside the gold heart frame on the Hero screen |
| `assets/images/gallery-1.jpg` … `-4.jpg` | Your 4 gallery photos                    |
| `assets/images/location-preview.jpg`   | A photo of your venue (preview only — see below) |
| `assets/images/events/*.jpg`           | Circular photo for each event card         |
| `assets/images/logo.png`               | Optional monogram/logo (transparent PNG)   |

### Supported formats & recommended sizes

| Asset | Formats | Recommended size |
|---|---|---|
| Photos (`hero-photo`, `gallery-*`, `location-preview`) | `.jpg` (recommended) or `.png` | Portrait, **900–1200px wide**, under ~300KB each for fast loading |
| Event photos (`events/*.jpg`) | `.jpg` or `.png` | **300×300px**, square — they're cropped into a circle automatically |
| Poster (`poster.jpg`) | `.jpg` | Portrait **9:16** (e.g. 1080×1920), under ~500KB |
| Splash video (`splash.mp4`) | `.mp4` (H.264, **video only — no audio track**) | Portrait **9:16**, **3–8 seconds**, 720p is plenty — keep it under ~3–5MB so it starts instantly on mobile data |
| Music (`wedding.mp3`) | `.mp3` | Any length (it loops); keep under a few MB |
| Logo (`logo.png`) | `.png` with transparency | Square, at least 400×400px |

> **Tip:** if a photo you add is landscape or a different aspect
> ratio, the template will automatically crop it to fill its frame
> (like Instagram) — just make sure the important part of the photo
> is centered.

### Replacing the poster image

Overwrite `assets/poster/poster.jpg` with your own portrait photo.
It's shown full-screen (within the site's 9:16 frame) behind the
couple's names and the "Touch to Open" button before the splash
video plays.

### Replacing the splash video

Overwrite `assets/videos/splash.mp4` with your own video (must stay
named `splash.mp4`, `.mp4`/H.264 format). It plays automatically,
**silently**, right after the visitor taps "Touch to Open" — the
background wedding music (see below) provides the soundtrack
instead, so **your video does not need an audio track** (if it has
one, it will simply be ignored/muted). When the video ends, a soft
gold light transition fades the page into the Hero section.

### Replacing gallery photos

Overwrite `assets/images/gallery-1.jpg` through `gallery-4.jpg` with
your own photos (same filenames). They appear in the rotating 3D
photo carousel in that order.

### Replacing the hero image

Overwrite `assets/images/hero-photo.jpg` with your own couple photo.
It's shown inside the ornate gold heart frame at the top of the Hero
screen, above your names — the heart shape itself is a fixed design
element (like the poster and 3D background), so only the photo
changes.

#### Hero Photo Requirements

For the best result inside the heart frame, follow these guidelines:

| | Recommendation |
|---|---|
| **Resolution** | 1080×1350px (or similar) |
| **Aspect ratio** | 4:5 portrait |
| **Minimum size** | 800×1000px |
| **Face placement** | Face centered horizontally, head occupying roughly the **upper 40%** of the frame |
| **Crop padding** | Leave some padding around the shoulders — don't crop right at the head/shoulders, since the heart shape crops its own edges on top of that |

Example: a 1080×1350 photo with both faces centered and the heads
sitting in the upper part of the frame (not dead-center) will look
best, since the heart frame is naturally wider at the top and
narrows toward the bottom point.

### Replacing event images

Each event card shows a small circular photo on the left. Overwrite
the files inside `assets/images/events/` — or point an event's
`image` field in `config.js` at any file you like inside that folder
(see [How to change event details](#how-to-change-event-details)).
Recommended size: **300×300px**, square, JPG or PNG — any photo works,
since it's automatically cropped into a circle.

The card itself — its ivory-and-gold background, decorative border,
rounded shape, and layout — is part of the fixed template design and
is not replaceable; only the title, date, time, and this circular
photo can be changed.

### Replacing the music

Overwrite `assets/music/wedding.mp3` with your own track (must stay
named `wedding.mp3`). With `music.enabledByDefault: true` in
`config.js` (the default), it starts automatically the moment a
visitor taps "Touch to Open" and continues seamlessly through the
splash video and every section afterward — it never restarts as they
scroll. The floating gold music icon (visible in every section) lets
visitors turn it on/off at any time. If the file is ever missing or
fails to load, the icon automatically falls back to a soft generated
tone so it's never broken during a preview.

### Replacing Google Maps

No file to replace — just edit `venue.mapsLink` and
`venue.mapsEmbedQuery` in `config.js` (see above). Note that in the
Location section, the venue **preview photo is not clickable** — only
the "Open in Google Maps" button opens the link, in a new tab.

### Changing event details

Edit the `events` array in `config.js` (see above) — no HTML editing
required, even if you add or remove events.

---

## Publishing to GitHub Pages

1. Create a new repository on GitHub (e.g. `our-wedding`).
2. Upload every file/folder from this template into the repository
   (drag-and-drop works fine on github.com, or use `git push`).
3. In the repository, go to **Settings → Pages**.
4. Under **Source**, choose the `main` branch and the `/ (root)`
   folder, then click **Save**.
5. GitHub will give you a live URL, usually
   `https://<your-username>.github.io/our-wedding/` — this may take
   1–2 minutes to go live the first time.

No build step, no server, no database — it's a static site, so
GitHub Pages, Netlify, Vercel, or plain shared hosting all work.

---

## Performance notes

- All animations use GPU-accelerated `transform`/`opacity` only —
  no layout-triggering properties are animated.
- The splash video and Google Map are **lazy-loaded** (the map only
  loads after the visitor taps "View Map"; the video only loads once
  the visitor taps "Touch to Open").
- The gold-dust particle effect and shimmer animation automatically
  pause once the Location section is reached, to keep scrolling
  buttery on older phones.
- All animation loops pause automatically when the browser tab is
  hidden (saves battery, avoids a "jump" when you return).
- The whole site — including the opening poster/splash sequence —
  stays inside a **9:16 portrait frame** at all times. On wide
  desktop screens it's centered with the same gold gradient filling
  the sides; it never stretches full-width.
- The 3D palace background, bells, and event-card frame are embedded
  directly in `css/style.css` rather than loaded as separate image
  files, so they render instantly with the very first paint and can
  never be broken by a missing asset file.

---

## Support / notes for developers

- `js/scene.js`, `js/gallery.js`, `js/music.js`, `js/countdown.js`,
  `js/location.js`, `js/poster.js`, and `js/scroll-guide.js` are each
  self-contained modules — safe to read independently.
- `js/content.js` is the only file that reads `config.js`; if you add
  a new config field, render it there.
- Theme colors are exposed as CSS custom properties on `:root`
  (`--gold`, `--gold-deep`, `--gold-light`, `--ivory-1`, `--ivory-2`)
  set at runtime by `content.js` from `config.js`.

---

Made with love, gold leaf, and a little bit of JavaScript. 🤍
