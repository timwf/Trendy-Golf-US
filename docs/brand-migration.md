# Brand Landing Migration — Plan

## Overview

The live public site renders brand landings from Sanity at `/brands/<slug>` (e.g. `/brands/nike`, `/brands/ralph-lauren`). These are **marketing pages** — hero carousel, tabbed product carousel, promo cards — distinct from Shopify collection pages (`/collections/mens-nike`), which remain standard filterable product grids.

The legacy Shopify theme (`_do-not-use/`, currently installed on `trendy-golf-uk.myshopify.com`) has **no bespoke brand landing pages** — brand A-Z links go straight to collections. Our rebuild replaces Sanity, so we must recreate the brand landings natively in Shopify.

**Goal:** port each Sanity-rendered brand landing into a bespoke Shopify `page.brand-<slug>.json` template, mirroring the article-migration pattern.

**Scope:** **9 live Sanity brand landings** on the staging site — initial scrape (2026-04-19) found 7 via the /brands A-Z promo cards; a follow-up URL probe found 2 more (`head`, `apc`) that exist as standalone Sanity `page` documents but aren't linked from the curated A-Z landing. The remaining ~25 brand metaobjects have no Sanity landing — their A-Z links route directly to their collection. Our build needs 9 `page.brand-<slug>.json` templates + updated A-Z logic that falls back to collection URLs when no landing exists.

---

## Architecture Decisions

### 1. Page templates, not collection templates

Brand landing ≠ collection page on the live site. They are two distinct URLs with different purposes:
- `/brands/nike` → marketing landing (hero video, "New In Nike" carousel, promo tiles) → links out to collections
- `/collections/mens-nike` → filterable product grid (no hero, no carousel)

Keeping them separate in Shopify means:
- `page.brand-<slug>.json` templates for landings
- Standard `collection.json` template handles the filterable grid
- A-Z listing can route users to the landing; landing CTAs route to the collection

### 2. Filename pattern: `page.brand-<slug>.json`

Slug matches the Sanity slug from the metaobject's `Brand Page` field (e.g. `ralph-lauren` → `page.brand-ralph-lauren.json`). Shopify Page handle on the live store must match.

No legacy filenames to mirror — the legacy theme has no equivalent templates. Clean slate.

### 3. Metaobject `Brand Page` field — add new field, non-destructive

**Current (live store):** single-line text storing the Sanity slug path (e.g. `/brands/ralph-lauren`). Field helper text: "Enter your Sanity slug field here to display a custom brand page."

**Approach:** **Add a new field** `brand_page_shopify` (page reference type) *alongside* the existing `brand_page` text field. Don't modify the existing field.

**Why non-destructive:**
- Changing the existing field's type (text → page reference) is a destructive schema edit — wipes existing Sanity slug values on save
- Adding a new field preserves the old data, lets the client roll back cleanly if needed, and keeps the old Sanity slugs addressable during the Sanity decommission window
- Client can manually remove the old `brand_page` text field later once fully migrated

**Routing priority:**
1. Our A-Z listing reads `brand.brand_page_shopify.value.url` if populated (Shopify page URL)
2. Falls back to `brand.mens_collection.value.url` / `brand.womens_collection.value.url` if no page reference set
3. Brands with no landing page will route directly to collection, same behaviour as legacy theme

### 4. Content porting — article-migration style

- One bespoke `page.brand-<slug>.json` per brand with a Sanity landing
- Content baked into section settings from scraped Sanity data streams
- All required sections already exist in the theme — pure content porting, not section building
- Build one pilot template, verify, then produce the other 6 in parallel (not strict batches)

---

## Live Data Sources

### Sanity (content source)

Live Sanity-driven landing pages at `trendygolf.co.uk/brands/<slug>`. Rendered via Remix catch-all route `$.tsx` fetching Sanity `page` documents by slug.

**Scraped data streams:** `_reference/scraped/data/stream/brand-*-route-routes-*.json`

### Brand metaobject (34 entries on live store)

Used for A-Z listing (both legacy and new theme). Fields:

| Field | Type | Purpose |
|---|---|---|
| `brand_name` | text | Display name |
| `alphabet_reference` | choice | A-Z grouping |
| `brand_categories` | choice list | Mens / Womens / both |
| `brand_image` | image | A-Z listing thumbnail |
| `mens_collection` | collection ref | Mens product grid |
| `womens_collection` | collection ref | Womens product grid |
| `brand_page` | text (existing — Sanity slug, preserved) | Legacy Sanity routing, will be retired post-migration |
| `brand_page_shopify` | **page reference (new field to be added)** | Shopify page for brand landing |

### Legacy Shopify theme (`_do-not-use/`)

No brand landing templates. Only has 3 bespoke **collection** templates (`collection.adidas-mens-brand-page.json`, `collection.galvin-green.json`, `collection.nike-international.json`) — these are enhanced collection pages, not brand hubs, and do not map to our page-template approach.

---

## Section Mapping

Every scraped brand page uses the same block scaffold:

