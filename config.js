/* ================================================================
   WEDDING WEBSITE — CENTRAL CONFIGURATION
   ================================================================
   Edit the values inside WEDDING_CONFIG below to customise the
   entire website for a new couple. You do NOT need to touch any
   HTML, CSS, or other JavaScript file — everything on the page
   reads its text and links from here.

   To replace PHOTOS, VIDEOS, or MUSIC, just overwrite the files
   inside the assets/ folder using the exact same filenames:

     assets/poster/poster.jpg        - opening poster background
     assets/videos/splash.mp4        - opening splash video
                                        (video only — no audio track;
                                        the background music plays
                                        instead, see `music` below)
     assets/music/wedding.mp3        - background music
     assets/images/hero-photo.jpg    - soft couple photo behind the
                                        names on the Hero screen
     assets/images/gallery-1.jpg     - photo gallery, slot 1
     assets/images/gallery-2.jpg     - photo gallery, slot 2
     assets/images/gallery-3.jpg     - photo gallery, slot 3
     assets/images/gallery-4.jpg     - photo gallery, slot 4
     assets/images/location-preview.jpg - venue preview photo
                                        (a preview only — it is not
                                        clickable; the "Open in Google
                                        Maps" button is what links out)
     assets/images/events/*.jpg      - circular photo for each event
                                        card (see `events` below)
     assets/images/logo.png          - optional couple monogram/logo
                                        (leave blank/transparent to
                                        use the auto-generated text
                                        initials instead)

   NOTE: the 3D palace background, the bell ornaments, and the gold
   event-card frame are permanent parts of the template's design.
   They are embedded directly in css/style.css (not stored as files),
   and are intentionally NOT editable through config.js or the
   assets/ folder — see README.md for details.

   See README.md for full instructions, supported formats, and
   recommended image/video sizes.
   ================================================================ */

window.WEDDING_CONFIG = {

  // ============================
  // CHANGE COUPLE NAMES HERE
  // ============================
  couple: {
    groomName: "Aarav",
    brideName: "Meera",
    // Shown on the opening poster screen (e.g. "A & M"). Leave blank
    // to auto-generate from the first letters of the names above.
    initials: "",
    // Use \n for a manual line break, or leave the sentence to wrap
    // naturally on its own.
    quote: "We promise to love, laugh\nand grow together forever"
  },

  // ============================
  // CHANGE WEDDING DATE & COUNTDOWN HERE
  // ============================
  wedding: {
    // ISO 8601 date-time with timezone offset. This single value
    // drives BOTH the countdown timer and the "Save the Date" row.
    date: "2026-12-21T06:30:00+05:30",

    // Optional manual overrides for the "Save the Date" row
    // (FRI | 21 | DEC  2026). Leave any of these blank ("") to have
    // them computed automatically from the date above.
    displayDay:   "",   // e.g. "FRI"
    displayNum:   "",   // e.g. "21"
    displayMonth: "",   // e.g. "DEC"
    displayYear:  ""    // e.g. "2026"
  },

  // ============================
  // CHANGE EVENT DETAILS HERE
  // ============================
  // Add, remove, or reorder events freely — the Events section
  // renders exactly this list, using the premium hardcoded gold
  // card design (that design itself is not editable — see README).
  //
  // ============================
  // CHANGE EVENT IMAGES HERE
  // ============================
  // `image` is a small circular photo shown on the left of each
  // card. Point it at a file inside assets/images/events/.
  // Recommended: 300×300px, square, JPG or PNG. Any photo works —
  // circular cropping is applied automatically by the template.
  events: [
    { title: "Haldi Ceremony",    date: "19 Dec 2026", time: "10:00 AM", image: "assets/images/events/haldi.jpg" },
    { title: "Wedding Ceremony",  date: "21 Dec 2026", time: "06:30 AM", image: "assets/images/events/wedding-ceremony.jpg" },
    { title: "Reception",         date: "21 Dec 2026", time: "07:00 PM", image: "assets/images/events/reception.jpg" },
    { title: "Thank You Brunch",  date: "22 Dec 2026", time: "10:00 AM", image: "assets/images/events/brunch.jpg" }
  ],

  // ============================
  // CHANGE VENUE / LOCATION HERE
  // ============================
  venue: {
    name: "Taj Hotel, Bengaluru",
    // Use \n for a manual line break in the address.
    address: "2275, Tumkur Rd, Yeshwanthpur Industrial Area, Phase 1, Yeswanthpur, \nBengaluru, Karnataka 560022",
    // Full Google Maps link — used by both the preview photo and the
    // "Open in Google Maps" button. Easiest way to get this: open
    // Google Maps, find the venue, tap Share, and copy the link.
    mapsLink: "https://www.google.com/maps/search/?api=1&query=13.030108244759875,77.54127550000511",
    // What gets embedded in the on-page map preview after the visitor
    // taps "View Map". A "lat,lng" pair works everywhere; a place
    // name/address also works in most cases.
    mapsEmbedQuery: "13.030108244759875,77.54127550000511"
  },

  // ============================
  // CHANGE RSVP LINK HERE (optional)
  // ============================
  rsvp: {
    // Leave blank to hide any future RSVP button. Point this at a
    // Google Form, Tally, WhatsApp link, etc.
    link: ""
  },

  // ============================
  // MUSIC ON/OFF DEFAULT
  // ============================
  music: {
    // If true (recommended), background music starts the instant the
    // visitor taps "Touch to Open" — that tap is the user gesture
    // that satisfies browser autoplay policies, so the music can
    // begin right away and keep playing smoothly through the splash
    // video and into the Hero, with no restart between sections.
    // If false, music stays off until the visitor taps the floating
    // gold music icon themselves.
    enabledByDefault: true
  },

  // ============================
  // CHANGE THEME COLORS HERE
  // ============================
  // These control the primary gold accent and the ivory background
  // wash used across the site (buttons, icon strokes, page backdrop).
  // The fine tonal shading used in text/shadows throughout the
  // template is intentionally fixed to preserve the premium look.
  theme: {
    gold:      "#b78a3c",
    goldDeep:  "#8f6a2a",
    goldLight: "#e8c76f",
    ivory1:    "#f3e2c0",
    ivory2:    "#dcbe8a"
  },

  // ============================
  // SOCIAL LINKS (optional)
  // ============================
  // Not shown in the current layout, but available for future use
  // (e.g. a footer or share button) without needing to touch config
  // again later.
  social: {
    instagram: "",
    whatsapp: ""
  }
};
