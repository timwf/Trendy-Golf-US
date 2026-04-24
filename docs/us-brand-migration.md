# US Brand Migration — Plan

## Overview

Port the brand A-Z listing and 8 bespoke brand landing pages from `trendygolfus.tdrstaging.co.uk` into Shopify page templates on `trendygolfusa`. Content lives in Sanity on staging and will be baked into section settings in JSON templates on Shopify.

**This is a pattern-migration of the approach in `docs/us-page-migration.md`, applied to brand pages.** Source of truth is US staging only. UK reference data, UK scrape scripts, and the UK `docs/brand-migration.md` are **not** usable assets — the UK doc is only a conceptual reference (page-template approach, metaobject field addition, fallback routing).

### Scope

| # | Template | Staging URL | Notes |
|---|---|---|---|
| 1 | `page.brand-listing.json` | `/brands` | A-Z index page. Sanity content: 1 `bannerCarousel` (APC "New Brand" spotlight) + 1 `bannerCards` (3 featured brand tiles). A-Z grid populated from Shopify `brand` metaobject via `sections/brand-listing.liquid` — no Sanity data for the grid. |
| 2 | `page.brand-apc.json` | `/brands/apc` | Standard scaffold |
| 3 | `page.brand-g-fore.json` | `/brands/g-fore` | Standard scaffold. Canonical slug is `g-fore`, not `gfore` — staging has both but `g-fore` is the newer/fuller page ("G/FORE Golf Apparel & Shoes" vs the legacy "G/FORE GOLF CLOTHING & ACCESSORIES"). |
| 4 | `page.brand-head.json` | `/brands/head` | Standard scaffold |
| 5 | `page.brand-jlindeberg.json` | `/brands/jlindeberg` | Standard scaffold |
| 6 | `page.brand-manors.json` | `/brands/manors` | **Only brand with 4-block scaffold** — adds `inlineImages` between `productCarouselTabs` and `bannerCards`. Canonical is `manors`, not `manorsv2` (both exist on staging; `manors` is newer + has the inline images block). |
| 7 | `page.brand-nike.json` | `/brands/nike` | Standard scaffold |
| 8 | `page.brand-puma.json` | `/brands/puma` | Standard scaffold |
| 9 | `page.brand-ralph-lauren.json` | `/brands/ralph-lauren` | Standard scaffold |

**9 templates total:** 1 listing + 8 bespoke landings.

### Out of scope

- Brands without a Sanity landing (the other ~88 of the 96 brand-metaobject entries) route direct-to-collection via the A-Z fallback logic in `sections/brand-listing.liquid`. No template needed.

---

## Architecture Decisions

### 1. Page templates, not collection templates

Brand landings ≠ collection pages. A brand landing is marketing (hero, tabbed carousel, promo tiles linking out to collections). A collection page is a filterable product grid. Keeping them separate:
- `page.brand-<slug>.json` → landings (this doc)
- `collection.json` (existing) → standard filterable product grids

### 2. Overwrite the 10 UK-built templates currently in `templates/` — mostly in place

The theme was forked from the UK repo. That carried over 10 brand-related JSON files, all populated with UK-specific content (UK `shopify://files/` URIs, UK product handles, UK copy). 8 of the 10 filenames happen to match the US slugs we need, and `page.brand-listing.json` also matches — so for those we **overwrite the file in place** rather than deleting + recreating. Cleaner git diff, no risk of a dangling page-template assignment during cutover.

