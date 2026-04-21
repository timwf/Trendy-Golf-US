# Flagship Stores — Build Spec

Three pages: a landing page listing both stores, plus one page per store (Canary Wharf, Manchester). Individual stores share identical structure — only content/images differ.

**Reference:**
- `_reference/scraped/html/flagship-stores.html` + `data/stream/flagship-stores-route-routes--.json` (landing)
- `_reference/scraped/html/flagship-canary-wharf.html` + `data/stream/flagship-canary-wharf-route-routes--.json`
- `_reference/scraped/html/flagship-manchester.html` + `data/stream/flagship-manchester-route-routes--.json`
- `_reference/repo/app/components/blocks/fiftyFifty.tsx` (source markup)

---

## Templates

| Template | Page handle (Shopify) | Notes |
|---|---|---|
| `templates/page.trendygolf-stores.json` | `trendygolf-stores` | Landing — lists both flagship stores. New page on staging. |
| `templates/page.trendygolf-canary-wharf.json` | `trendygolf-canary-wharf` | Individual store. **Page already exists on production store** — template handle must match. |
| `templates/page.trendygolf-manchester.json` | `trendygolf-manchester` | Individual store. New page on staging. |

---

## Page composition

### Landing (`page.trendygolf-stores.json`)

Two blocks, top to bottom:

1. **content-block** — `alignment: center`, heading "Flagship Stores" (h2, serif) + body text "Step in-store for expert advice, gear, and the game's best brands."
2. **banner-cards** — 2-up grid, no section heading. Cards:
   - Canary Wharf — image `113381d012f5c14a09cc0dafb73094f785ab2aa2-720x720.jpg`, CTA "EXPLORE" → `/pages/trendygolf-canary-wharf`
   - Manchester — image `b6ea127cf8e0c1c00ab1ac21ecda6cb3137a5f30-3840x2160.jpg`, CTA "EXPLORE" → `/pages/trendygolf-manchester`
3. **social-grid** (page-level — source sets `hasSocialGrid: true` here only, not on the store pages)

All existing sections — no new work.

### Canary Wharf & Manchester (identical 6-block structure)

