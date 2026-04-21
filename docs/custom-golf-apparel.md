# Corporate (Custom Golf Apparel) — Build Spec

Page title: **Corporate**. Marketing + enquiry page for TrendyGolf's custom/bulk apparel service (logos, embroidery, corporate orders).

**Reference:**
- `_reference/scraped/html/custom-golf-apparel.html`
- `_reference/scraped/data/stream/custom-golf-apparel-route-routes--.json`
- Live: https://trendygolfuk.tdrstaging.co.uk/custom-golf-apparel

---

## Template

| Template | Page handle (Shopify) | Notes |
|---|---|---|
| `templates/page.corporate.json` | `corporate` (new) — or assign to existing `custom-golf-apparel` page via template dropdown | Page title on Shopify: **Corporate**. Footer currently links to `/custom-golf-apparel` — if we rename the handle to `corporate`, need a redirect (`/custom-golf-apparel` → `/pages/corporate`) + footer menu update. |

---

## Page composition

Four blocks top-to-bottom (from source Sanity data):

| # | Source type | Maps to | Notes |
|---|---|---|---|
| 1 | `bannerCarousel` (1 slide, `bottom` alignment) | ✅ hero-carousel | Heading: "Custom Golf Apparel for Your Business". Intro copy about brand-customised apparel for events/trips. Dark-grey CTA (empty in source). |
| 2 | `contentColumns` (6 columns) | ⚠️ **NEW section** | "What we offer" grid — each column has image + title + short description. See column titles below. |
| 3 | `iconGrid` (4 columns, `four` desktop layout) | ✅ icon-grid | "How it Works" — 4-step process. Source uses `chat` icons (3 cols) + `mail` icon (1 col) — looks like a placeholder set; confirm actual icons with client (numbered steps? custom SVGs?). |
| 4 | `form` (generic contact/corporate form) | ✅ contact-form | Enquiry form — "Get in Touch". Uses same shape as existing contact form (name/email/message + optional brand/phone/order toggles). Points at `corporate@trendygolf.com`. |

**Page flags:** `hasSocialGrid: false`, `headerOverlay: true` (hero overlays header — already handled by the theme's first-section `[data-hero]` auto-detect).

---

## contentColumns — 6-column content

Each column (from source):

| # | Title | Image |
|---|---|---|
| 1 | Premium Brands Like No Members | Brand logo (No Member) |
| 2 | Custom Logo Application | Feature image |
| 3 | Embroidery & Printing | Feature image |
| 4 | Flexible Order Sizes | Feature image |
| 5 | Fast Turnaround Times | Feature image |
| 6 | Dedicated Support | Feature image |

Column 1 doubles as a brand callout (shows the brand logo image). Worth noting that *all* six columns might be usable for brand logos in future — keep the section generic so it could hold a logo grid (like the brand grid on homepage) or a feature grid like this page, depending on content per block.

---

## New section — `sections/content-columns.liquid`

### Markup (from scraped source)
```html
<section class="page-block relative page-block--contentColumns {spacing classes}">
  <div class="container-wide">
    {optional heading (centered, serif h2)}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 lg:gap-8">
      {each column}
      <div>
        <img src="..." class="w-full mb-4" />
        <h3 class="font-bold mb-2">{title}</h3>
        <p class="text-sm">{body}</p>
      </div>
    </div>
  </div>
</section>
```
*(Exact classes to verify during build; grid may use `container-narrow` or different breakpoint mix — inspect HTML at build time.)*

### Settings

**Section-level:**
- `heading` (text, optional)
- `heading_size` (select: h2 / h3)
- `heading_alignment` (left / center)
- `desktop_columns` (select: 3 / 4 / 5 / 6)
- `mobile_columns` (select: 1 / 2)
- `background_color` (enum — matches content-block)
- `enable_animation` (checkbox)
- Desktop + mobile spacing fields (matches content-block pattern)

**Block (`column`):**
- `image` (image_picker)
- `image_alt` (text, optional)
- `title` (text)
- `body` (richtext — source is short descriptions but give editors richtext room)

No CTA per column (source doesn't use one). No layout toggle — all columns share the same layout.

---

## Progress so far

- ✅ `templates/page.corporate.json` built with 3 sections (hero, icon-grid "How it Works", contact-form) — content-columns block deferred until section exists.
- ✅ Contact form matched to source: `show_brand: false` (source form has name + email + phone + message only).
- ✅ `icon-grid.liquid` extended with an `icon_image` image_picker option (custom uploads) AND 4 new dropdown presets lifted from the source SVGs — `apparel`, `branding`, `design`, `delivery`. Corporate template uses the presets.
- ✅ `hero-carousel.liquid` slide blocks now support a `heading_first` toggle (default off = subheading-above-heading as before). Corporate hero uses `heading_first: true` to match source layout.
- ✅ Source images downloaded to `~/Downloads/trendygolf-corporate/{hero,content-columns,form}/` — 9 files, ready for client upload to Shopify Files.

## Client inputs needed

- [ ] **Icon choices for iconGrid** — source uses placeholder `chat`/`mail` icons. Current template uses `number-01/02/03/truck` as sensible defaults. Client can upload custom icon images via the new `icon_image` field once artwork is ready.
- [ ] **Form field confirmation** — current form matches source exactly (name/email/phone/message). Confirm no bespoke fields (file upload, quantity, budget etc.) needed beyond source parity.
- [ ] **CTA on hero** — source has a dark-grey arrow CTA with no label/link set. Should the hero have a "Start your enquiry" button scrolling to the form?
- [ ] **Page migration** — create `/pages/corporate` in Shopify admin, assign the Corporate template, upload images from Downloads folder, plus add `/custom-golf-apparel → /pages/corporate` redirect + update footer menu (currently linking to `/custom-golf-apparel`).

---

## Build order

1. ✅ `templates/page.corporate.json` with hero + icon-grid + contact-form wired up
2. ✅ `icon-grid.liquid` — `icon_image` image_picker added for custom icon uploads
3. ✅ Source images downloaded to `~/Downloads/trendygolf-corporate/`
4. ⏭ Build `sections/content-columns.liquid` + locales (deferred — handed to another Claude instance)
5. ⏭ Wire content-columns into `page.corporate.json` between hero + icon-grid
6. ⏭ Client action: create `/pages/corporate` in Shopify admin, assign Corporate template, upload images, confirm custom icon artwork, set hero CTA if desired; add redirect + update footer menu
7. ⏭ Visual QA against live source URL