| File | Decision | Why |
|---|---|---|
| `page.brand-listing.json` | **Overwrite in place** with US `/brands` scrape content | Filename also matches what `_do-not-use/` uses on the US live theme — any existing page-template assignment in admin carries through cleanly |
| `page.brand-apc.json` | **Overwrite in place** with `/brands/apc` scrape | Slug matches |
| `page.brand-g-fore.json` | **Overwrite in place** with `/brands/g-fore` scrape | Slug matches |
| `page.brand-head.json` | **Overwrite in place** with `/brands/head` scrape | Slug matches |
| `page.brand-jlindeberg.json` | **Overwrite in place** with `/brands/jlindeberg` scrape | Slug matches |
| `page.brand-manors.json` | **Overwrite in place** with `/brands/manors` scrape (4-block scaffold, has `inlineImages`) | Slug matches |
| `page.brand-nike.json` | **Overwrite in place** with `/brands/nike` scrape (video hero) | Slug matches |
| `page.brand-puma.json` | **Overwrite in place** with `/brands/puma` scrape | Slug matches |
| `page.brand-ralph-lauren.json` | **Overwrite in place** with `/brands/ralph-lauren` scrape | Slug matches |
| `page.brand-adidas-golf-origina.json` | **Delete** | US has no `adidas-golf-originals` Sanity landing — it routes direct to the collection |

Even where the slug matches, every setting inside (image URIs, product handles, CTAs, copy) must be replaced — UK data won't resolve on the US store.

### 2a. Naming convention for future brand landings

US live theme (`_do-not-use/templates/`) has **no bespoke `page.brand-<slug>.json` templates** — only generic A-Z variants (`page.brand-listing.json`, `page.brand.json`, `page.brands-mens.json`, `page.womens-brand-listing.json`) and two `collection.*brand*` templates that are enhanced collection pages, not landings.

Nothing on the live theme dictates a filename pattern for individual landings, so we **keep `page.brand-<slug>.json`** — already consistent with the 8 UK-forked files and the UK migration pattern. The `<slug>` matches the Sanity slug verbatim (e.g. `g-fore`, not `gfore`).

### 3. Metaobject `Brand Page` field — add new field, non-destructive

**Current US metaobject — 96 entries total, 32 published (rest in draft)**, confirmed 2026-04-24 via a temporary front-end audit section rendered above the A-Z grid. Only published entries surface through `metaobjects.brand.values`, so the A-Z is driven by those 32. Audit totals:

- `brand_image`: 28 / 32
- `alphabet_reference`: 32 / 32
- `mens_collection`: 28 / 32
- `womens_collection`: 18 / 32
- `brand_page` (legacy Sanity slug text): 6 / 32
- `brand_page_shopify` (new page ref): 0 / 32 (not yet populated — client work)

The 4 brands missing `brand_image` and/or `mens_collection` will render a name-only card with degraded CTAs until client completes metaobject data entry. The 6 with `brand_page` text populated is fewer than the 8 landings we're porting — 2 landings (likely newer additions on staging) aren't yet wired to their metaobject entries. Client to populate `brand_page_shopify` on all 8 landing brands during cutover regardless.



| Field | Type | Purpose |
|---|---|---|
| `brand_name` | single line text | Display name |
| `alphabet_reference` | choice list | A-Z grouping |
| `brand_categories` | choice list | Mens / Womens / both |
| `brand_image` | image file | A-Z listing thumbnail |
| `mens_collection` | collection ref | Mens collection fallback |
| `womens_collection` | collection ref | Womens collection fallback |
| `brand_page` | single line text | Sanity slug (legacy, will retire post-migration) |

**To add on the US store:** `brand_page_shopify` (page reference type) **alongside** the existing `brand_page` text field. Non-destructive — don't modify the existing field or it wipes the Sanity slug values on save, and we lose the ability to roll back cleanly.

**A-Z routing priority — already implemented in `snippets/brand-card.liquid`** (carried over from the UK build; no theme changes needed for US):

1. If `brand.brand_page_shopify.value.url` is set → single full-width **"The Brand"** CTA linking to the Shopify page
2. Else render **Mens** / **Womens** CTAs from `mens_collection.value.url` / `womens_collection.value.url` (or a single full-width button if only one gender applies)
3. If no collections either, the card shows the logo only with no CTAs

Client populates `brand_page_shopify` on the 8 brands with landings during the cutover window. Brands without a landing automatically render the mens/womens CTAs.

### 4. Content porting — follow `us-page-migration.md` pattern

