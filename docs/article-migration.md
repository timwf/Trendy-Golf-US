# Article Template Migration — Plan

## Overview

The live theme uses **~50 custom article templates** — each article has its own JSON template file (`article.bogey-boys-2024.json`, `article.christmas-gift-guide.json`, etc.) assembled from generic reusable sections. Content (text, images, video URLs, product handles) lives in the section settings within each JSON template, not in `article.content`.

The live theme's article sections were built by a previous agency (Eastside Co / "SALVO" framework). We need to replicate the same structure using our sections and port the content across so the client doesn't have to re-enter anything.

### Two-track approach

1. **Default `article.json`** — already built. Handles the 7 generic articles that use native `article.content` body. Uses our `article-template` section (breadcrumbs, title, excerpt, date, featured image, body content via `.rte-article`).
2. **~50 custom `article.*.json` templates** — need to create. Each one maps the live theme's sections to our equivalent sections, with all content ported into the settings.

### Why this works seamlessly

Template assignments are stored in Shopify, not in the theme files. The client already has each article assigned to its template (e.g. `article.bogey-boys-2024`). We just create matching template filenames in our theme → Shopify picks them up automatically → client does nothing.

---

## Live Theme Reference

Pulled into `_do-not-use/` at the project root. This folder contains the live theme from `trendy-golf-uk.myshopify.com` and is **only** used for analysing article structure. Do not use for any other purpose.

---

## Section Mapping

Every custom article template follows the same scaffold: `breadcrumbs` → `article_intro` → content sections → `article_featured`

### Sections — Already Built

| Their Section | Used In | Our Equivalent | Notes |
|---|---|---|---|
| `breadcrumbs` | 50/50 | Built into `article-template` | Part of our article section |
| `article_intro` | 50/50 | `article-template` | Title, excerpt, date, featured image |
| `article_main` | 7/50 enabled | `article-template` | Body content via `.rte-article`. Disabled on 43 custom templates |
| `article_featured` | 50/50 | `magazine-articles` | "Latest Articles" carousel |
| `text-block` | 46/50 | `content-block` | Rich text + title + CTA |
| `hero` | 44/50 | `hero-carousel` | ✅ Image or video. CDN videos via `hosted_video_url` text field. Single slide usage |
| `featured-products` | 44/50 | `featured-collection` | ✅ Built — `sections/featured-collection.liquid`. Collection-based product carousel (replaces `product-carousel-tabs` which uses manual product lists) |
| `promotion-tiles` | 33/50 | `banner-cards` | ✅ Ready — `sections/banner-cards.liquid`. Each tile = `card` block with `heading`, `image`, `link`, `button_label` |

### Sections — Need to Build

| Their Section | Used In | What It Is | Our Approach |
|---|---|---|---|
| `media-grid` | 15/50 | 2-column image grid, no text/overlay. 2–6 images per instance | ✅ Built — `sections/media-grid.liquid`. 2-col grid, natural aspect ratio, image blocks only |
| `video` | 3/50 | YouTube/Vimeo embed or self-hosted video with poster image | ✅ Built — `sections/video-embed.liquid`. YouTube/Vimeo embed with poster click-to-play |
| `media-showcase` | 3/50 | Image grid with optional heading + 2 highlight images (start or end) | ✅ No dedicated section needed — all 3 articles only use the image grid (no heading/highlights). Use `media-grid` instead |

### Sections — Previously Pinned (Now Built)

| Their Section | Used In | What It Is | Status |
|---|---|---|---|
| `shop-the-look` | 36/50 | Split layout: large image (left) with title/text overlay + product card grid (right, up to 4 products) | ✅ Built — `sections/shop-the-look.liquid`. 2-col split: hero image with overlay text/CTA (left) + 2x2 product grid using `product-card` snippet (right). Native product picker, mobile image support, placeholder SVG for dead handles |

### Sections — Previously Skipped (Now Built)

| Their Section | Used In | What It Is | Status |
|---|---|---|---|
| `testimonial` | 1/50 | Centered/left pull-quote with optional title + credit | ✅ Built — `sections/testimonial.liquid`. Rich-text body at 1.125rem / semibold, credit prefixed with 18px horizontal rule. Settings: `title`, `testimonial_text`, `testimonial_credit`, `text_alignment`, `max_width`, `margin_bottom` |
| `product-overview` | 1/50 | Split layout: image (left) + title, rich text intro, single product card, CTA button (right) | ✅ Built — `sections/product-overview.liquid`. Uses `product-card` snippet for the product. Settings mirror live: `image`, `mobile_image`, `title`, `intro`, `product`, `button_text`, `button_url`, plus `margin_bottom` |

