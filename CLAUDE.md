# Verkeersschool Joop Hagen — website

Static site (HTML + CSS + vanilla JS) for a driving school in Deventer. Replaces the old site at deventer.joophagen.nl.
Live preview: https://risimorina.github.io/joophagen-website/ (GitHub Pages, until the real domain is known).

## Client

| | |
|---|---|
| Name (exact) | Verkeersschool Joop Hagen (also "Rijschool Joop Hagen" on socials) |
| Trade | Driving school: AM (scooter), B (auto, schakel + automaat, 2toDrive), A1/A2/A (motor), BE (aanhanger), C/CE (vrachtwagen), taxipas, theorie |
| Address | Hunneperkade 42, 7418 BT Deventer |
| Phone | 0570 63 50 36 (`tel:+31570635036`) |
| Email | info@joophagen.nl |
| Hours | ma t/m vr 09:00–17:30, za 11:00–16:00 (to be confirmed by client) |
| KvK | 08114076 |
| WhatsApp | TODO: unknown. The landline cannot be used for WhatsApp. |
| Socials | Instagram @rijschooljoophagen, Facebook RijschoolJoopHagen. TikTok: TODO |
| Contact person | Sabine. All open questions for her live in `docs/vragen-voor-sabine.md` (Dutch). Keep that file current. |

Owner wishes so far: none stated beyond what is in `docs/vragen-voor-sabine.md`. Claims taken from the old site ("50 jaar", "nummer één vrachtwagen", pass rates, Google 4,3 / 193 reviews, reviewer names) are **unconfirmed**. Don't add new ones.

Languages: Dutch + English (the client did not ask for English; it was added and is listed as a question for Sabine).

## What this repo contains

1. **Root site** (`/*.html`): the current full site. Pages: `index`, `diensten`, `webshop`, `vacatures`, `contact`, `privacy`.
2. **`ontwerpen/`**: three alternative designs for Sabine to choose from (`noindex`). The chooser page is `ontwerpen/index.html`. Each design reuses the root `css/styles.css` and `js/` and adds its own `design.css` on top:
   - `ontwerp-1`: Compact. Short hero left, big vehicle tiles right, one screen (`tiles.js`).
   - `ontwerp-2`: App-style. The licence chooser is the hero, with a sticky action bar on phones.
   - `ontwerp-3`: Classic. Light hero with the fleet photo, split licence cards, three reasons (`panels.js`).
   - Screenshots for the chooser are in `ontwerpen/screens/`.

**Chosen variation: not chosen yet.** Once Sabine picks one, merge it into the root and remove `ontwerpen/`.

## Design

- Trade file: none fits (there is no driving-school file in `~/.claude/design-trades/`).
- Concept: road and traffic. Navy like asphalt at night, Joop Hagen orange from the brand, lane-marking yellow as a sparse accent (dashed "lane" dividers), and car/gear drawings.
- Memorable elements: the licence chooser ("Welk rijbewijs wil je halen?"), with line drawings per vehicle, and the schakel/automaat gear control (H-gate vs P-R-N-D) in the Auto B panel and the contact wizard.
- Typefaces:
  - **Overpass** (display, 400–800): based on Highway Gothic, the road-sign typeface. That is why it fits a driving school.
  - **Work Sans** (body, 400–600): plain and very readable on phones.
  - Both come from Google Fonts.
- Palette (CSS variables in `css/styles.css` `:root`):

| Variable | Hex | Use |
|---|---|---|
| `--ink` | `#081B30` | Deep navy: headings, dark sections |
| `--ink-black` | `#050D18` | Footer, mobile menu |
| `--route` | `#E8760F` | Joop Hagen orange: primary buttons, accents (`--route-light` `#FFA24A`, `--route-dark` `#A6440A`) |
| `--lane` | `#F4B400` | Lane-marking yellow, used sparsely |
| `--paper` | `#FAF9F6` | Warm off-white background (`--paper-dim` `#F1EEE7`, `--line` `#E4DFD3`) |
| `--text` | `#1B242D` | Body text (`--text-soft` `#56616C`) |

Other tokens: `--hh` (header height, overridden per design), `--container` 1160px, `--radius` 16px / `--radius-sm` 10px, `--shadow-sm|md|lg`.

## Structure and conventions

```
/            *.html pages (stay in root so URLs don't change), CLAUDE.md, .gitignore
├─ css/      styles.css
├─ js/       all site scripts; js/lang/ holds the translation files (en.js)
├─ images/   photos, logo, favicon.png, og-image.jpg (PDFs are git-ignored)
├─ docs/     notes, not served as pages (vragen-voor-sabine.md)
└─ ontwerpen/  the three design options (see above)
```