| Sanity Block | Frequency (10 scraped) | Our Section | Status |
|---|---|---|---|
| `bannerCarousel` | 10/10 | `hero-carousel` (Phase 3A) | ✅ Built — supports Vimeo/CDN/native video, CTA overlay, mobile image variants |
| `productCarouselTabs` | 10/10 | `product-carousel-tabs` (Phase 3B) | ✅ Built — tabbed product collection carousel |
| `bannerCards` | 10/10 | `banner-cards` (Phase 3A) | ✅ Built — promo card grid |
| `inlineImages` | 1/10 (Manors) | `media-grid` (article-migration) | ✅ Built — reuse from article-migration |

**No new sections needed.** Pure content porting exercise.

---

## Scraped Brand Inventory

Initial run of `_reference/scrape-brands.mjs` against `trendygolfuk.tdrstaging.co.uk` on 2026-04-19 discovered 7 via the curated /brands A-Z landing. A follow-up URL probe on 2026-04-19 found 2 more standalone Sanity pages (`head`, `apc`). All 9 brands scraped successfully with stream data captured.

| Slug | Template filename | Blocks | Carousel tabs | Slides | Cards | Notes |
|---|---|---|---|---|---|---|
| adidas-golf-originals | `page.brand-adidas-golf-origina.json` | bannerCarousel, productCarouselTabs, bannerCards | 1 | 1 | 3 | Standard scaffold |
| apc | `page.brand-apc.json` | bannerCarousel, bannerCards | — | 1 | 3 | "Launching soon" placeholder — no product carousel, cards have no links (client to populate) |
| g-fore | `page.brand-g-fore.json` | bannerCarousel, productCarouselTabs, bannerCards | **2** | 1 | 3 | Mens + Womens tabs |
| head | `page.brand-head.json` | bannerCarousel, productCarouselTabs, bannerCards | **3** | 1 | 3 | Polos / Jackets & Mid-Layers / Trousers tabs. Hero CTA has no link (client to populate); cards 2+3 also unlinked |
| jlindeberg | `page.brand-jlindeberg.json` | bannerCarousel, productCarouselTabs, bannerCards | 1 | 1 | 3 | Standard scaffold |
| manors | `page.brand-manors.json` | bannerCarousel, productCarouselTabs, **inlineImages**, bannerCards | 1 | 1 | 3 | Only brand with inline images between carousel and cards |
| nike | `page.brand-nike.json` | bannerCarousel, productCarouselTabs, bannerCards | 1 | 1 | 3 | Hero uses Vimeo video (desktop + mobile variants) |
| puma | `page.brand-puma.json` | bannerCarousel, productCarouselTabs, bannerCards | 1 | 1 | 3 | Standard scaffold |
| ralph-lauren | `page.brand-ralph-lauren.json` | bannerCarousel, productCarouselTabs, bannerCards | 1 | 1 | 3 | Mens-only brand (metaobject `brand_categories` = Mens) |

**Data stream location:** `_reference/scraped/data/stream/brand-<slug>-route-routes--.json` (primary content source for each template)

---

## Metaobject Audit (deferred)

Liquid audit template still needed to confirm:
- Which of the 34 metaobjects has `brand_page` populated (expected: the 7 above)
- `mens_collection.handle` / `womens_collection.handle` for each brand (for A-Z listing fallback routing)
- Any mismatches between metaobject `brand_page` slugs and our scraped slugs (e.g. metaobject could say `/brands/adidas-originals` but live site serves `/brands/adidas-golf-originals`)

Temporary debug template to be created in Phase 2. Uses GitHub-integrated auto-deploy to run server-side against live metaobject data (no Admin API access for the client store).

---

## Build Order

### Phase 1 — Discovery ✅ complete

- [x] Update this doc with plan
- [x] Scrape `/brands` A-Z for brand-slug list — **7 slugs found**
- [x] Scrape each brand landing — all 7 captured with stream data

### Phase 2 — Template build (7 brands, pilot-first)

All 7 share the same 3-block scaffold (only Manors deviates with an extra `inlineImages` block). Batching isn't needed — safer to build one pilot, verify section settings port cleanly from Sanity data, then produce the other 6 in parallel.

1. **Pilot — `page.brand-ralph-lauren.json`**
   - Simplest standard scaffold: bannerCarousel (1 slide) + productCarouselTabs (1 tab) + bannerCards (3)
   - Source: `_reference/scraped/data/stream/brand-ralph-lauren-route-routes--.json`
   - QA: confirm hero image/CTA + carousel products + banner cards render match the live Sanity page
