# US Article Template Migration — Plan

## Overview

The US live theme (`trendygolfusa`) has **70 custom article templates**. This mirrors the UK article migration (see `docs/article-migration.md`) but with a different template set and US-specific content. The live theme was built by the same agency (Eastside Co / SALVO framework), so the section structure is identical — each article is a JSON template assembled from reusable sections, with content baked into section settings.

Because this repo was forked from the UK build, every section and snippet used by the UK migration is already in place. This is purely a content-porting exercise, not a section-building one (with two small exceptions — see below).

### Source of truth

- **`_do-not-use/templates/article.*.json`** — the US live theme, already pulled. This is the content source for every template port. All image URIs, product handles, collection handles, and copy inside these files are already correct for the US store.
- **Do not use the UK repo or the UK `article.*.json` files as a content source**, even for the 18 templates whose slugs overlap. UK content will not resolve on the US store (different `shopify://` URIs, potentially different product/collection handles).

### Current repo state

As of 2026-04-23, all 50 UK custom article templates were deleted from `templates/`. Only the default `templates/article.json` remains. Several US article slugs overlap with UK ones, so leaving the UK templates in place would have caused US articles to silently render UK content.

**Progress (2026-04-23):** Phase 1 complete — both missing sections built (`sections/media-text.liquid`, `sections/featured-collections.liquid`). Pilot port `templates/article.coursetostreet.json` validated on staging; its defaults (margins, font, alignment) are the convention for subsequent ports. **All 70 templates ported.** Batches: 1 (9), 2 (17), 3 (21 incl. pilot), 4 (8), 5 (11), 6 (2), 7 (2). Next step: Phase 3 QA pass on staging.

**Porting workflow — updated:** Port fresh from `_do-not-use/templates/*.json` only. Don't use git history of UK ports as a shortcut. Single source of truth (US live theme content) prevents UK-tuned defaults (margin values, font choices) from silently contaminating US templates. Slightly more work per template, but cleaner audit trail and predictable output.

---

## Section Mapping

Same scaffold as UK: `breadcrumbs` → `article_intro` → content sections → `article_featured`. Every section used by the US live theme maps cleanly to a section we already built, except two that are new to the US scope.

### Already built — ready for porting

| Their Section | US usage | Our Equivalent | Notes |
|---|---|---|---|
| `breadcrumbs` | 70/70 | Built into `article-template` | Part of our article section |
| `article_intro` | 70/70 | `article-template` | Title, excerpt, date, featured image |
| `article_main` | 9/70 enabled, 61/70 disabled | `article-template` | Rich-text body via `.rte-article` |
| `article_featured` | 70/70 | `magazine-articles` | "Latest Articles" carousel |
| `hero` | 157 instances across 65 templates | `hero-carousel` | Image or video. CDN videos via `hosted_video_url` text field. Single-slide usage |
| `text-block` | 288 instances | `content-block` | Rich text + title + CTA |
| `featured-products` | 66 instances | `featured-collection` | Collection-based product carousel |
| `shop-the-look` | 38 instances | `shop-the-look` | 2-col split: hero image with overlay + 2x2 product grid |
| `promotion-tiles` | 25 instances | `banner-cards` | Each tile = `card` block with `heading`, `image`, `link`, `button_label` |
| `media-grid` | 58 instances | `media-grid` | 2-col image grid |
| `media-showcase` | 14 instances | `media-grid` | All instances are grid-only (showcase_item blocks only, no heading/highlights). Same verdict as UK |
| `testimonial` | 3 instances | `testimonial` | Pull-quote with optional title + credit |
| `product-overview` | 1 instance (viktor-blog-post) | `product-overview` | Image-left + title/intro/product-card/CTA-right split |
| `video` | 0 instances | `video-embed` | Not used on US live theme. Section is already built (from UK) if ever needed |

### New sections — need to build

| Their Section | US usage | What It Is | Approach |
|---|---|---|---|
| `media-text` | 12 instances across 11 templates | Split layout: image on one side, heading + subtitle + rich-text copy + optional CTA on the other. Media-first toggle per breakpoint. Supports image, self-hosted video, or embed | ✅ Built — `sections/media-text.liquid`. Similar structure to `product-overview` minus the product card |
| `featured-collections` (plural) | 2 instances (`malboncardigan`, `pga-championship`) | Tile carousel where each block is a collection (not products within a collection). Block settings: `collection` handle, `collection_image`, `collection_title` | ✅ Built — `sections/featured-collections.liquid`. Distinct from our existing `featured-collection` (singular = product carousel from one collection). `browsing_preference` field dropped |