One bespoke `page.brand-<slug>.json` per landing, content baked into section settings from the scraped Sanity `.data` response. All required sections already exist in the theme (`hero-carousel`, `product-carousel-tabs`, `banner-cards`, `media-grid`). No new section work.

---

## Source of Truth

1. **Scraped Sanity data streams:** `_reference/scraped/brands/<slug>.data.json` (9 files — one per landing, plus `_listing-page.data.json` for the `/brands` index).
   - Captured from `https://trendygolfus.tdrstaging.co.uk/brands/<slug>.data` (Remix single-fetch format — full Sanity page content embedded, no browser needed).
   - The `_probe-summary.json` file in the same dir records all 27 candidate slugs probed and which returned valid landings.
2. **Rendered pages (visual reference):** `https://trendygolfus.tdrstaging.co.uk/brands/<slug>` — always verify the final JSON against the rendered page before sign-off.
3. **Sanity CDN (for images):** `https://cdn.sanity.io/images/a2qwxh6f/staging/<hash>-<dims>.<ext>` — no auth, strip `?fm=webp&auto=format` from URLs to download the original file.

---

## Section Mapping

Every US brand landing uses the same scaffold (only Manors has a 4th block):

| Sanity block | Used in | Our section | Status |
|---|---|---|---|
| `bannerCarousel` | 8/8 landings + `/brands` page | `hero-carousel` | ✅ Built. Supports image + video + mobile variants. |
| `productCarouselTabs` | 8/8 landings | `product-carousel-tabs` | ✅ Built. Tabbed collection-driven product carousel. |
| `bannerCards` | 8/8 landings + `/brands` page | `banner-cards` | ✅ Built. Promo card grid with image + heading + link + button label. |
| `inlineImages` | 1/8 landings (Manors only) | `media-grid` | ✅ Built. 2-col image grid. |
| `shopTheLook` | 7/8 landings (all except `head`) | `shop-the-look` (shape mismatch) | ⚠️ **Deferred — dropped from scope 2026-04-24.** Sanity block is Men/Women tabs with per-tab images + copy + hotspot products; our section is single-image + 4-product grid. The scraped stream doesn't carry the hotspot product handles either. Revisit with client later if they want parity. |

**No new sections needed in scope.** The `shopTheLook` gap is a known content-loss item flagged to the client.

---

## Workflow (per landing)

Mirroring `docs/us-page-migration.md` step-by-step:

1. **Read the scraped stream** (`_reference/scraped/brands/<slug>.data.json`). It's Remix's numeric-reference-compressed single-fetch format — use Python to traverse, or fall back to the rendered staging page at `/brands/<slug>` for human-readable content.
2. **Cross-check with the rendered staging page** at `https://trendygolfus.tdrstaging.co.uk/brands/<slug>` for section order, copy, image usage, CTAs.
3. **Map Sanity blocks to theme sections** using the table above. Block order on staging = section order in the JSON.
4. **Port content into JSON.** Write a new `templates/page.brand-<slug>.json`:
   - Set section settings from Sanity (titles, body, CTA text, button URLs)
   - Clear `shopify://files/` and `shopify://shop_images/` URIs (store-scoped, UK-origin won't resolve on US)
   - Verify `shopify://collections/<handle>` targets exist on `trendygolfusa` — US handles often differ
   - Verify product handles referenced in `productCarouselTabs` exist on US
   - For `hero-carousel` slides with no title, set `heading: ""` explicitly (schema default renders "Heading" otherwise)
5. **Download assets** to `~/Downloads/trendy-golf-us-brand-assets/<slug>/<NN>-<section-type>/` — see layout below.
6. **Hand off to Tim.**
   - Upload images via Shopify customizer
   - Create the Shopify Page (handle: `brand-<slug>`)
   - Assign the `brand-<slug>` theme template
   - Populate `brand_page_shopify` on the matching brand metaobject entry
7. **QA on preview.** Compare `trendygolfusa` preview against `/brands/<slug>` staging; flag drift. Verify A-Z listing routes to the new page (not a collection) for this brand.

### Workflow for the `/brands` listing page

Same steps, but the template is `page.brand-listing.json` and scope is only:
- `hero-carousel` — APC "New Brand" spotlight (1 slide)
- `banner-cards` — 3 featured brand tiles (Puma, Nike, J.Lindeberg as scraped, each linking to the relevant `/pages/brand-<slug>` once those pages exist)
- `brand-listing` — existing section, pulls from metaobjects at render time

No sections need content from the metaobject — that's handled by the section Liquid itself.

---

## Asset Folder Structure

Mirrors `us-page-migration.md` layout, one folder per brand:

```
~/Downloads/trendy-golf-us-brand-assets/
├── _brands-listing/              # the /brands A-Z page itself
│   ├── 01-hero/
│   │   └── desktop.jpg           # APC spotlight
│   └── 02-banner-cards/
│       ├── puma.jpg
│       ├── nike.jpg
│       └── jlindeberg.jpg
├── apc/
│   ├── 01-hero/
│   │   ├── desktop.jpg
│   │   └── mobile.jpg
│   └── 03-banner-cards/
│       ├── card-1.jpg
│       ├── card-2.jpg
│       └── card-3.jpg           # 02-product-carousel-tabs has no images
├── g-fore/
│   └── ...
├── nike/
│   ├── 01-hero/
│   │   ├── desktop.mp4          # Nike uses video hero (Sanity video via CDN URL)
│   │   └── poster.jpg
│   └── ...
└── manors/
    ├── 01-hero/
    ├── 03-media-grid/           # the extra inlineImages block
    │   ├── image-1.jpg
    │   └── image-2.jpg
    └── 04-banner-cards/
```

### Naming rules (per `us-page-migration.md`)

- **Section folder:** `<NN>-<section-type>` where `NN` is 1-indexed position in the page; `<section-type>` matches the Liquid section filename (`hero`, `product-carousel-tabs`, `banner-cards`, `media-grid`).
- **Image file:** `desktop.<ext>` / `mobile.<ext>` for single-image sections. For multi-image sections use a descriptor (`card-1.jpg`, `card-2.jpg`). Keep original extension; don't re-encode. Grab the largest `srcset` variant from staging.
- **Video heroes:** save the raw video (`.mp4` / `.webm`) alongside a `poster.jpg`. In the JSON, use the `hosted_video_url` text field with the Shopify CDN URL once uploaded, matching the pattern established in `docs/article-migration.md`.

---

## Build Order

Two phases — a pilot to validate the workflow, then a single batch for the 8 landings.

### Phase 1 — Pilot

**`page.brand-listing.json`** — the `/brands` index page. Simplest scaffold (hero + banner-cards only, no product carousel), so lowest-risk pilot for the scrape-to-JSON-to-assets workflow. Once this ships and `brand_page_shopify` is populated on the staged brands, the A-Z works end-to-end (cards route to the 8 pages once those pages exist — until then they fall back to Mens/Womens collection CTAs).

### Phase 2 — All 8 landings in one batch

Work through all 8 landings together once the pilot confirms the pattern. Order within the batch doesn't matter much, but some have special handling worth front-loading or back-loading:

- **Standard 3-block scaffold (6):** `apc`, `g-fore`, `head`, `jlindeberg`, `puma`, `ralph-lauren`
- **Video hero (1):** `nike` — needs the MP4 uploaded to US Shopify files first, then the CDN URL pasted into `hosted_video_url`
- **4-block scaffold (1):** `manors` — adds an extra `inlineImages` block between `productCarouselTabs` and `bannerCards`, mapped to `media-grid`

All 8 get ported + asset-downloaded together. Tim handles the admin work (page creation, template assignment, `brand_page_shopify` population) as a single pass across all 8 after the JSON + assets are ready.

## Per-Template Migration Status

| Template | Scraped | JSON ported | Assets downloaded | Uploaded in admin | QA |
|---|---|---|---|---|---|
| `page.brand-listing.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.brand-ralph-lauren.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.brand-apc.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.brand-g-fore.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.brand-head.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.brand-jlindeberg.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.brand-puma.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.brand-nike.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.brand-manors.json` | ✅ | ✅ | ✅ | ☐ | ☐ |

---

## Client Handover — Go-Live Sequence

Shopify's page-template dropdown in admin only shows templates present in the **currently-published theme**. Pages must be created + assigned to `brand-<slug>` templates before the new theme publishes, which means stub templates in the legacy theme first:

### Pre-deploy (legacy theme still published)

1. **Add 8 stub templates to the legacy theme** — one per bespoke landing (`page.brand-apc.json`, `page.brand-g-fore.json`, `page.brand-head.json`, `page.brand-jlindeberg.json`, `page.brand-manors.json`, `page.brand-nike.json`, `page.brand-puma.json`, `page.brand-ralph-lauren.json`): valid but empty JSON `{"sections":{},"order":[]}`. Adds the filenames to the admin page-template dropdown. Legacy theme continues rendering `page.json` default for these until assigned.
   - **No stub needed for `page.brand-listing.json`** — legacy theme already has one (generic A-Z). Our content replaces it post-publish.
2. **Create or reassign 9 Shopify Pages in admin:**
   - `brand-listing` (page already exists on the live store under the current A-Z template; just confirm it stays on `brand-listing`)
   - Create new pages: `brand-apc`, `brand-g-fore`, `brand-head`, `brand-jlindeberg`, `brand-manors`, `brand-nike`, `brand-puma`, `brand-ralph-lauren`
   - Assign the matching `page.brand-*` theme template (now available in the dropdown via step 1)
3. **Add metaobject field** `brand_page_shopify` (page reference type) alongside existing `brand_page` text field — **do not modify the existing field**.
4. **Populate `brand_page_shopify`** on the 8 brand metaobject entries for the brands with landings. Leave empty on the other ~88.

### Deploy

5. **Publish the new theme.** Our `page.brand-*` templates replace the stubs; content renders immediately.

### Post-deploy (URL redirects)

6. **Create 301 redirects** (Admin → Online Store → Navigation → URL Redirects) for inbound Sanity-slug links:
   - `/brands/apc` → `/pages/brand-apc`
   - `/brands/g-fore` → `/pages/brand-g-fore`
   - `/brands/gfore` → `/pages/brand-g-fore` (legacy alias)
   - `/brands/head` → `/pages/brand-head`
   - `/brands/jlindeberg` → `/pages/brand-jlindeberg`
   - `/brands/manors` → `/pages/brand-manors`
   - `/brands/manorsv2` → `/pages/brand-manors` (legacy alias)
   - `/brands/nike` → `/pages/brand-nike`
   - `/brands/puma` → `/pages/brand-puma`
   - `/brands/ralph-lauren` → `/pages/brand-ralph-lauren`
   - `/brands` → `/pages/brand-listing`
7. **Verification:**
   - A-Z listing → click each of the 8 brands with landings → confirms landing page renders
   - A-Z listing → click a brand without a landing (e.g. Greyson, BOSS) → confirms direct-to-collection routing
   - Sanity slug URL `/brands/nike` → 301 to `/pages/brand-nike`

### Later — cleanup

- Remove old `brand_page` text field from the metaobject definition once confident all routing goes through `brand_page_shopify`.

---

## Watch Out For (brand-specific adds to the page-migration list)

- **Duplicate Sanity slugs on staging** — `/brands/gfore` and `/brands/manorsv2` both return valid but stale content. Canonical slugs are `g-fore` and `manors`. The A-Z listing on the published US store must only point at the canonical slugs.
- **Nike hero is video** — per the scraped stream. Use the `hero-carousel` slide's `hosted_video_url` text field with the Shopify CDN URL, matching the CDN-video pattern from article migration. Set `media_type: "video"`.
- **Product handles in `productCarouselTabs`** — Sanity stores product references as handles, but US and UK product handles may differ. Verify every product in every tab resolves on `trendygolfusa` before porting; dead handles need to be swapped or flagged to the client.
- **Collection handles in CTA links** — hero CTAs and banner-card CTAs often link to `/collections/<handle>`. US handles often include `mens-`/`womens-` prefixes (e.g. UK `nike` vs US `mens-nike-golf`). Verify each before porting.
- **Shopify URI cleanup** — per `us-page-migration.md`, clear `shopify://files/` AND `shopify://shop_images/` URIs. Both are store-scoped.
- **hero-carousel heading gotcha** — slides without `heading: ""` explicitly set render the schema default ("Heading") on the image. Already-known; flagged in memory.
- **Mirror staging verbatim** — don't "fix" obvious staging errors (e.g. CTA pointing at a 404 collection). Flag, don't repair.

---

## Open Questions

- [ ] **Any US landings missed?** Probed 27 candidate slugs, 8 resolved as unique. The 96-entry metaobject (32 published) could contain a brand with a non-obvious slug we didn't guess. If any A-Z entry still renders as a dead-end or client reports a brand with no landing, probe that slug's `/brands/<slug>.data` and add to the list.
- [ ] **4 brands missing `brand_image`, 4 missing `mens_collection`** — identified in the 2026-04-24 audit but not itemised. Client to backfill ahead of cutover; flag here once the specific brands are known.
- [ ] **Is `/brands` page content going to change** (e.g. APC spotlight rotated out, different featured tiles) before the US store goes live? If yes, re-scrape `/brands.data` and re-port `page.brand-listing.json` closer to launch.
- [x] **Video hero hosting — resolved.** All 7 video heroes on staging (ralph-lauren, jlindeberg, puma, g-fore, head, nike, manors) use Vimeo oembed, not raw MP4. No Shopify Files upload needed — `video_url` + `video_url_mobile` fields carry the Vimeo URLs directly. `hosted_video_url` only becomes relevant if the client later chooses to self-host.
- [ ] **`brand_page_shopify` metaobject field** — client needs to add this field definition before pages can be assigned. Coordinate the schema change + bulk-populate with the launch sequence.
- [ ] **`shopTheLook` block deferred** — 7/8 landings (all except `head`) include a `shopTheLook` Sanity block with Men/Women tabbed looks + hotspot products. Dropped from initial port 2026-04-24 because (a) our `shop-the-look` section is single-image, not tabbed, and (b) the scraped stream doesn't carry the hotspot product handles. Either extend the section to support tabs + hotspot products and re-scrape the live DOM for handles, or accept the content-loss. Flag to client.
- [ ] **Ralph Lauren product handles don't resolve on Shopify** — Sanity carousel references `tech-hooded-pullover-twilight-camo`, `3-gs-tech-jersey-polo-lava`, `x-trendygolf-limited-edition-all-day-polo-twilight`, `mg4-o2-camo-golf-shoes-nimbus`; none exist in `/collections/mens-ralph-lauren-clothing` on `trendygolfusa.com` (37 products, all `rlx-*` prefix). Several handles also look non-RL (e.g. `mg4-o2` reads like G/FORE, `3-gs-tech` ambiguous). Ported verbatim per mirror-staging rule — flag to client for review. They'll render as empty cards in the carousel until handles are reconciled.
- [ ] **Ralph Lauren collection redirect** — Sanity CTAs link to `/collections/mens-ralph-lauren`, which 301s to `/collections/mens-ralph-lauren-clothing`. Ported verbatim (the redirect is transparent to users); consider updating to canonical handle at QA time if the 301 hop causes any client-side nav friction.
- [ ] **Handle-coverage broken across ALL 8 landings — systemic Sanity/Shopify drift.** Per-brand verification 2026-04-24:
  - **apc** — entire brand "launching soon": every collection handle probed (`mens-apc`, `mens-apc-golf`, `mens-apc-clothing`, `a-p-c`, etc.) 404s. All 3 banner-card CTAs + hero CTA have empty `linkSlug` on Sanity, so nothing resolves. Expected — flag as "blocked until client publishes APC brand in Shopify".
  - **g-fore** — collections resolve cleanly (`mens-g-fore` + `womens-g-fore` + footwear variants = 200), but all 10 product handles across Mens + Womens carousel tabs 404 (none in 57-product `mens-g-fore` or 37-product `womens-g-fore`).
  - **head** — canonical collection is `mens-head-golf-apparel` (27 products) but Sanity links to no head-brand collection at all (all hero + card CTAs have `null` linkReference and no linkSlug). All 4 product handles match ralph-lauren verbatim (`tech-hooded-pullover-twilight-camo`, `3-gs-tech-jersey-polo-lava`, `x-trendygolf-limited-edition-all-day-polo-twilight`, `mg4-o2-camo-golf-shoes-nimbus`) — Sanity content appears copy-pasted between brand pages and not curated.
  - **jlindeberg** — `/collections/mens-jlindeberg` 301s to `/collections/mens-j-lindeberg` (fine); 2 of 3 card collections 404; all 4 products 404.
  - **manors** — `/collections/mens-manors-golf` 404s (brand not on Shopify at all); all 14 product handles across 3 carousel tabs 404.
  - **nike** — `/collections/mens-nike` 301s to `/collections/mens-nike-golf-shoes` (which is shoes only, not apparel — odd canonical); all 4 product handles 404.
  - **puma** — `/collections/mens-puma` 404 (canonical is `mens-puma-clothing` — 200); all 4 products 404.
  - **ralph-lauren** — `/collections/mens-ralph-lauren` 301s to `/collections/mens-ralph-lauren-clothing` (37 products, all `rlx-*`); all 4 product handles 404 and same-as-head (Sanity duplicate).

  **Root cause likely:** Sanity brand-landing content was seeded with UK handles / stale handles / placeholder handles and never synced to US Shopify store. All handles ported verbatim per mirror-staging rule — carousels will render as empty cards until the client either reconciles Sanity to US product handles OR we substitute with real US product handles at QA time.

- [ ] **`g-fore` scaffold deviates** — 6 Sanity blocks (hero, banner-cards, product-carousel-tabs, hero, shopTheLook, banner-cards) vs the 3-block standard. Ported as 5 sections (the shopTheLook is skipped). Template structure: `hero_1` → `banner_cards_1` → `product_carousel_1` → `hero_2` → `banner_cards_2`. Worth noting for QA — this is the only brand with 2 heroes + 2 banner-card blocks + a non-standard order.
- [ ] **Head carousel has 1 tab, not 3.** UK doc predicted Polos / Jackets & Mid-Layers / Trousers tab split — US staging has only a single unnamed tab. Ported verbatim (tab_1_label: "", tab_2/tab_3 empty). Flag to client whether additional tabs are expected.
- [ ] **Head + ralph-lauren Sanity content appears copy-pasted.** Both brand landings reference the same 4 product handles in their carousel. Strongly suggests the Sanity dataset was seeded from a template and never curated per-brand. Client should audit Sanity before the redirects go live.
- [ ] **Unlinked CTAs on apc, head** — Sanity button records with `linkReference: null` and empty `linkSlug` preserved as `button_link: ""` / `link: ""`. Means the hero + card buttons render label-only with no destination. Mirror-staging per the rule; flag to client.

---

## Reference

- `_reference/scraped/brands/` — 8 landing `.data.json` streams + `_listing-page.data.json` + `_probe-summary.json`
- `docs/us-page-migration.md` — workflow + asset folder pattern this doc mirrors
- `docs/us-store-migration.md` — master US migration plan
- `docs/brand-migration.md` — UK doc, conceptual reference only
- `sections/brand-listing.liquid` + `snippets/brand-card.liquid` — the A-Z listing section (needs routing update in step 3 of Architecture)