2. **Replicate pattern across remaining 6:**
   - `page.brand-jlindeberg.json` — standard scaffold
   - `page.brand-puma.json` — standard scaffold
   - `page.brand-adidas-golf-origina.json` — standard scaffold
   - `page.brand-nike.json` — standard scaffold + **Vimeo video hero** (desktop + mobile variants — hero-carousel already supports)
   - `page.brand-g-fore.json` — standard scaffold + **3 carousel tabs** instead of 1 (stress-tests our `product-carousel-tabs` section)
   - `page.brand-manors.json` — standard scaffold + **`media-grid` section** (maps from Sanity's `inlineImages` block)

### Phase 3 — Metaobject audit + A-Z routing

- Build Liquid audit template, capture metaobject dump, delete template
- Update `sections/brand-listing.liquid` (our theme) with fallback routing:
  1. Prefer `brand.brand_page_shopify.value.url` (new page-reference field, populated post-cutover)
  2. Else fall back to `brand.mens_collection.value.url` / `brand.womens_collection.value.url`
- Ensure womens A-Z listing routing mirrors this

### Phase 4 — Validate

- `validate_theme` across all 7 new templates
- Visual diff against live Sanity site per brand
- QA A-Z listing routing (landing page when `brand_page` populated; direct-to-collection fallback for the other 27 brands)

---

## Client Handover — Migration Steps

Go-live requires a coordinated sequence because Shopify's page-template dropdown only shows templates present in the **currently-published theme**. Client needs to pre-stage dummy templates in the legacy theme so pages can be created + assigned before our theme publishes. Sequence:

### Pre-deploy (client work, legacy theme still published)

1. **Add stub templates to legacy theme** (9 × `page.brand-<slug>.json`) with valid-but-empty JSON: `{"sections":{},"order":[]}`
   - Adds the template filenames to the admin dropdown
   - Legacy theme continues rendering default `page.json` for these (effectively hidden) until assignments are made
2. **Create Shopify Pages in admin** (9 pages):
   - Handle: `brand-nike`, `brand-ralph-lauren`, `brand-jlindeberg`, `brand-puma`, `brand-adidas-golf-origina`, `brand-g-fore`, `brand-manors`, `brand-head`, `brand-apc` (adidas handle shortened — Shopify page-handle char limit)
   - Template: assign the matching `page.brand-*.json` (now available in dropdown)
3. **Add metaobject field** `brand_page_shopify` (page reference type) alongside existing `brand_page` text field — don't modify existing field
4. **Populate `brand_page_shopify`** on each of the 9 brand metaobject entries, picking the new Shopify page

### Deploy

5. **Publish new theme** — our `page.brand-*.json` templates replace the stubs; content renders immediately

### Post-deploy (URL redirects)

6. **Create 301 redirects** for the 9 brand landings (Admin → Online Store → Navigation → URL Redirects):
   - `/brands/nike` → `/pages/brand-nike`
   - `/brands/ralph-lauren` → `/pages/brand-ralph-lauren`
   - (repeat for all 7)
   - Preserves SEO + prevents 404s from external inbound links
7. **Verification:**
   - Visit live A-Z listing → click each of the 7 branded entries → confirms landing page renders
   - Visit A-Z listing → click a brand without a landing (e.g. HEAD) → confirms it routes straight to collection
   - Visit old Sanity URL `/brands/nike` → confirms 301 to `/pages/brand-nike`

### Later — cleanup (optional)

- Remove old `brand_page` text field from metaobject definition once confident all routing goes through `brand_page_shopify`
- Remove stub templates from legacy theme if it's ever republished (unlikely — legacy theme will be unpublished)

---

## Open Questions — resolved by scrape

- [x] **Mens vs Womens split** — only one landing per brand, gender-agnostic. Hero CTA links into the mens collection directly; no `/brands/womens-<slug>` URLs exist.
- [x] **adidas vs adidas-originals** — live slug is `adidas-golf-originals`. Older scraped data referenced `adidas-originals` (now stale).
- [x] **Manors vs Manors v2** — only `manors` exists on live site. `brand-manorsv2.html` from the old scrape is stale.
- [x] **Nike regional variants** — no regional variants on the Sanity site. Legacy Shopify theme regional contexts are Shopify Markets setup, unrelated to brand landings. Drop from scope.
- [x] **Womens-specific brand landings** — none exist. Landings are one per brand, no gender split.

## Still Open

- [ ] **Metaobject `brand_page` coverage** — Liquid audit needed to confirm the 7 metaobjects corresponding to the scraped slugs have `brand_page` populated, and that no other metaobjects have it populated (would indicate a landing we missed)
- [ ] **Stale scraped files cleanup** — old scrapes contain `brand-adidas-originals`, `brand-apc`, `brand-gfore`, `brand-head`, `brand-manorsv2` HTML/data which don't match live slugs. Delete after Phase 2 batches confirm fresh data is complete.

---

## Reference Files

- `_reference/scraped/data/stream/brand-*.json` — Sanity data streams (source of truth for content)
- `_reference/scraped/html/brand-*.html` — rendered page shells (visual reference)
- `_reference/repo/app/routes/$.tsx` — Remix catch-all route serving brand pages
- `_reference/repo/app/sanity/requests/getPage.ts` — Sanity page fetch
- `_do-not-use/sections/brand-listing.liquid` — legacy A-Z listing (metaobject usage reference)
- `sections/brand-listing.liquid` + `snippets/brand-card.liquid` — our A-Z listing (Phase 4C-i)
- `docs/article-migration.md` — pattern this doc mirrors