---

## Sections to Build

### 1. Media Grid

**Purpose:** Simple 2-column image grid for editorial photo layouts.

**Their version:** `_do-not-use/sections/media-grid.liquid` — image blocks in a CSS grid, no text, no overlay, no links.

**Image counts across articles:**
- 2 images — 5 instances
- 4 images — 9 instances
- 6 images — 2 instances

**Our approach:** New section `sections/media-grid.liquid`. Two-column grid, natural aspect ratio, image blocks only. Essentially a stripped-down banner-cards without overlay, text, or links.

**Schema:**
- No section-level settings needed (or optional top/bottom spacing)
- Blocks: `image` type with `image_picker`

---

### 2. Video

**Purpose:** Embed a YouTube/Vimeo video or self-hosted video within an article.

**Their version:** `_do-not-use/sections/video.liquid` — supports embed (YouTube/Vimeo via Plyr.js) or direct video URL, with optional poster image.

**Only used in 3 articles:** `kjus-ss25`, `tg-20th-anniversary`, `tg-x-jl-golf-trip-win`

**Note:** Many articles use video via the `hero` section instead (Shopify CDN video URLs in hero settings). This section is for standalone inline video embeds within the article body.

**Our approach:** New section `sections/video-embed.liquid`. YouTube/Vimeo embed support via Shopify's `video_url` setting type. Optional poster image.

**Schema:**
- `video_url` (video_url type, accepts youtube/vimeo)
- `video` (text, for self-hosted video URL)
- `image` (image_picker, poster image)

---

### 3. Shop the Look ✅ Done

**Purpose:** Editorial "shop this outfit" component. Large image on left with title/text overlay, product card grid on right (up to 4 products).

**Used in 36/50 templates.**

**Our section:** `sections/shop-the-look.liquid`

**Layout:**
- Desktop: 2-column split (50/50). Left = hero image with dark overlay, bottom blur effect, title/subtext/CTA anchored to bottom. Right = 2x2 product grid using `product-card` snippet.
- Mobile: stacks vertically. Full-width image, subtext below image (not overlay), 2-col product grid, CTA link below products.

**Schema:**
- Section settings: `image` (image_picker), `mobile_image` (image_picker), `title` (text), `subtext` (textarea), `btn_text` (text), `btn_link` (url), `margin_bottom` (select)
- Blocks: `product` type with native Shopify `product` picker (limit 4)

**Placeholder handling:** If a product handle doesn't resolve (deleted/unavailable), the block renders a Shopify placeholder SVG in the same `aspect-[9/12]` ratio as a real product card with "Not available" text. Grid stays intact, dead handles are visually obvious.

**Migration notes:**
- Live theme product blocks use handle strings — Shopify's native product picker in our schema accepts these same handles in the JSON template
- Many live instances have empty title/subtext/btn fields (just image + products)
- `browsing_preference` filter from live theme (men/women) not ported — legacy SALVO feature, can add later if needed

---

## Template Migration List

Each template needs a matching `article.*.json` file created in our theme with content ported from the live theme's section settings.

### Full Editorial Templates (43) — `article_main` disabled