### `media-text` — schema sketch

From `article.masters-blog.json`:

- Section settings: `media_first_desktop` (boolean), `media_first_mobile` (boolean), `media_type` (image/video/embed), `embed` (text), `video_src` (text), `image` (image_picker), `title` (text), `subtitle` (text), `copy` (richtext), `btn_text` (text), `btn_link` (url), `btn_style` (select), `text_color` (color), `background_color` (color), `max_width` (number)

### `featured-collections` — schema sketch

From `article.malboncardigan.json`:

- Section settings: `title` (text), `btn_text` (text), `btn_link` (url), `browsing_preference` (select — men/women/none, legacy SALVO, can drop)
- Blocks: `collection` type with `collection` (collection picker), `collection_image` (image_picker), `collection_title` (text)

---

## Template Migration List

Each row is a template that needs a matching `article.<slug>.json` created in `templates/` with content ported from `_do-not-use/templates/`.

Columns: `hero` · `text-block` · `featured-products` · `featured-collections` · `shop-the-look` · `promotion-tiles` · `media-grid` · `media-showcase` · `media-text` · `testimonial` · `product-overview`

### Full Editorial Templates (61) — `article_main` disabled

| Template | hero | text | f-prod | f-coll | shop | promo | m-grid | m-show | m-text | testim | p-over |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 4acesxex | 4 | 7 | 1 | — | — | — | 2 | — | — | — | — |
| a-putnam-fall-collection | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| adidas-x-jay3lle | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| adidasoriginals | 3 | 3 | 1 | — | — | — | 1 | — | — | — | — |
| aegean-storm | 1 | 1 | — | — | — | 1 | 1 | — | — | — | — |
| akxtrendygolf | 3 | 4 | — | — | — | — | 2 | — | — | — | — |
| coursetostreet ✅ | 1 | 1 | 1 | — | — | — | 1 | — | — | — | — |
| fall2025_trends_blog | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| fathersdaygiftideas | 1 | 8 | 6 | — | — | — | — | — | — | — | — |
| first-major-outfit-guide | 1 | 7 | — | — | 5 | — | — | — | — | — | — |
| futureofwaterproofs | 3 | 3 | 1 | — | — | — | — | — | — | — | — |
| g4xtrendycollab | 1 | 1 | 1 | — | — | — | 1 | — | — | — | — |
| golf-style-icons | 4 | 6 | 1 | — | — | — | 3 | — | — | — | — |
| greyson-su24 | 1 | 6 | 1 | — | 1 | 1 | — | — | — | — | — |
| hottakes_golffashion | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| introducing-a-putnam | 2 | 6 | 1 | — | 1 | 3 | — | 1 | 1 | — | — |
| introducing-b-draddy | 3 | 5 | 1 | — | — | — | 1 | 1 | — | — | — |
| introducingfieldday | 2 | 2 | 1 | — | — | — | 1 | — | — | — | — |
| introducingmanorsgolf | 2 | 6 | 1 | — | — | 1 | — | 2 | 1 | — | — |
| introducingvarley | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| introducingwalker | 2 | 7 | 1 | — | — | — | 2 | — | — | 3 | — |
| j-pritchard | 1 | 2 | 1 | — | — | 1 | 1 | — | — | — | — |
| jason-day-x-malbon-golf | 2 | 2 | 1 | — | 1 | 1 | — | 1 | 1 | — | — |
| jasonday-malbon | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| jlindebergparicollection | 1 | 3 | 1 | — | — | 1 | 1 | — | — | — | — |
| jordan-9-true-red | 1 | 1 | 1 | — | — | — | 1 | — | — | — | — |
| jordan-pga-champs-shoe | 1 | 1 | 1 | — | — | — | 1 | — | — | — | — |
| kjus-spring-summer-2024 | 2 | 9 | 1 | — | 6 | — | — | — | — | — | — |
| lussoxno33 | 2 | 5 | 1 | — | — | 1 | — | 1 | 1 | — | — |
| malboncardigan | 3 | 6 | 1 | 1 | — | — | 2 | — | — | — | — |
| malboncolacollection | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| manorsxreebokusopen | 2 | 2 | 1 | — | — | — | 1 | — | — | — | — |
| masters-blog | 5 | 6 | 1 | — | — | 1 | — | 1 | 1 | — | — |
| miuraxreinigingchamp | 3 | 2 | 1 | — | — | 1 | — | — | 1 | — | — |
| mother-s-day-gift-ideas | 1 | 7 | 5 | — | — | — | — | — | — | — | — |
| new-holderness-bourne | 2 | 5 | 1 | — | — | 3 | — | 1 | 1 | — | — |
| newbrandtilley | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| newbrandzerorestrictions | 1 | 1 | 1 | — | — | — | 1 | — | — | — | — |
| pga-championship | 2 | 2 | — | 1 | — | 1 | — | — | — | — | — |
| presidentscupdraddy | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| puma-x-ap-ss24 | 2 | 5 | 1 | — | 1 | 1 | — | — | — | — | — |
| puma-x-quiet-golf-mag | 2 | 2 | 1 | — | — | 1 | — | — | — | — | — |
| rhone | 4 | 5 | 1 | — | — | — | 2 | — | — | — | — |
| rollinglinks | 3 | 5 | 1 | — | — | — | 2 | — | — | — | — |
| scotlandtripessentials | 5 | 7 | 1 | — | 1 | — | — | 2 | — | — | — |
| students | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| summer-destinations | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| the-open | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| the-players | 2 | 4 | — | — | — | 1 | — | 1 | 1 | — | — |
| thisyearataugusta | 2 | 4 | 1 | — | — | — | 1 | — | — | — | — |
| trendy-picks-golf-bags | 2 | 6 | — | — | 4 | — | — | — | — | — | — |
| trendy-picks-nike-ss24 | 2 | 7 | — | — | 5 | — | — | — | — | — | — |
| trendy-picks-under-armour | 2 | 6 | — | — | 4 | — | — | — | — | — | — |
| us-open-2025 | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| varley-new-uniform | 4 | 6 | 1 | — | — | — | 2 | — | — | — | — |
| viktor-blog-post | — | 2 | 2 | — | — | — | — | — | — | — | 1 |
| waste-managment | 2 | 6 | 1 | — | 2 | 1 | — | 1 | 1 | — | — |
| welcombogeyboys | 2 | 6 | 1 | — | 1 | 3 | 1 | 1 | 1 | — | — |
| williamsathleticclub | 3 | 4 | 1 | — | — | — | 1 | — | — | — | — |
| winter-golf-destination | 2 | 5 | 1 | — | — | 2 | — | 1 | 2 | — | — |

