# ZENO DETAIL — design direction

## The idea: the wash bay in daylight, and the label on the towel

ZENO sells one physical thing today: a blue microfiber drying towel with a black edge and a black ZENO DETAIL label at its corner. The storefront is built from that object and the place it is used.

- **The ground is the wash bay in daylight.** A light, slightly warm grey that sits next to the warm-grey tabletop and concrete in the product imagery, so photographs read as part of the page rather than patches pasted onto white.
- **The one saturated colour is the towel.** Cobalt appears in the product itself and in the action that buys it. It is never a background wash, gradient or decoration.
- **Black is the binding.** The towel's black edging becomes the header, the footer and the product tag. Black frames; it does not fill.
- **The memorable element is the product tag.** A black plate carrying the authentic ZENO mark, the product name, the key facts and the price, placed where the label sits on the real towel — at the corner of the product image. It is used for the product summary on the home page, the shop listing and the product page specifications. It is the one bold move; everything around it stays quiet.

The customer should understand within one screen: what the product is, what it looks like, what it costs in their currency, how delivery works and that ordering is not open yet.

## Colour

| Token | Hex | Role |
| --- | --- | --- |
| `--ink` | `#17181a` | Text, header, footer, product tag (the binding) |
| `--ground` | `#efeeeb` | Page background (wash bay in daylight) |
| `--paper` | `#f9f9f7` | Raised surfaces that float: drawers, popovers, inputs |
| `--concrete` | `#dedbd5` | Recessed panels and image placeholders |
| `--muted` | `#55575b` | Secondary text (6.2:1 on ground) |
| `--cobalt` | `#2348b4` | Primary action, links on hover, focus, current selection (white text 7.5:1) |
| `--cobalt-deep` | `#1a3a96` | Pressed/hover state of cobalt |
| `--rule` | `#cfccc6` | Dividers only; controls use `--control-line` (`#7d7f83`, ≥3:1) |

Rules: one accent; no gradients, glows, glass or tinted overlays; no colour on non-interactive elements except the product itself. Dark sections are ink, not tinted near-black variants.

## Typography

One variable family, **Archivo** (self-hosted, `wdth` 62–125), used in two voices:

- **Display voice** — `wdth` 116–125, weight 640–700, sentence case. The wide setting echoes the wide, squared ZENO wordmark without imitating it. Wide type needs little negative tracking (`-0.01em`).
- **Reading and interface voice** — `wdth` 100, weight 400/560. Body 1.0625rem / 1.6, measure ≤ 66ch.
- **Prices** use the display width at weight 620 with tabular numerals.

Scale (fluid): 0.8125 · 0.9375 · 1.0625 · 1.25 · 1.6 · 2.15 · 3.1 rem (max). Headings are left aligned and never split for drama. No all-caps labels, no tracked eyebrows, no italic accent words, no monospace. Small labels exist only when they carry information ("Specifications", "Delivery") and are sentence case at weight 560.

## Imagery

- Photographic, natural daylight, neutral grounds, graphite or silver paint. Product blue must match the physical towel; never push it to electric cyan.
- Each image earns its slot: product evidence (folded, edge and label, texture), use context (on paint, drying), guide covers. No decorative filler, no abstract backgrounds, no stock people.
- Generated images are **visualisations** and are captioned as such under the image. They never support a dimension, construction or performance claim.
- Authentic branding only: the ZENO mark comes from `assets/images/brand/`. Generated images must be checked against the vector; if the generator distorts the mark, the mark is composited from the vector afterwards.
- Images keep square corners. Crops are deliberate per breakpoint (`object-position` from the manifest focal point). Every slot has fixed aspect ratio to avoid layout shift.
- The image inventory and replacement workflow live in `data/image-manifest.json` and `docs/IMAGE-PRODUCTION-QUEUE.md`.

## Layout

- 12-column grid, container 88rem, gutters `clamp(1rem, 4vw, 3rem)`. Content left aligned.
- Compositions vary by what the content is: a split product hero; a two-scale close-up pairing; a full-bleed use image beside an ordered routine (a real sequence, so it is numbered); plain two-column delivery facts; guides as a list, not cards.
- Section spacing comes from the content, `clamp(3.5rem, 8vw, 7rem)`; no oversized empty heroes.
- Mobile is composed, not stacked: image first, then name, price and the action; the product page has a sticky "Add to bag" bar once the main button scrolls away.

## Components

- **Header**: ink bar, ZENO lockup left, primary navigation, preferences button (`English · Europe · EUR €`), search, bag with count. Mobile: lockup, search, bag, menu.
- **Preferences**: a non-modal popover (desktop) and an inline section in the mobile menu. Two radio groups — language (native names, no flags) and shopping region (Europe / International · EUR €, Romania · RON lei) — and a save button. Currency is shown as a consequence of region, never as an independent unsupported choice.
- **Product tag**: ink plate, 6px corner radius (the sewn label), symbol top-left, name, facts as a short definition list, price, actions.
- **Buttons**: 3px radius. Primary = cobalt fill. Secondary = ink outline. Text links underline on hover only where context makes them obviously links. No arrows appended to every label; an arrow icon appears only on links that leave the current context for a related page.
- **Lists of facts**: definition lists with 1px rules. No cards with shadows; elevation is reserved for drawers and popovers.
- **Status**: "Ordering opens soon" is shown with a neutral dot and an explanation. No artificial urgency, countdowns, stock levels, ratings or discounts unless real and approved.
- **Motion**: only in response to the user (drawer open, popover, accordion). 160–220ms, respects `prefers-reduced-motion`.
- **Focus**: 2px cobalt outline with 2px offset on light grounds; white outline on ink.

## Copy

Plain, specific, sentence case, from the customer's side. Say what the product is and what is known; say plainly what is not known yet. No slogans that could describe any brand, no invented proof, no claims the data does not support. Every customer-facing string is translated in all published languages.