| Template | hero | text-block | featured-products | shop-the-look | promotion-tiles | media-grid | video | media-showcase | other |
|---|---|---|---|---|---|---|---|---|---|
| adidas-rolling-links | 1 | 5 | 2 | 1 | 1 | 1 | — | — | — |
| adidas-x-jay3lle | 2 | 5 | 1 | 1 | 2 | — | — | — | — |
| bogey-boys-2024 | 1 | 6 | 1 | 2 | 2 | — | — | — | — |
| codechaos-25 | 1 | 5 | 1 | — | 2 | — | — | — | article_intro disabled |
| final-frontier-manors-mag | 2 | 6 | 1 | 2 | 1 | — | — | — | — |
| first-major-outfit-guide | 1 | 6 | — | 5 | — | — | — | — | — |
| footjoy-uk-ss25 | 2 | 6 | 1 | — | 1 | 2 | — | — | — |
| fromcoursetostreet | 1 | 1 | 1 | — | — | 1 | — | — | — |
| g-fore-dunhull-links-mag | 1 | 4 | 4 | — | — | 3 | — | — | — |
| galvin-green-concept-mag | 1 | 4 | 1 | 1 | 1 | — | — | 1 | — |
| galvin-green-pertex | 2 | 4 | 2 | — | 1 | — | — | — | — |
| gforextrendyanniversary | 1 | 1 | 1 | — | — | 1 | — | — | featured-products disabled |
| greyson-su24 | 1 | 5 | 1 | 1 | 1 | — | — | — | — |
| introducingwalkergolf | 2 | 5 | 1 | — | — | 2 | — | — | 3x testimonial |
| jl-x-glenmuir-mag | 1 | 4 | 2 | 1 | 1 | — | — | 1 | — |
| kjus-spring-summer-2024 | 2 | 7 | 1 | 5 | — | — | — | — | — |
| kjus-ss25 | 1 | 7 | 1 | 5 | — | — | 1 | — | — |
| malbon-outdoors-club-mag | — | 4 | 2 | 1 | 1 | — | — | — | — |
| malbon-performance | 2 | 4 | 2 | 1 | 1 | — | — | — | — |
| malbon-tiger-buckets | 1 | 4 | 1 | 1 | 2 | — | — | — | — |
| manors-ss25-mag | 1 | 6 | 1 | 3 | 1 | 1 | — | — | — |
| manorsfoulweather | 1 | 1 | 1 | — | — | — | — | — | — |
| new-balance-aw24 | 1 | 4 | 2 | — | 2 | — | — | — | — |
| new-brand-reflo | 1 | 4 | 1 | 1 | 1 | 1 | — | — | — |
| newbrandvictoriapaulsen | 1 | 1 | 1 | — | — | 1 | — | — | — |
| nike-us-open-nrg-shoes | 1 | 4 | 1 | — | 3 | — | — | — | — |
| nike-winter-24-mag | 1 | 5 | 3 | 1 | 1 | — | — | — | — |
| open-2024-mag | 2 | 4 | 3 | — | — | — | — | — | — |
| puma-ptc-2024 | 2 | 4 | 1 | 1 | 1 | — | — | — | — |
| puma-x-ap-ss24 | 1 | 3 | 1 | 1 | 1 | — | — | — | — |
| puma-x-duvin-mag | 1 | 3 | 1 | 1 | 1 | — | — | — | — |
| puma-x-ptc-aw24 | 1 | 5 | 3 | 1 | 2 | — | — | — | — |
| ralph-lauren-aw24 | 1 | 5 | 3 | 1 | 2 | — | — | — | — |
| s-t-x-trendygolf | 1 | 4 | 1 | — | 1 | 2 | — | — | — |
| students-golf | 1 | 6 | 1 | 2 | 2 | — | — | — | — |
| tg-20th-anniversary | 1 | 6 | 2 | 1 | 1 | 1 | 1 | — | — |
| tg-x-jl-golf-trip-win | 1 | 6 | 2 | 1 | — | 1 | 1 | — | — |
| trendy-picks-golf-bags | 2 | 5 | — | 4 | — | — | — | — | — |
| trendy-picks-nike-ss24 | 2 | 7 | — | 5 | — | — | — | — | — |
| trendy-picks-under-armour | 2 | 6 | — | 4 | — | — | — | — | — |
| viktor-blog-post | — | 2 | 2 | — | — | — | — | — | 1x product-overview |
| wedj-golf | 1 | 3 | 1 | 1 | 1 | — | — | 1 | — |
| xmas-guide-2024 | 1 | 5 | 4 | — | — | — | — | — | — |

### Minimal Templates (7) — `article_main` enabled

These use our default `article.json` with `article-template` section. No custom template needed unless they have extra sections beyond the standard scaffold.

| Template | Extra sections beyond scaffold |
|---|---|
| air-max-day-2024 | 1x featured-products |
| christmas-gift-guide | 2x text-block, 1x shop-the-look |
| first-major-preview-2024 | 1x featured-products |
| jl-summer-2024 | 5x text-block, 1x hero, 1x featured-products, 3x shop-the-look |
| paradise-in-play-mag | 5x text-block, 1x hero, 1x featured-products, 1x shop-the-look, 1x promotion-tiles |
| pga-champ-shoes | 1x featured-products |
| tg-style-blog | 1x shop-the-look |

**Note:** Some "minimal" templates still have extra sections alongside the article body. These will need custom templates too if we want to preserve those sections. Only `air-max-day-2024`, `first-major-preview-2024`, and `pga-champ-shoes` are truly minimal (just featured-products added).