### Minimal Templates (9) — `article_main` enabled

These use `article-template` for the rich-text body and may or may not need extras beyond the standard scaffold. If they only add a single `featured-products`, they could theoretically use the default `article.json` — but Shopify needs a matching template file to exist, so every slug still gets a custom JSON. Just a lighter scaffold.

| Template | hero | text | f-prod | f-coll | shop | promo | m-grid | m-show | m-text | testim | p-over |
|---|---|---|---|---|---|---|---|---|---|---|---|
| air-max-day-2024 | — | — | 1 | — | — | — | — | — | — | — | — |
| christmas-gift-guide | — | 2 | — | — | 1 | — | — | — | — | — | — |
| first-major-preview-2024 | — | — | 1 | — | — | — | — | — | — | — | — |
| fromcoursetostreet | 1 | — | — | — | 1 | — | — | — | — | — | — |
| gforextg20years | 1 | — | — | — | 1 | — | — | — | — | — | — |
| pga-champ-shoes | — | — | 1 | — | — | — | — | — | — | — | — |
| puma-ptc-2024 | — | — | — | — | 1 | — | — | — | — | — | — |
| puma-x-duvin-mag | — | — | — | — | 1 | — | — | — | — | — | — |
| tg-style-blog | — | — | — | — | 1 | — | — | — | — | — | — |

---

## How to Port a Single Template

Per-template workflow, meant to be mechanical enough for an autonomous run:

1. **Read the source.** Open `_do-not-use/templates/article.<slug>.json`. The file has a C-style comment header before the JSON — skip it (`sed -n '/^{/,$p'` or just strip lines 1–9 when parsing manually).
2. **Create the target.** `templates/article.<slug>.json` with our standard scaffold:
   - `breadcrumbs` → `article-template` (their `article_intro` + optional `article_main`) → [content sections in live order] → `magazine-articles` (their `article_featured`)
