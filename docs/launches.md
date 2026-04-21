# Launches — Phase 4D

## Overview

Launch pages showcase upcoming and past product drops (e.g. Nike Air Max, Adidas Samba). The source site uses Sanity CMS for launch data; the existing Shopify theme (in `_do-not-use/`) uses **metaobjects** — we'll carry that pattern forward and restyle to match the source site's Tailwind markup.

Two page types:
1. **Listing page** (`/pages/launches`) — grid of all launches, upcoming first, past launches dimmed
2. **Detail pages** (`/pages/launch-{name}`) — individual launch with hero, countdown, content blocks, related launches

---

## Architecture

### Data: Shopify Metaobjects (existing)

The store already has a `launch` metaobject definition. Each entry contains:

| Field | Type | Purpose |
|-------|------|---------|
| `brand` | `single_line_text_field` | Brand name (e.g. "Nike") |
| `title` | `single_line_text_field` | Launch title |
| `launch_date` | `date` | Launch date (used for countdown + upcoming/past logic) |
| `products` | `list.product_reference` | Linked products (price, shop-now link) |
| `image` | `file_reference` (image) | Featured image for cards and hero |
| `launch_page` | `page_reference` | Link to the detail page |
| `archived` | `boolean` | Hides countdown timer, dims card in listing |

Each detail page is a **Shopify Page** with `page.metafields.custom.launch` referencing a metaobject entry. This pattern is proven and already populated — no migration needed.

### Existing `_do-not-use` files (reference only)

The old theme's Salvo-based sections use custom BEM classes (`launch-countdown__title`, `media-card-launch__image`, etc.) and Swiper.js. We'll rebuild these with the source site's Tailwind classes and Splide.js (consistent with the rest of our build).