---

## Build Order

### Phase 1 — Build missing sections ✅ Complete
1. ~~`media-grid` — simple 2-col image grid~~ ✅ Done
2. ~~`video-embed` — YouTube/Vimeo embed with poster~~ ✅ Done
3. ~~Assess `media-showcase`~~ ✅ All 3 articles only use the grid blocks (no heading/highlights) — handled by `media-grid`
4. ~~`featured-collection` — collection-based product carousel~~ ✅ Done — needed because `product-carousel-tabs` uses manual product lists, not collection handles

### Phase 2 — Create custom article templates
Work through the 50 templates, mapping sections and porting content:
1. Start with simpler templates (fewer sections) to establish the pattern
2. Work through the full editorial templates
3. Handle the minimal templates that need extras

**Batch 1 (5) ✅ Done:**
- `manorsfoulweather` — hero + text + featured-collection
- `fromcoursetostreet` — hero + text + media-grid + featured-collection
- `newbrandvictoriapaulsen` — hero + text + media-grid + featured-collection
- `gforextrendyanniversary` — hero + text + media-grid (featured-products was disabled)
- `xmas-guide-2024` — hero + 6 text blocks + 4 featured-collections

**Batch 2 (4) ✅ Done — all sections available, no blockers:**
- `g-fore-dunhull-links-mag` — hero + 4 text + 3 media-grid + 5 featured-collections
- `air-max-day-2024` — article body + 1 featured-collection (minimal)
- `first-major-preview-2024` — article body + 1 featured-collection (minimal)
- `pga-champ-shoes` — article body + 1 featured-collection (minimal)

**Batch 3 (7) ✅ Done — promo-tiles + CDN video heroes unblocked:**
- `galvin-green-pertex` — 2 video heroes + text + promo-tiles + 2 featured-collections
- `new-balance-aw24` — video hero + 4 text + 2 promo-tiles + 2 featured-collections
- `nike-us-open-nrg-shoes` — video hero + 4 text + 3 promo-tiles + featured-collection
- `footjoy-uk-ss25` — image hero + video hero + 6 text + promo-tiles + 2 media-grid + 3 featured-collections
- `s-t-x-trendygolf` — image hero + 4 text + promo-tiles + 2 media-grid + featured-collection
- `codechaos-25` — video hero + 5 text + 2 promo-tiles + featured-collection (article_intro disabled)
- `open-2024-mag` — video hero + image hero + 4 text + 3 featured-collections

### Phase 3 — Shop the Look ✅ Section built
1. ~~Build the section~~ ✅ Done — `sections/shop-the-look.liquid`
2. ~~Test with article template~~ ✅ Done — `article.puma-x-duvin-mag.json` created as test (scaffold + 1 shop-the-look, 4 products)
3. ~~Continue with remaining templates~~ ✅ shop-the-look is no longer a blocker

**Batch 4 (6) ✅ Done — shop-the-look templates + mobile hero images:**
- `puma-x-duvin-mag` — shop-the-look only (minimal template, matches live)
- `puma-x-ap-ss24` — video hero + 5 text + shop-the-look + promo-tiles + featured-collection + image hero (with mobile_image)
- `malbon-tiger-buckets` — image hero (with mobile_image) + 6 text + shop-the-look + 2 promo-tiles + featured-collection
- `greyson-su24` — video hero + 6 text + shop-the-look + promo-tiles + featured-collection
- `new-brand-reflo` — video hero + 5 text + shop-the-look + promo-tiles + featured-collection + media-grid
- `puma-x-ptc-aw24` — image hero (with mobile_image) + 4 text + shop-the-look + promo-tiles + featured-collection