3. **Translate each content section** using the mapping table above. One live section → one of our sections. Per-section field notes:
   - `hero` → `hero-carousel` single-slide. If live has `video` or `hosted_video_url`, set `media_type: "video"` and copy the CDN URL into our `hosted_video_url`. Image URIs go to `image`; mobile URIs go to `mobile_image`.
   - `text-block` → `content-block`. Copy `title`, `body` (rich text), CTA fields verbatim where names match.
   - `featured-products` → `featured-collection`. Use the live `collection` handle.
   - `shop-the-look` → `shop-the-look`. Preserve `image`, `mobile_image`, `title`, `subtext`, `btn_text`, `btn_link`. Copy product-block handles 1:1 into our `product` picker blocks (native picker accepts live handles).
   - `promotion-tiles` → `banner-cards`. Each tile = one `card` block: `heading`, `image`, `link`, `button_label`.
   - `media-grid` → `media-grid`. Image blocks only.
   - `media-showcase` → `media-grid`. All US instances are grid-only (same verdict as UK). Map `showcase_item.showcase_image` → our image block.
   - `media-text` → `media-text` (Phase 1 build). Port settings 1:1.
   - `featured-collections` (plural) → `featured-collections` (Phase 1 build). Port blocks 1:1.
   - `testimonial` → `testimonial`.
   - `product-overview` → `product-overview`.
   - `video` → `video-embed`. Not used on any US template but already built.
4. **Preserve verbatim:** `shopify://shop_images/*` and `shopify://files/*` URIs (already US store); product handles; collection handles; `disabled: true` flags on individual sections.
5. **Drop silently:** `browsing_preference` field (legacy SALVO men/women filter, not ported). Empty-string settings (let the section defaults apply).
6. **Dead handles are fine** — don't stop to audit. Shop-the-look already renders a placeholder for deleted products; product-overview and featured-collection will silently fail on an invalid handle and we'll catch them in the QA pass.
7. **Validate:** `shopify theme check` on the resulting JSON. If the template opens in Shopify admin's theme editor without errors, it's good.

---

## Build Order

### Phase 1 — Build the two missing sections ✅ Complete

1. ✅ **`sections/media-text.liquid`** — built. 2-col split layout, per-breakpoint media ordering via `media_first_desktop`/`media_first_mobile`, supports image / self-hosted video / YouTube+Vimeo embed. Schema matches live's field names exactly; added our conventions (`margin_bottom`, `enable_animation`). SALVO `btn_style` values translated to Tailwind classes via a `case/when`. Unblocks Batch 5 (11 templates).
2. ✅ **`sections/featured-collections.liquid`** (plural) — built. Responsive tile grid (auto-adjusts cols based on block count: 2/3/4 at `lg`). Each block = collection tile with optional override image + title, falls back to collection's native image/title. Block limit 8 (live was 4). `browsing_preference` dropped per doc guidance. Unblocks Batch 6 (2 templates).

### Phase 2 — Port templates in batches

Each batch lists every template assigned to it with its section composition (from the tally table). Order is simplest → most complex so the porting pattern is established before hitting edge cases. All 70 templates assigned.

**Batch 1 (9) — Minimal templates, `article_main` enabled ✅ Complete**
Body lives on `article.content` in admin; JSON just adds one extra section. Fastest warm-up.

- ✅ `air-max-day-2024` — article body + featured-products
- ✅ `christmas-gift-guide` — article body + 2 text + shop-the-look (empty text-block dropped)
- ✅ `first-major-preview-2024` — article body + featured-products
- ✅ `fromcoursetostreet` — article body + shop-the-look (live hero was placeholder-only; dropped)
- ✅ `gforextg20years` — article body + shop-the-look (live hero was placeholder-only; dropped)
- ✅ `pga-champ-shoes` — article body + featured-products
- ✅ `puma-ptc-2024` — article body + shop-the-look
- ✅ `puma-x-duvin-mag` — article body + shop-the-look
- ✅ `tg-style-blog` — article body + shop-the-look

**Batch 2 (17) — "New brand intro" scaffold ✅ Complete**
Hero × 3–4, text × 5–7, featured-products (some disabled in live, dropped), media-grid × 2–3. Convention: `show_featured_image: false` on `article-template` since hero supplies the visual; disabled boilerplate sections (placeholder heros, repeated JAY3LLE interview copy, misconfigured featured-products) dropped.