**Old sections (don't copy, use as logic reference):**
- `_do-not-use/sections/launch-countdown.liquid` — countdown hero + Klaviyo notify CTA
- `_do-not-use/sections/launch-lister.liquid` — featured launches (metaobject_list, limit 3)
- `_do-not-use/sections/upcoming-launch-grid.liquid` — full grid, split upcoming/past
- `_do-not-use/sections/upcoming-launches.liquid` — carousel (Swiper)
- `_do-not-use/snippets/media-card-launch.liquid` — card snippet
- `_do-not-use/templates/page.launch.json` — detail page template
- `_do-not-use/templates/page.launch-landing.json` — listing page template

**Old templates (8 total):** `page.launch.json`, `page.launch_nike.json`, `page.launch-landing.json`, `page.launch-stan-moo.json`, `page.launch-stan-x-vice.json`, `page.launch_openchamp_89.json`, `page.launch_openschamp_victory.json`, `page.launch_openchamp_infinity.json`

---

## Source Site Reference

### Listing page

**Scraped HTML:** `_reference/scraped/html/launches.html`
**React component:** `_reference/repo/app/components/blocks/launchesLister.tsx`
**Data hook:** `_reference/repo/app/hooks/useLaunches.ts`

**Layout:**

```
<main>
  <div class="container-wide">
    <!-- Title & Description -->
    <div class="mb-10 grid grid-cols-1 lg:grid-cols-6">
      <div class="lg:col-span-4">
        [Title — portable text / rich text]
      </div>
      <div class="lg:col-span-2">
        [Description — portable text / rich text]
      </div>
    </div>

    <!-- Launch Cards Grid -->
    <div id="launchesMap" class="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3 4xl:grid-cols-4">
      [Launch cards]
    </div>

    <!-- Pagination -->
    <div class="text-center">
      [Load More button]
      [Showing X of Y entries]
    </div>
  </div>
</main>
```

**Grid responsive breakpoints:**

| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 |
| md (768px) | 3 |
| 4xl | 4 |

**Note:** Scraped HTML also shows `grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4` in some contexts — verify against live site during build.

### Launch card (PostItem)

**React component:** `_reference/repo/app/components/partials/post/item.tsx`

The PostItem component is **shared with magazine articles**. Each card:

```html
<a href="/launches/{slug}"
   class="group relative block h-max animate-fade-in opacity-0 transition-opacity duration-500">

  <!-- Image Container -->
  <div class="relative mb-5">
    <!-- Hover overlay -->
    <div class="absolute left-0 top-0 z-1 size-full bg-gradient-to-b from-black/10 to-black/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
    <!-- Bottom gradient (always visible) -->
    <div class="absolute bottom-0 left-0 z-1 h-1/3 w-full bg-gradient-to-b from-black/0 to-black/60"></div>
    <!-- Image -->
    <img src="..." alt="..." class="w-full" loading="lazy" />
  </div>

  <!-- Text Content -->
  <div class="flex flex-col">
    <!-- Category -->
    <p class="mb-1 text-xs tracking-wider text-taupe-700">{category}</p>
    <!-- Title + Date -->
    <div class="mb-2">
      <h4 class="text-lg lg:text-xl font-bold mb-2">{title}</h4>
      <p class="mb-0">{Launched | Launches: {date}}</p>
    </div>
    <!-- CTA -->
    <p class="mb-0 flex items-center gap-1 text-sm tracking-wide">
      {View more | Read more}
      <svg class="size-4">[ChevronRightIcon]</svg>
    </p>
  </div>
</a>
```

**Card states:**

| State | Class / Behavior |
|-------|-----------------|
| Upcoming | Full opacity, "Launches: {date}" |
| Past (launched) | `!opacity-50` (dimmed), "Launched" |
| Hover | Dark gradient overlay fades in |
| Fade-in | `animate-fade-in` with staggered `md:delay-100`, `md:delay-200` per column |

**Date format:** `MMM DD, YYYY` (en-GB locale, e.g. "Dec 16, 2025")

**Date logic:**
```
if launch_date <= today → "Launched"
else → "Launches: {formatted date}"
```

### Detail page

**Scraped HTML:** `_reference/scraped/html/launch-adidas-samba.html`, `launch-nike-air-max.html`
**React route:** `_reference/repo/app/routes/launches_.$slug.tsx`

**Typical block sequence:**
1. **Breadcrumbs** — Launches > {Launch Name}
2. **Hero** — large image grid: `container-wide grid h-[33rem] grid-cols-[minmax(0,4fr)_minmax(0,2fr)]`
3. **Content blocks** — rich text with styled typography (brand name uppercase, title in serif, date, price, "Shop Now" CTA)
4. **Related launches** — "Featured Launches" carousel at bottom

**Sanity data structure per launch:**
```json
{
  "schemaData": {
    "title": "Air Max 1 '86 OG NRG Golf Shoes",
    "slug": "air-max-1-86-og-nrg-golf-shoes",
    "launchDate": "2024-01-06"
  },
  "blocks": [
    { "_type": "breadcrumbs" },
    { "_type": "inlineImages", "images": [...] },
    { "_type": "content", "alignment": "center", "button": { "linkSlug": "/products/...", "title": "Shop Now" } },
    { "_type": "launchesFeatured", "type": "latest", "title": [...] }
  ]
}
```

---

## Metaobject Fields → Source Site Mapping

| Metaobject Field | Card Usage | Detail Page Usage |
|-----------------|------------|-------------------|
| `brand` | Category tag (above title) | Hero brand label (uppercase) |
| `title` | Card title (h4) | Hero title (serif) |
| `launch_date` | "Launched" / "Launches: {date}" | Countdown timer + date display |
| `image` | Card image | Hero image |
| `products` | — | Price display, "Shop Now" link |
| `launch_page` | Card link URL | — (is the page itself) |
| `archived` | `!opacity-50` dimmed | Hides countdown timer |

---

## Build Plan

Status key: `[ ]` not started · `[~]` in progress · `[x]` complete

### 4D-i — Launch Card Snippet `[ ]`
Shared card component (also usable for magazine articles later).
- PostItem markup with image overlays, category tag, title, date, CTA
- Date logic: compare `launch_date` to today, show "Launched" or "Launches: {date}"
- Opacity dimming for past launches
- Fade-in animation classes

### 4D-ii — Launches Listing Section `[ ]`
Section for the listing page (`/pages/launches`).
- Title + description header (grid-cols-1 lg:grid-cols-6)
- Card grid (grid-cols-1 md:grid-cols-3 4xl:grid-cols-4)
- Pull from `shop.metaobjects.launch.values`, sort by `launch_date` descending
- Split upcoming vs past (using `archived` flag + date comparison)
- Pagination / "Load more" (start with paginate tag, enhance with AJAX later if needed)
- Schema settings: title (richtext), description (richtext)

### 4D-iii — Launch Detail Sections `[ ]`
Sections for individual launch pages.
- **Launch hero** — full-width image with content overlay, countdown timer (if not archived), brand/title/date/price
- **Launch content** — rich text block for editorial content + "Shop Now" CTA linking to product
- **Related launches** — carousel/grid of other launches (Splide), pulling from `shop.metaobjects.launch.values`
- Schema: page references metaobject via `page.metafields.custom.launch`

### 4D-iv — Templates & Validation `[ ]`
- `templates/page.launches.json` — listing page template
- `templates/page.launch.json` — detail page template
- Schema validation via Shopify MCP
- Full flow test: listing → card click → detail → shop now → back

---

## Client Questions

- **Metaobject definition:** Confirm the `launch` metaobject type still exists on the store with the expected fields (brand, title, launch_date, products, image, launch_page, archived). If fields have changed, we'll adapt.
- **Existing entries:** How many launch metaobject entries exist? Are they all current or do some need archiving?
- **Category field:** The source site shows a category tag (e.g. "Brand Release") above the title. The current metaobject doesn't have a category field. Options: (a) add a `category` text field to the metaobject, (b) derive from brand name, (c) omit category tag. Need client input.
- **Countdown timer:** The old theme had a countdown + Klaviyo "Enter Draw" / notify button. Does the client still want this functionality? If so, we need the Klaviyo form ID.
- **Launch detail content:** The Sanity CMS has rich editorial content (multiple image blocks, text blocks) per launch. In Shopify, this will be built from section blocks in the page editor. Client will need to re-enter content for each launch page via the theme customiser — or we can pre-populate the JSON templates for existing launches.

---

## Source File Reference

| Component | Scraped HTML | React Source | Data |
|-----------|-------------|-------------|------|
| Listing page | `_reference/scraped/html/launches.html` | `_reference/repo/app/components/blocks/launchesLister.tsx` | `_reference/scraped/data/stream/launches.json` |
| Launch card | (within listing) | `_reference/repo/app/components/partials/post/item.tsx` | — |
| Detail: Adidas Samba | `_reference/scraped/html/launch-adidas-samba.html` | `_reference/repo/app/routes/launches_.$slug.tsx` | `_reference/scraped/data/stream/launch-adidas-samba.json` |
| Detail: Nike Air Max | `_reference/scraped/html/launch-nike-air-max.html` | `_reference/repo/app/routes/launches_.$slug.tsx` | `_reference/scraped/data/stream/launch-nike-air-max.json` |
| Featured launches | (within detail pages) | `_reference/repo/app/components/blocks/launchesFeatured.tsx` | — |
| Pagination hook | — | `_reference/repo/app/hooks/useLaunches.ts` | — |
| Old Shopify sections | `_do-not-use/sections/launch-*.liquid`, `upcoming-launch*.liquid` | — | — |
| Old Shopify templates | `_do-not-use/templates/page.launch*.json` (8 files) | — | — |
| Old card snippet | `_do-not-use/snippets/media-card-launch.liquid` | — | — |