- `css/`: all shared styles in one file (~1600 lines). Image paths inside it are `../images/...`.
- `js/`: one small script per feature, loaded with `js/<name>.js`:
  - `site.js`: SINGLE SOURCE for business details (name, address, phone, email, KvK, socials, url, opening hours). Renders the footer (#site-footer), opening-hours tables and LocalBusiness JSON-LD. Must load BEFORE i18n.js. Change hours/details here only.
  - `i18n.js` + `lang/en.js`: NL|EN switch. Dutch text lives in the HTML; `lang/en.js` maps Dutch string -> English. Use `t('Nederlandse tekst')` in JS for translatable strings. Reviews stay Dutch.
  - `script.js`: mobile nav, general behaviour.
  - `chooser.js`: licence tabs/panels (roving tabindex, arrow keys).
  - `gear-scene.js` + `gear.js`: the shared schakel/automaat component, and the script that mounts it in the Auto B panel. The contact wizard uses `gear-scene.js` too.
  - `contact-wizard.js`: turns the contact form into 4 steps. The plain form keeps working without JS.
  - `reviews.js`: scroll-snap reviews carousel; the arrows hide when all reviews fit.
  - `intro.js`: homepage intro overlay skip (the animation itself is CSS).
  - `why.js`: the "Waarom" cards. The HTML/CSS default is a static 2x2 grid, each card an <article> whose headline is a <button> (its ::after covers the card) that opens a pop-up. At >=900px with motion it pins the section and stacks the cards, then FLIPs them into the real grid cells (measured from `.why-ghost`, a hidden copy) and removes the pin for good; it never re-stacks. If the page loads below the section (reload/back), the grid shows straight away.
  - `diensten.js`: `diensten.html` shows plain icon tiles (`.dienst-tile` buttons: icon, name, licence label) in four groups: Persoonlijk vervoer, Beroepsmatig rijden, Theorie, Voor werkgevers (4 columns desktop, 3 tablet, 2 mobile). Each tile opens its own `<dialog>` (reuses the `.why-dialog` styles) with text, minimum age, a closed prices `<details class="dienst-prices">`, "Bel ons" and "Stuur een bericht". Same open/close motion as `why-dialog.js`. `#auto`-style hashes open the pop-up. Hover: border and icon turn orange and the tile lifts 3px. (A driving road, a road under each tile and a navy band were tried and removed again.)
  - `why-dialog.js`: the Waarom pop-ups (native `<dialog>` per card, right after the section in `index.html`). Desktop: the panel grows out of the clicked card; below 600px: a bottom sheet; reduced motion: a fade. GSAP animates only `.why-dialog-panel`, never the `<dialog>` itself, because GSAP moves an element without an offsetParent into <html> to measure it, and that takes a modal dialog out of the top layer. Pop-up texts use only facts from this site or deventer.joophagen.nl; gaps are marked "aanvullen met Sabine".
- `images/`: everything pages and CSS show, including the favicon.
- `docs/`: working notes for us and the client; never linked from the site.
- `ontwerpen/`: design pages link `../../css/styles.css`, `../../js/...`, `../ontwerpen.css`, `design.css`, and `../lang-ontwerpen.js` for extra EN strings.

- No frameworks. GSAP 3.12.5 + ScrollTrigger (cdnjs) only for the homepage "Waarom" cards (`js/why.js`). Other motion is CSS plus small IIFE scripts. Every script checks `prefers-reduced-motion`.
- JS style: ES5 IIFEs, `var`, early `return` if the element is missing. A short comment header explains each file.
- Comments in English. Client-facing TODOs in HTML comments are often in Dutch.
- Contact form posts via formsubmit.co. Licence links prefill it with `contact.html?rijbewijs=AM` etc.
- Licence anchors on `diensten.html`: `#scooter`, etc. Deep links come from the chooser panels.
- Commit messages: short imperative English, prefixed with "Design N:" for changes to one design.

## In progress

- Uncommitted: ontwerp 1 and 2 now have their own inner pages (`diensten`, `contact`, `vacatures`, `webshop`) with local nav links and `.inner` styles in `design.css`, like ontwerp 3. Needs a check at 375px and desktop, then a commit.
- Waiting for Sabine to choose a design.

## Open TODOs (before launch)

- **Contact form** still sends to the web builder's address (`formsubmit.co/risimorina11@gmail.com` in `contact.html`). It must change to the school's address.
- **Domain**: replace the preview URL in `site.js` and the BASE-URL TODOs in the `<head>` of `index`, `diensten` and `contact` (og/canonical).
- **ontwerpen footers**: the footers in ontwerp 1/2/3 have "KvK + privacylink toevoegen" TODOs. The KvK number is known now (see above) and `privacy.html` exists, so fill both in for the chosen design.
- **WhatsApp**: ontwerp 2 has a placeholder for a WhatsApp number. It needs a real mobile number, or the placeholder goes.
- **Bus (D)**: there is a tab on the homepage plus a form option, but D is not on `diensten.html`. Confirm or remove.
- **Licence content** still to fill in: motor theory, BE theory, C/CE practical exam age.
- **Photos**: a photo of Sabine is needed in 3 spots on `index.html`. Ask whether the vehicle photos may be used and whether people may appear in photos.
- **Claims and reviews**: confirm the claims and the reviewer names (see `docs/vragen-voor-sabine.md` §2).
- **Prices** in the `diensten.html` pop-ups (closed `<details>`, restored from git history): are they current, and who updates them? Prices are plain HTML tables in each `#d-<key>` dialog.
- **Minimum ages** in the `diensten.html` pop-ups: only auto (16,5), BE (18) and AM (16) are known; the rest have a TODO.
- **Webshop page**: keep it, or replace it with a link under Diensten > Theorie?
- **Vacature Rijinstructeur**: is it still open? `vacatures.html` has a "50 jaar" TODO (bevestigen met Sabine) and no photo yet (TODO in the HTML: foto van Sabine nodig, alleen mensen die op de site willen). The part after the licence tiles is a compact route inside `#vac-journey`: band 1 = "Wat neem je mee?" and "Wat bieden wij?" side by side (right one 48px lower), band 2 = the training heading on the left and the 4 steps in a row (every second one 24px lower). `js/vacatures.js` draws ONE road (svg behind the content, path computed from the real block positions, redrawn on resize and language change): down the channel between the band 1 blocks, sideways into the channel next to the heading, then in a small wiggle under the steps. GSAP ScrollTrigger scrub (no pin) draws it and each block fades in (step icons turn orange) when the road reaches it. Reduced motion shows everything. Under 1100px the blocks are stacked and the road is a straight line along the left edge. Buttons: `mailto:info@joophagen.nl` and `tel:+31570635036`.
- **Privacy statement content**: needs confirming by the client.