- ✅ `4acesxex` — 3 hero + 5 text + featured-products + 2 media-grid
- ✅ `a-putnam-fall-collection` — 3 hero + 5 text + 2 media-grid (live content is actually Varley; see QA notes)
- ✅ `adidas-x-jay3lle` — 4 hero + 6 text + featured-products + 2 media-grid
- ✅ `fall2025_trends_blog` — 3 hero + 5 text + 2 media-grid (featured-products disabled in live)
- ✅ `golf-style-icons` — 3 hero + 6 text + 3 media-grid
- ✅ `hottakes_golffashion` — 3 hero + 5 text + 2 media-grid
- ✅ `introducingvarley` — 3 hero + 4 text + featured-products + 2 media-grid
- ✅ `jasonday-malbon` — 3 hero + 6 text + 2 media-grid
- ✅ `malboncolacollection` — 3 hero + 3 text + featured-products + 2 media-grid
- ✅ `newbrandtilley` — 3 hero + 4 text + featured-products + 2 media-grid
- ✅ `presidentscupdraddy` — 2 hero + 3 text + featured-products
- ✅ `rhone` — 3 hero + 4 text + featured-products + 2 media-grid
- ✅ `students` — 2 hero + 4 text + featured-products + 2 media-grid
- ✅ `summer-destinations` — 4 hero + 6 text + 2 media-grid (featured-products disabled in live)
- ✅ `the-open` — 3 hero + 5 text + 2 media-grid
- ✅ `us-open-2025` — 3 hero + 5 text + 2 media-grid
- ✅ `varley-new-uniform` — 3 hero + 5 text + 2 media-grid

**Batch 3 (21) — Other simple full editorials (no shop-the-look, no media-text, no featured-collections-plural) ✅ Complete**
Mix of hero/text/featured-products/media-grid/promo/media-showcase. Second-simplest bucket. Disabled-in-live sections (boilerplate JAY3LLE interview copy, placeholder heros, disabled promo tiles, the lone disabled `g4xtrendycollab` featured-products) dropped per the disabled-is-dropped rule. See QA notes for content mismatches flagged during porting.

- ✅ `adidasoriginals` — 2 hero + 1 text + media-grid + featured-products (2 text + 1 hero disabled in live, dropped)
- ✅ `aegean-storm` — hero + text + media-grid (promo disabled in live, dropped); text has "BE THE FIRST TO KNOW" CTA → ported as content-block button block
- ✅ `akxtrendygolf` — 3 hero + 4 text + 2 media-grid (no featured-products)
- ✅ `coursetostreet` **(pilot — done 2026-04-23)** — hero + text + featured-products + media-grid
- ✅ `fathersdaygiftideas` — hero + 8 text + 6 featured-products
- ✅ `futureofwaterproofs` — 3 hero + 3 text + featured-products
- ✅ `g4xtrendycollab` — hero + text + media-grid (featured-products disabled in live, dropped; see QA)
- ✅ `introducing-b-draddy` — 3 hero + 5 text + featured-products + media-grid + media-showcase (→ media-grid)
- ✅ `introducingfieldday` — 2 hero + 2 text + featured-products + media-grid
- ✅ `j-pritchard` — hero + 2 text + featured-products + media-grid (promo disabled, dropped; live `featured-products` had mismatched section `collection`/`btn_link` pointing to j-lindeberg — ported from the block handle `j-pritchard-mens-womens-apparel`)
- ✅ `jlindebergparicollection` — hero + 3 text + featured-products + media-grid (promo disabled, dropped)
- ✅ `jordan-9-true-red` — hero + text + featured-products + media-grid
- ✅ `jordan-pga-champs-shoe` — hero + text + featured-products + media-grid (live media-grid reuses same image twice — ported verbatim)
- ✅ `manorsfoulweather` — hero + text + featured-products
- ✅ `manorsxreebokusopen` — hero + text + featured-products + media-grid (live featured-products title was boilerplate "Varley Apparel" — ported verbatim; client should correct)
- ✅ `mother-s-day-gift-ideas` — hero + 7 text + 5 featured-products
- ✅ `newbrandzerorestrictions` — hero + text + featured-products + media-grid
- ✅ `puma-x-quiet-golf-mag` — 2 hero + 2 text + promo (banner-cards) + featured-products (promo was ACTIVE here, unlike other Batch 3 files)
- ✅ `rollinglinks` — 2 hero + 3 text + 2 media-grid + featured-products (1 text + 1 hero + 1 text disabled JAY3LLE boilerplate, dropped)
- ✅ `thisyearataugusta` — 2 hero + 3 text + media-grid + featured-products (1 text disabled JAY3LLE boilerplate, dropped)
- ✅ `williamsathleticclub` — 2 hero + 2 text + media-grid + featured-products (1 text + 1 hero + 1 text disabled JAY3LLE boilerplate, dropped)

**Batch 4 (8) — Shop-the-look templates (no media-text, no featured-collections-plural) ✅ Complete**
Adds shop-the-look on top of the simple pattern. Convention: placeholder `subtext: "Describe the look style and pairing occassion..."` inherited from SALVO templates dropped as empty (only appears as instructional text in admin, not real content). STLs keep image + product handles only. `video` heros ported as `hero-carousel` slide with `media_type: "video"` + `hosted_video_url: <CDN URL>`.

