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

The site (`/*.html`) is the current full site. Pages: `index`, `diensten`, `webshop`, `vacatures`, `contact`, `privacy`.

**Design options:** the three alternative designs (`ontwerpen/`) were removed before showing the site to Sabine. They are still in git history (commit 88321cc and earlier) if one is ever needed again.

**Hosting:** `netlify.toml` publishes the repo root (no build step) and sends `X-Robots-Tag: noindex` while it is a client preview. Remove that header block at launch.

## Design

- Trade file: none fits (there is no driving-school file in `~/.claude/design-trades/`).
- Concept: road and traffic, in the colours of the logo: white/light background, near-black (`#231F20`) for text and dark parts, logo orange (`#E17D00`) as the one accent, a light orange for dashed "lane" lines. Light, calm hero with a faint dashed road line along its bottom edge.
- Hero: "Rijbewijs halen in Deventer?" + "Kies je voertuig." left; right a wavy orange route with four stop buttons (Auto B, Scooter AM, Motor A1/A2/A, Vrachtwagen C) leading to "Rijbewijs!". Click a stop: a dot travels the line, then an answer card (own grid column on desktop, under the route below 1100px) shows licence, one fact and links to `contact.html?rijbewijs=..` and `diensten.html#..`. Light background with faint dot grain. Memorable elements: this route hero, the licence chooser ("Welk rijbewijs wil je halen?"); the schakel/automaat gear control now lives only in the contact wizard. The 3:4 truck loop (`images/hero-vrachtwagen.*`, `docs/hero-video.md`) is no longer used on the page.
- Typefaces:
  - **Overpass** (display, 400–800): based on Highway Gothic, the road-sign typeface. That is why it fits a driving school.
  - **Work Sans** (body, 400–600): plain and very readable on phones.
  - Both come from Google Fonts.
- Palette (CSS variables in `css/styles.css` `:root`):

| Variable | Hex | Use |
|---|---|---|
| `--ink` | `#231F20` | Text and dark parts, from the logo (`--ink-black` `#161314` footer/menu, `--ink-soft` `#3A3537`) |
| `--orange` | `#E17D00` | Logo orange: accent and main buttons (`--orange-light` `#F59A2E`, `--orange-dark` `#A85A00`). White text on orange is only 2.9:1, so primary buttons use `--ink` text (5.5:1). Orange text on light backgrounds uses `--orange-dark` (5.1:1) |
| `--lane` | `#F59A2E` | Light orange, sparse accent |
| `--paper` | `#FFFFFF` | White background (`--paper-dim` `#F5F4F3`, `--line` `#E4E2E0`) |
| `--text` | `#231F20` | Body text (`--text-soft` `#5A5958`, 7:1 on white) |

`rgba()` colours use `rgba(var(--orange-rgb), a)` etc. Change a colour in `:root` AND its `-rgb` triplet (`--orange-rgb`, `--ink-rgb`, `--ink-black-rgb`, `--lane-rgb`). Inline SVG in the HTML uses `var(--...)`.

Other tokens: `--hh` (header height, overridden per design), `--container` 1160px, `--radius` 16px / `--radius-sm` 10px, `--shadow-sm|md|lg`.

## Structure and conventions

```
/            *.html pages (stay in root so URLs don't change), CLAUDE.md, .gitignore
├─ css/      styles.css
├─ js/       all site scripts; js/lang/ holds the translation files (en.js)
├─ images/   fotos/ (client photos, WebP, each as full + -800), logo-joop-hagen.svg (light backgrounds), logo-joop-hagen-dun.svg (dark backgrounds: header, footer), favicon.png (the J of the logo), og-image.jpg (logo + pand-vloot strip)
└─ docs/     notes, not served as pages (vragen-voor-sabine.md)
```