| # | Section | Key content differences |
|---|---|---|
| 1 | hero-carousel (single slide, `bottom` alignment) | Heading: "Canary Wharf \| London" vs "Spinningfields \| Manchester"; different hero images |
| 2 | icon-grid (3 cols) | Address / phone+hours / email (see details below) |
| 3 | content-block (centered, heading only) | "Here you can find" |
| 4 | logo-marquee | Identical 31 brand logos on both (see [list](#logo-marquee-brand-list)) |
| 5 | fifty-fifty (⚠️ NEW — image-left) | "A Space Designed for Golf & Style" + intro copy + apparel list + shoe wall (Canary only) |
| 6 | fifty-fifty (⚠️ NEW — image-right) | "A Bespoke Shopping Experience" + 4 bullet services |

Both pages `hasSocialGrid: false` — no social grid under main content.

---

## Icon grid content per store

| Column | Canary Wharf | Manchester |
|---|---|---|
| Icon 1 (pin) | Title: "Vist Us" *(source typo — fix to "Visit Us")*. Address: `TRENDYGOLF, Canary Whalf, 30 Churchill Place, London, E14 5RE` *(source typo "Whalf" — fix to "Wharf")*. CTA: "Google Maps" → `https://maps.app.goo.gl/rqBwSiiD2mrkfFu69` | Title: "Visit Us". Address: `TRENDYGOLF, Manchester, 2 Goods Yard St, Manchester M3 3BG`. CTA: "Google Maps" → `https://maps.app.goo.gl/azztNRKmeXxg8yeR7` |
| Icon 2 (phone) | Title: "Contact Us". Hours: `7 days a week Opening times / Mon-Sat 11-7 Sun 12-6 / Canary Wharf`. CTA label: `07706 333 483` → `tel:+447706333483` *(source has no href; we'll add a tel: link)* | Title: "Contact Us". Same hours. CTA: same phone |
| Icon 3 (mail→envelope) | Title: "Email Us". Body: "Want to learn more? Send us an email." CTA: `Canary@trendygolf.com` → `mailto:Canary@trendygolf.com` *(source links to gmail.com — we'll use mailto: for usability)* | Title: "Email Us". Same body. CTA: `Manchester@trendygolf.com` → `mailto:Manchester@trendygolf.com` |

**Icon mapping:** source uses `pin` / `phone` / `mail`; existing `icon-grid.liquid` uses `map-pin` / `phone` / `envelope`. Mapping applied at template-level (icon-grid block settings).

**Fixes we're making vs source (not flagged to client — all are clearly correct):**
- "Vist" → "Visit"
- "Whalf" → "Wharf" (x2)
- Phone number wired as `tel:` link
- Email wired as `mailto:` link (source used a generic gmail inbox URL)

---

## Fifty-fifty content per store

### Row 1 — "A Space Designed for Golf & Style" (image-left)

**Canary Wharf** — image `86332f1c8d34816063893d908a36d6540b9c31a7-1638x2048.jpg`. Copy: three paragraphs — store intro (2,300 sq. ft.), Apparel & Accessories brand list, Shoe Wall (55 styles).

**Manchester** — image `40870aad3c18d92071507621c134115ba9b10be5-1080x1350.jpg`. Copy: intro + Apparel & Accessories list + Footwear & Fittings. Intro paragraph ends with `....` in source — **flag to client** (looks truncated).

### Row 2 — "A Bespoke Shopping Experience" (image-right)

**Canary Wharf** — image `1d9699fc7f83df21de5da0698f738c1435ef5bf7-1638x2048.jpg`.
**Manchester** — image `379a731f9666f6077e0b502db15377c744e5be26-1080x1350.jpg`.

Both have identical body copy (with location name swap) — 4 bullets with `✔` glyph: Personal Shopping, One-on-One Fitting & Styling, Virtual Shopping, In-Office & In-Home Shopping.

---

## Logo marquee brand list

Both stores use the **same 31-logo list** (source shares the same Sanity reference). Templates will copy the same block array into both page JSONs for independence. Brands (order preserved): RLX, Manors, Adidas, Malbon, J Lindenberg, Adidas Golf Originals, Bogey Boys, Blue Tees Golf, BOSS, Cole Hann, Extracurricular, Footjoy, G/FORE, Galvin Green, GOATLANE, Greyson, Jones Golf Bags, Jordan, KJUS, New Balance, Nike, No Member, 3 Putt Round, Peter Millar, Puma, Reflo, Solex, Sounders Golf, Under Armour, Vessel, Walker Golf Things, Wolsey.

Source images are Sanity CDN URLs. We'll use Shopify `image_picker` block settings — client will need to re-upload logos into Shopify (or we point at a shared CDN for now). Logos themselves are already on the source site at `cdn.sanity.io/images/482gpifr/staging/{hash}.png`.

**Implementation note:** logo-marquee has a block-count limit. 31 items fit within Shopify's standard 50-block cap (confirmed in existing schema).

---

## New section — `sections/fifty-fifty.liquid`

### Markup (from source)
```html
<section class="page-block relative page-block--fiftyFifty lg:mb-14 mb-8 bg-transparent">
  <div class="container-narrow grid grid-cols-1 gap-5 md:gap-10 lg:grid-cols-2 xl:gap-14">
    <div class="{lg:order-2 when flip}">
      <img class="w-full lg:size-full lg:object-cover" ... />
    </div>
    <div class="{lg:order-1 when flip}">
      <h2><span class="font-serif"><span class="text-4xl lg:text-5xl">{heading}</span></span></h2>
      {richtext body}
      {optional button}
    </div>
  </div>
</section>
```

### Settings
- **Content:** `image`, `image_alt`, `heading` (text), `body` (richtext), `layout` (select: `image-left` / `image-right`)
- **CTA:** `cta_label`, `cta_link`, `cta_style` (dark-grey / white / transparent / text), `cta_has_arrow`
- **Spacing + theme:** `background_color`, `enable_animation`, margins & padding (desktop + mobile) — same pattern as `content-block.liquid`

### Not included
- `video` / `oembed` media type — source schema supports it but none of our three pages use it; deferring to keep scope tight (can add later).
- Second CTA — not used in source.

---

## Client inputs needed

- [ ] Confirm Manchester first-row intro copy — source ends with `....` (looks truncated).
- [ ] Confirm brand list for Manchester store's logo marquee — currently identical to Canary Wharf; may need a different per-location list.
- [ ] Hero images: source URLs are Sanity CDN. Need the original assets uploaded into Shopify Files, or we can keep remote Sanity URLs for staging.
- [ ] Confirm page handles are free on staging (`trendygolf-stores`, `trendygolf-manchester`); `trendygolf-canary-wharf` exists on prod already.

---

## Build order

1. Build `sections/fifty-fifty.liquid` + locales + schema validation
2. Create 3 JSON templates (Canary Wharf first — content already verified from scrape)
3. Commit + push (auto-syncs to staging via Shopify GitHub integration)
4. Create `/pages/trendygolf-stores` and `/pages/trendygolf-manchester` in Shopify admin, assign templates
5. Visual QA against source HTML