- ✅ `first-major-outfit-guide` — hero + 7 text + 5 shop-the-look (each text-block with "SHOP … SCRIPTING" CTA → content-block button block)
- ✅ `greyson-su24` — video-hero + 6 text + shop-the-look + promo (banner-cards) + featured-products
- ✅ `kjus-spring-summer-2024` — 2 video-hero + 9 text + 6 shop-the-look + featured-products
- ✅ `puma-x-ap-ss24` — video-hero + image-hero + 5 text + shop-the-look + promo (banner-cards) + featured-products
- ✅ `scotlandtripessentials` — 4 hero + 6 text + media-grid (from active media-showcase) + featured-products (1 shop-the-look, 1 media-showcase, 1 hero + 1 text were disabled in live; all dropped — see QA)
- ✅ `trendy-picks-golf-bags` — image-hero + video-hero + 6 text + 4 shop-the-look
- ✅ `trendy-picks-nike-ss24` — 2 hero + 7 text + 5 shop-the-look
- ✅ `trendy-picks-under-armour` — 2 hero + 6 text + 4 shop-the-look

**Batch 5 (11) — Media-text templates ✅ Complete**
10 of 11 templates had `media-text` disabled in live (all with identical SALVO "Aurora International, Anguilla" placeholder); dropped per the disabled-is-dropped rule. Only `winter-golf-destination` has enabled media-text — both blocks ported (real Torrey Pines + the Aurora placeholder which is on-topic for a winter-destinations article but should still be reviewed). Several other typically-disabled SALVO sections (Casa de Campo hero, Global Winter Golf Escapes text, promo tiles) were ENABLED on `winter-golf-destination` specifically because they ARE the real article content — ported accordingly. All hero `copy` richtext content was hoisted to a content-block below the image-only hero since `hero-carousel` slides only support heading/subheading/button, not richtext.

- ✅ `introducing-a-putnam` — hero + 4 text + shop-the-look + 2 promo + featured-products (media-showcase + media-text + 2 text disabled in live, dropped)
- ✅ `introducingmanorsgolf` — hero + 4 text + media-grid (from active media-showcase with single block + highlight_image_2) + featured-products (media-text + 2 text disabled, dropped; see QA for content mismatches)
- ✅ `jason-day-x-malbon-golf` — hero + text + shop-the-look + featured-products (media-showcase + media-text + 2 text + 1 hero disabled, dropped)
- ✅ `lussoxno33` — 2 hero + 3 text + media-grid (from active media-showcase) + featured-products (media-text + 2 text disabled, dropped; see QA for btn_link change)
- ✅ `masters-blog` — 4 hero + 5 text + featured-products (media-showcase + media-text + 2 text + 1 hero disabled, dropped)
- ✅ `miuraxreinigingchamp` — 2 hero + text + featured-products (media-text + promo + text + hero all disabled, dropped)
- ✅ `new-holderness-bourne` — hero + 3 text + 2 promo + featured-products (media-showcase + media-text + 2 text + hero + promo disabled, dropped)
- ✅ `the-players` — hero + 3 text (media-showcase + media-text + 2 text + hero + promo disabled, dropped — see QA)
- ✅ `waste-managment` — hero + 5 text + 2 shop-the-look + featured-products (media-showcase + media-text + text + hero + promo disabled, dropped; STL subtext/btn real content preserved)
- ✅ `welcombogeyboys` — 2 hero + 3 text + shop-the-look + media-grid + button-only content-block (media-showcase + media-text + 2 promo + 2 text + featured-products all disabled, dropped)
- ✅ `winter-golf-destination` — hero + 4 text + 2 media-text + 2 promo + 1 image hero + 1 Casa de Campo heading+copy content-block + Global Winter Golf Escapes text + featured-products (media-showcase disabled, dropped; all other "placeholder-looking" sections actually hold real article content and are ported)

**Batch 6 (2) — Featured-collections (plural) templates ✅ Complete**

- ✅ `malboncardigan` — 2 hero + 4 text + featured-collections (1 block) + media-grid + featured-collection (1 text + hero + media-grid disabled, dropped). `browsing_preference: "men"` on live's featured-collections was dropped per convention
- ✅ `pga-championship` — hero + text (featured-collections, promo, hero, text all disabled in live, dropped). Actual port is much simpler than tally suggested — just the intro hero and a single content-rich article body. See QA notes

**Batch 7 (2) — Edge cases ✅ Complete**