**Batch 5 (26) ✅ Done — all remaining templates:**
- `adidas-rolling-links` — video hero + 5 text + promo + shop-the-look + media-grid + 2 featured-collections
- `adidas-x-jay3lle` — video hero + image hero + 5 text + 2 promo + shop-the-look + featured-collection
- `bogey-boys-2024` — video hero + 7 text + 2 promo + 2 shop-the-look + featured-collection
- `final-frontier-manors-mag` — video hero + image hero + 5 text + promo + 2 shop-the-look + featured-collection
- `first-major-outfit-guide` — image hero + 7 text + 5 shop-the-look
- `galvin-green-concept-mag` — video hero + 5 text + promo + shop-the-look + media-grid + featured-collection
- `jl-x-glenmuir-mag` — hero + 6 text + promo + shop-the-look + media-grid + 2 featured-collections
- `kjus-spring-summer-2024` — 2 heroes + 9 text + 6 shop-the-look + featured-collection
- `kjus-ss25` — hero + 8 text + 5 shop-the-look + featured-collection + video-embed
- `malbon-outdoors-club-mag` — 5 text + promo + shop-the-look + 2 featured-collections (no hero)
- `malbon-performance` — 2 heroes + 5 text + promo + shop-the-look + 2 featured-collections
- `manors-ss25-mag` — hero + 7 text + promo + 3 shop-the-look + featured-collection + media-grid
- `nike-winter-24-mag` — hero + 6 text + promo + shop-the-look + 3 featured-collections
- `puma-ptc-2024` — shop-the-look only (minimal template)
- `ralph-lauren-aw24` — hero + 7 text + 2 promo + shop-the-look + 3 featured-collections
- `students-golf` — hero + 6 text + 2 promo + 2 shop-the-look + featured-collection
- `tg-20th-anniversary` — hero + 5 text + promo + shop-the-look + 2 featured-collections + video-embed + media-grid
- `tg-x-jl-golf-trip-win` — hero + 6 text + shop-the-look + 2 featured-collections + video-embed + media-grid
- `trendy-picks-golf-bags` — 2 heroes + 6 text + 4 shop-the-look
- `trendy-picks-nike-ss24` — 2 heroes + 8 text + 5 shop-the-look
- `trendy-picks-under-armour` — 2 heroes + 7 text + 4 shop-the-look
- `wedj-golf` — hero + 4 text + promo + shop-the-look + media-grid + featured-collection
- `christmas-gift-guide` — article body + 2 text + shop-the-look (minimal with extras)
- `jl-summer-2024` — article body + hero + 5 text + 3 shop-the-look + featured-collection (minimal with extras)
- `paradise-in-play-mag` — article body + hero + 8 text + promo + shop-the-look + featured-collection (minimal with extras)
- `tg-style-blog` — article body + shop-the-look (minimal with extras)

### Batch 6 (2) ✅ Done — final sections built, all 50 custom templates complete:
- `introducingwalkergolf` — 2 image heroes + 4 text + 3 testimonials + 2 media-grid + featured-collection
- `viktor-blog-post` — 2 text + 2 featured-collection + product-overview

### Skipped Templates (0)
All 50 custom article templates are now built. `article.json` handles any article that isn't assigned to a custom template.

---

## Open Items

- [x] **Shop the Look** — resolved. `sections/shop-the-look.liquid` built. 2-col split: hero image with overlay (left) + 2x2 product grid via `product-card` snippet (right). Native product picker, mobile image support, placeholder for dead handles. Test template: `article.puma-x-duvin-mag.json`
- [x] **Media Showcase** — resolved. All 3 articles only use grid blocks, no highlights. Use `media-grid`
- [x] **Testimonial** — resolved. `sections/testimonial.liquid` built. Centered/left pull-quote, 1.125rem semibold body, 18px rule before credit. Used in `introducingwalkergolf` (3 instances)
- [x] **Product Overview** — resolved. `sections/product-overview.liquid` built. Image-left + title/intro/product-card/CTA-right split. Used in `viktor-blog-post`
- [ ] **Dead product handles** — featured-products and shop-the-look sections may reference products that no longer exist. Need to audit
- [x] **Hero video support** — resolved. `hero-carousel` now supports three video sources in priority order: (1) native `video` picker (`hosted_video`), (2) CDN URL text field (`hosted_video_url`), (3) YouTube/Vimeo (`video_url`). The `hero-video` snippet renders a `<video>` tag for options 1 & 2, iframe for option 3. For migration we use the CDN URL text field — the native picker can't easily find videos by their CDN hash. In templates, set `media_type: "video"` and `hosted_video_url` with the CDN URL from the live theme
- [x] **Mobile hero images** — resolved. `hero-carousel` slide blocks now have a `mobile_image` picker. Two `<img>` tags toggled at `md:` (768px) breakpoint, matching the live theme. Natural aspect ratio, falls back to desktop image when blank. 29/51 templates use this
- [x] **Banner cards (`promotion-tiles`)** — mapping confirmed: `banner-cards` section with `card` blocks (`heading`, `image`, `link`, `button_label`). Ready to port