- `css/`: all shared styles in one file (~1600 lines). Image paths inside it are `../images/...`.
- `js/`: one small script per feature, loaded with `js/<name>.js`:
  - `site.js`: SINGLE SOURCE for business details (name, address, phone, email, KvK, socials, url, opening hours). Renders the footer (#site-footer), opening-hours tables and LocalBusiness JSON-LD. Must load BEFORE i18n.js. Change hours/details here only.
  - `i18n.js` + `lang/en.js`: NL|EN switch. Dutch text lives in the HTML; `lang/en.js` maps Dutch string -> English. Use `t('Nederlandse tekst')` in JS for translatable strings. Reviews stay Dutch.
  - `script.js`: mobile nav, general behaviour.
  - `chooser.js`: licence tabs/panels (roving tabindex, arrow keys).
  - `gear-scene.js`: the schakel/automaat drawings (H-gate vs P-R-N-D) and dashboard, used ONLY by the contact wizard. The homepage Rijbewijs B panel has no gear control any more: it is a normal licence panel with the line "Les in een schakel- of automaatauto" in its facts list.
  - `contact-wizard.js`: turns the contact form into 4 steps. The plain form keeps working without JS.
  - `reviews.js`: scroll-snap reviews carousel; the arrows hide when all reviews fit.
  - `hero-route.js`: the hero route. GSAP entrance (line draws, stops pop, "Rijbewijs!" fades, about 1.6s), dot travel on click, answer card (Esc closes). Card facts live in its `CARDS` object and must only repeat what the diensten pop-ups say (Motor and Vrachtwagen have no age yet, so no fact). Reduced motion: no GSAP, everything shown, no dot. The stops are HTML buttons placed with `--x`/`--y` percentages over the SVG (viewBox 460x400); they lie on the path.
  - `stats.js`: sets the number of "rijbewijzen & opleidingen" in the homepage facts line (`.facts-band`, a thin band above the Waarom section) to the number of `.dienst-tile` on `diensten.html` (fetch; the fixed number in `index.html` stays if it fails). The facts line (50+ jaar, rijbewijzen, Google 4,3 / 193) is the ONLY place on the homepage with these claims; keep it that way.
  - `diensten.js`: `diensten.html` shows plain icon tiles (`.dienst-tile` buttons: icon, name, licence label) in four groups: Persoonlijk vervoer, Beroepsmatig rijden, Theorie, Voor werkgevers (4 columns desktop, 3 tablet, 2 mobile). Each tile opens its own `<dialog>` (reuses the `.why-dialog` styles) with text, minimum age, a closed prices `<details class="dienst-prices">`, "Bel ons" and "Stuur een bericht". Same open/close motion as `why-dialog.js`. `#auto`-style hashes open the pop-up. Hover: border and icon turn orange and the tile lifts 3px. (A driving road, a road under each tile and a navy band were tried and removed again.)
  - `why.js`: the "Waarom" cards. The HTML/CSS default is a static 2x2 grid, each card an <article> whose headline is a <button> (its ::after covers the card) that opens a pop-up. At >=900px with motion it pins the section and stacks the cards, then FLIPs them into the real grid cells (measured from `.why-ghost`, a hidden copy) and removes the pin for good; it never re-stacks. If the page loads below the section (reload/back), the grid shows straight away. Needs GSAP + ScrollTrigger (loaded in `index.html`).
  - `why-dialog.js`: the Waarom pop-ups (native `<dialog>` per card, right after the section in `index.html`). Desktop: the panel grows out of the clicked card; below 600px: a bottom sheet; reduced motion: a fade. GSAP animates only `.why-dialog-panel`, never the `<dialog>` itself, because GSAP moves an element without an offsetParent into <html> to measure it, and that takes a modal dialog out of the top layer. Pop-up texts use only facts from this site or deventer.joophagen.nl; gaps are marked "aanvullen met Sabine".
- `images/`: everything pages and CSS show, including the favicon. Photos use `srcset` (-800 and full), `width`/`height`, Dutch `alt`, `loading="lazy"` below the fold. The wide strips (`vloot-ijssel`, `pand-vloot`, `motoren-rij`) are never cropped on desktop; phones crop them. Photo placement: vloot-ijssel (home strip, Auto pop-up, Waarom pop-up 3), pand-vloot (contact), motoren-rij + motor-closeup (Motor pop-up), scooters (Scooter pop-up), vrachtwagen-lebuinus (Vrachtwagen pop-up, vacatures hero), vrachtwagen-bomen (Code 95 pop-up), theorielokaal (Theorie pop-up). Still without photo (TODO comment in the pop-up): BE, camper, tractor, taxi, CE. The Waarom cards still wait for photos of Sabine.
- `docs/`: working notes for us and the client; never linked from the site.

- No frameworks. GSAP 3.12.5 (cdnjs) for the hero route (`js/hero-route.js`) and the pop-ups; ScrollTrigger only for the homepage "Waarom" cards (`js/why.js`). Other motion is CSS plus small IIFE scripts. Every script checks `prefers-reduced-motion`.
- JS style: ES5 IIFEs, `var`, early `return` if the element is missing. A short comment header explains each file.
- Comments in English. Client-facing TODOs in HTML comments are often in Dutch.
- Contact form posts via formsubmit.co. Licence links prefill it with `contact.html?rijbewijs=AM` etc.
- Licence anchors on `diensten.html`: `#scooter`, etc. Deep links come from the chooser panels.
- Commit messages: short imperative English, prefixed with "Design N:" for changes to one design.

## In progress

- Client meeting changes applied (CTA wording "Neem contact op" / "Plan je eerste les", bus and adapted-car removed, "Rijbewijzen" heading, theory tile = Auto, Bromfiets, Vrachtwagen, slim stats band, logo palette, compact light hero, winding vacatures road). Waiting for Sabine's feedback (preview on Netlify).

## Open TODOs (before launch)

- **Contact form** still sends to the web builder's address (`formsubmit.co/risimorina11@gmail.com` in `contact.html`). It must change to the school's address.
- **Domain**: replace the preview URL in `site.js` and the BASE-URL TODOs in the `<head>` of `index`, `diensten` and `contact` (og/canonical).
- **Licence content** still to fill in: motor theory, BE theory, C/CE practical exam age.
- **Photos**: a photo of Sabine is needed in 3 spots on `index.html`. Ask whether the vehicle photos may be used and whether people may appear in photos.
- **Claims and reviews**: confirm the claims and the reviewer names (see `docs/vragen-voor-sabine.md` §2).
- **Prices** in the `diensten.html` pop-ups (closed `<details>`, restored from git history): are they current, and who updates them? Prices are plain HTML tables in each `#d-<key>` dialog.
- **Minimum ages** in the `diensten.html` pop-ups: only auto (16,5), BE (18) and AM (16) are known; the rest have a TODO.
- **Webshop page**: keep it, or replace it with a link under Diensten > Theorie?
- **Vacature Rijinstructeur**: is it still open? `vacatures.html` has a "50 jaar" TODO (bevestigen met Sabine) and a hero photo of the lesvrachtwagen (`vrachtwagen-lebuinus`). The part after the licence tiles is a compact route inside `#vac-journey`: band 1 = "Wat neem je mee?" and "Wat bieden wij?" side by side (right one 48px lower), band 2 = the training heading on the left and the 4 steps in a row (every second one 24px lower). `js/vacatures.js` draws ONE road (svg behind the content, path computed from the real block positions, redrawn on resize and language change): down the channel between the band 1 blocks, sideways into the channel next to the heading, then in a small wiggle under the steps. GSAP ScrollTrigger scrub (no pin) draws it and each block fades in (step icons turn orange) when the road reaches it. Reduced motion shows everything. Under 1100px the blocks are stacked and the road is a straight line along the left edge. Buttons: `mailto:info@joophagen.nl` and `tel:+31570635036`.
- **Privacy statement content**: needs confirming by the client.