- ✅ `introducingwalker` — 2 hero + 7 text + 3 testimonials + 2 media-grid + featured-collection. No shop-the-look or promo; straightforward sequence with pull quotes interleaved between text-blocks. See QA for collection-title mismatch
- ✅ `viktor-blog-post` — 2 text + featured-collection + product-overview + 2 featured-collections (no hero; `show_featured_image: true` on article-template since there's no hero to supply the visual). Live's second `featured-products` had two collection blocks; split into two separate `featured-collection` sections to preserve both collections' visibility

### Phase 3 — QA pass

After all 70 templates are ported:

1. Pull the full list of US articles from admin; confirm each is assigned to the correct custom template (or to `article.json` for non-custom).
2. Walk each article on the storefront. Flag any with broken imagery, dead products/collections, layout glitches, or missing copy.
3. Fix in-place, re-verify.

---

## Open Items

- [x] **Build `media-text` section** — built 2026-04-23. See Phase 1 above
- [x] **Build `featured-collections` (plural) section** — built 2026-04-23. See Phase 1 above
- [x] **Spot-check `coursetostreet` on staging** — validated 2026-04-23. Defaults (`margin_bottom: medium`, `font: serif` on heading, `alignment: left` on content-block) are the convention for all subsequent ports
- [x] **Media-text placeholder content (Batch 5)** — resolved 2026-04-23. 10 of 11 Batch 5 templates have their `media-text` section `disabled: true` in the live theme with identical SALVO placeholder content (`"AURORA INTERNATIONAL GOLF CLUB, ANGUILLA"` / `"On our bucket list"`). Disabled-is-dropped rule applies — no media-text ported on those 10. Only `winter-golf-destination` has enabled media-text sections: the real `"TORREY PINES GOLF COURSE"` block is ported; its second (enabled) Aurora placeholder block is also ported per verbatim rule but should be flagged for client cleanup
- [ ] **Article body content porting** — for the 9 minimal templates, the rich-text body content is stored on `article.content` in the Shopify admin, not in the JSON template. Need to confirm whether US admin article bodies are already populated or if rich-text copy must be ported separately
- [ ] **Dead product handles** — featured-products, shop-the-look, product-overview, and featured-collections blocks reference product/collection handles. Audit against live US store inventory before porting or mid-port
- [ ] **Batch 2 content mismatches** — two cases where live theme content doesn't match the article slug and was ported verbatim: (a) `a-putnam-fall-collection` has Varley content + `womens-varley-apparel` collection (featured-products was disabled in live, so no section included). (b) `fall2025_trends_blog` and `summer-destinations` both had `featured-products` sections disabled in the live theme with a stale "Varley Apparel" title pointing to `a-putnam` collection — dropped per the disabled-is-dropped rule. Client should decide whether to add a real featured collection for those two, and whether `a-putnam-fall-collection` is actually supposed to be a Varley article (slug mismatch) or needs a content refresh
- [ ] **Batch 3 content mismatches** — (a) `manorsxreebokusopen` featured-products title is the boilerplate "Varley Apparel" in live (collection handle is correct, `mens-manors-x-reebok-golf-capsule`). Ported verbatim; client should update the title to "MANORS X REEBOK" or similar. (b) `j-pritchard` featured-products had a copy-paste bug in live — section-level `collection` + `btn_link` pointed to `mens-usa-golf-x-j-lindeberg` while the data block correctly referenced `j-pritchard-mens-womens-apparel`. Ported the block handle (correct one) for both collection and button link; title left as live's "Featured products" — consider renaming to "J. PRITCHARD". (c) `g4xtrendycollab` had its featured-products disabled in live (the 20-year anniversary collection link is present in hero/copy but no product section renders). Dropped per disabled-is-dropped rule; client should wire up a real featured collection if they want products in the flow. (d) `jordan-pga-champs-shoe` live media-grid has the same image referenced twice (image_JT8Paz and image_QCe9G8 both `2_f421e52d-...`). Ported verbatim — likely a live-theme editing slip, worth QA. (e) `fathersdaygiftideas` has a typo in a live featured-products title ("GITFS UNDER $100"). Ported verbatim; client should fix typo
- [ ] **Batch 6/7 content mismatches** — (a) `pga-championship` — the tally's "2 hero + 2 text + featured-collections + promo" was based on total section count, but in the live theme everything except the first hero + first text-block was disabled. Actual port is just intro hero + one rich-text content-block. The disabled featured-collections was a 4-collection tile grid (polos, hoodies, outerwear, headwear); if the client wants those back, they'll need to be re-enabled/re-added. (b) `introducingwalker` featured-collection is titled "WALKER GOLF THINGS" but points to `mens-new-in` collection (not a Walker-specific collection). Ported verbatim; client should update to a Walker-branded collection once one exists. (c) `viktor-blog-post` live second `featured-products` had a section-level `collection: "mens-jlindeberg-polo-shirts"` but its block list actually referenced two other collections (`j-lindeberg-viktor-hovlands-polo-shirts` + `mens-jlindeberg-trousers`) — copy-paste mismatch. Split into two separate `featured-collection` sections using the block handles, preserving both collections instead of falling back to the mismatched section-level handle. (d) `malboncardigan` live `featured-collections` used `browsing_preference: "men"` — dropped per established convention.
- [ ] **Batch 5 content mismatches** — (a) `introducingmanorsgolf` has its first text-block title hardcoded as "Seamless Transitions: Holderness & Bourne's SS24 Collection Unveiled" while the body is clearly about Manors Golf. Copy-paste bug in live theme. Ported verbatim; client should correct title to something like "Introducing Manors Golf". (b) `introducingmanorsgolf` featured-products had section-level `collection: "mens-holderness-bourne"` but the inner collection block correctly referenced `mens-manors-golf-clothing-accessories`. Used the correct Manors handle for the ported section. (c) `the-players` doc tally says "2 hero + 4 text + promo + media-showcase + media-text" but in live theme most were disabled; actual port is hero + 3 text — the Casa de Campo hero, Global Winter Golf Escapes text, Aurora media-text, and promo were all disabled in live and dropped. (d) `lussoxno33` featured-products had `btn_link` pointing to a specific product URL with `srsltid` tracking param + variant ID (`https://trendygolfusa.com/products/33-x-lusso-cloud-scenario-slide-2024?srsltid=...&variant=...`); replaced with clean `shopify://collections/33-x-lusso-cloud-scenario-slide` to match convention from other ports. (e) `welcombogeyboys` featured-products section (titled "BOGEY BOYS") was disabled in live; dropped. Live has a media-grid + button-only text-block as alternate conversion path. Client may want a real featured-collection section added back. (f) `winter-golf-destination` has the Aurora International placeholder media-text block enabled alongside the real Torrey Pines one; ported both because on a winter-destinations article the Aurora block is contextually on-topic despite being generic SALVO placeholder content. Client may prefer to remove. (g) `winter-golf-destination` featured-products `btn_link` pointed to `mens-golf-clothing` collection (broader) rather than `winter-golf-essentials` (the section's collection). Per port-verbatim rule, preserved as `shopify://collections/mens-golf-clothing`. (h) `masters-blog` featured-products `btn_link` pointed to `mens-golf-clothing` but the section collection is `inspired-by-the-first-major-of-the-year`. Preserved per verbatim rule as a full URL since it's a different collection than the section's.
- [ ] **Batch 4 content mismatches** — (a) `scotlandtripessentials` had its shop-the-look disabled in live (womens apparel STL; didn't match the Scotland/Galvin Green men's theme of the rest of the article) and a second media-showcase was also disabled. Both dropped. Doc tally ("5 hero + 7 text + featured-products + shop-the-look + 2 media-showcase") includes these — actual port is 4 hero + 6 text + media-grid + featured-products with no shop-the-look. Client should decide whether an STL is wanted here or leave as text-only. (b) Most Batch 4 templates have `link_url` pointing to `https://trendygolf.com/…` (UK domain) rather than `https://trendygolfusa.com/…`. Per the "port verbatim" rule these were preserved; note that the UK URLs will redirect or 404 when a US customer clicks. Client should decide whether to bulk-replace `trendygolf.com` → `trendygolfusa.com` across Batch 4 CTAs, or swap to `shopify://collections/*` handles where they resolve. (c) `scotlandtripessentials` order had a buried disabled "Casa de Campo" hero + winter-getaway text inside a Scotland-trip article — clearly leftover from a different article template. Dropped; not ported. (d) Shop-the-look `subtext` field in most SALVO templates was the placeholder "Describe the look style and pairing occassion…" — dropped as empty per the empty-settings rule since it was instructional text for admins, never real content. If client wants captions per STL, they can add them in admin
- [ ] **`shopify://files/` and `shopify://shop_images/` URIs** — these resolve against the source store. Since `_do-not-use/` came from `trendygolfusa`, these should already be US-store URIs and will resolve correctly after theme upload. Verify by spot-checking after first port (`coursetostreet` is the test)
- [ ] **`browsing_preference` SALVO field** — live US theme uses the men/women filter in hero, shop-the-look, and featured-collections. Not ported on UK build. **Decision: drop for US build** (matches UK, keeps scope tight). Already dropped from `featured-collections` section build
