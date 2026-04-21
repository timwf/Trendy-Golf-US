# Shoe Finder — Phase 4B

## Overview

Three-page self-contained feature: an interactive quiz, a filtered results page, and a bespoke product detail page. All three share a visual language (full-bleed background images, transparent PNG shoe cutouts, minimal chrome) that's distinct from the rest of the site.

---

## Pages

### 1. Quiz (`/pages/shoe-finder`)

**Template:** `templates/page.shoe-finder.json` → `sections/shoe-finder.liquid`

Multi-step quiz. Full-viewport slides over a background image. User answers 4 image-based questions, then gets redirected to the filtered results page.

**Flow:**
1. **Intro slide** — background image, serif heading ("Find your perfect golf shoe."), auto-advances after ~2.5s. Optional "Get Started" CTA for accessibility.
2. **Question slides (1–4)** — question heading + 2–3 image answer cards in a grid. Some questions have a "select all" skip button (e.g. "A mix of both"). Clicking an answer collects its tag and advances.
3. **Outro slide** — brief message ("Nice find! We've pulled together a fresh lineup..."), auto-advances after ~1s.
4. **Reveal results** — hides quiz, shows filtered product grid on the same page (no redirect)

**JS:** Vanilla JS state machine (inline IIFE). Translates the React `useShoeFinder` hook. Slides rendered server-side, hidden by default, toggled via Tailwind class swaps. Event delegation with `data-sf-*` attributes. On completion, JS collects selected tags and transitions to the results view (same page) with client-side filtering.

**Timings (from source):** `INTRO_DELAY=500ms`, `INTRO_SHOW=2000ms`, `FADE=500ms`, `OUTRO_SHOW=1000ms`

### 2. Results (same page, shown after quiz completes)

**No separate page or template.** The results grid lives inside the same `sections/shoe-finder.liquid` section as the quiz. When the quiz finishes, JS hides the quiz slides and reveals the results container. No redirect.

**Data source:** A **collection picker** in section settings. The client creates a manual collection containing all golf shoes. Liquid loops through every product in that collection at render time, outputting each card into a hidden results container. JS filters by matching `data-tags` attributes against the user's quiz answers.

**Why not native tag filtering?** The source site uses Storefront API queries (`product_type:"Golf Shoes" AND tag:"Men" AND tag:"Spikeless"`), not Shopify collections. There is no existing `golf-shoes` collection. Rather than depend on a specific collection handle + URL structure + `current_tags`, we keep everything self-contained: one page, one section, JS filtering.

**Layout:**
- Full-bleed fixed background image (reuses quiz `background_image` setting, `bg-cover bg-center bg-fixed`)
- "Back to Shoe Finder" text link (chevron-left + text) — resets quiz
- Heading: "Your footwear lineup" when filters active, "All golf shoes" when showing all
- Product grid: `grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4`, `gap-5`
- Each product card shows the **transparent PNG image** (`custom.transparent_image` metafield), falling back to the featured image
- Each card has `data-tags="men,spikeless,modern"` (lowercase, comma-separated) for JS filtering
- Product cards link to `/products/{handle}` (progressive enhancement fallback)

**JS filtering:**
- On quiz completion, collect selected tags into an array
- Show only cards whose `data-tags` contain ALL selected tags (AND logic, matching the source behaviour)
- If a question was skipped ("A mix of both" / "Any colour"), that category is omitted from the filter
- "Back to Shoe Finder" resets: hides results, shows quiz intro slide

**Product card** (different from standard `product-card.liquid`):
- Transparent background, no card chrome
- Aspect-square container, image centred with padding
- Loading spinner while image loads
- No price, no swatches, no hover swap — just the shoe image

### 3. Shoe Detail Modal (AJAX overlay)

**Section:** `sections/shoe-detail.liquid` (rendered via section rendering API, not a standalone template)

AJAX-loaded modal. Clicking a product card in the results grid fetches its detail section and injects it into a full-screen overlay. User stays on the same page; quiz state, filters, scroll position are all preserved.

**How it works:**
1. Click a shoe card on the results grid
2. JS fetches `/products/{handle}?section_id=shoe-detail`
3. Shopify returns the rendered section HTML (includes product form, variants, everything)
4. Inject into a full-screen modal overlay on the results page
5. Close button dismisses the modal — back on results, filters intact

**Modal layout (scrollable within overlay):**
1. **Close button** — fixed top-right, X icon, closes modal
2. **Hero section** — full viewport height (`min-h-[100svh]`)
   - Product title (centred, serif, h2 size)
   - Transparent PNG shoe image centred mid-screen (`custom.transparent_image` metafield, falls back to featured image)
   - Circular grey background behind shoe (`bg-taupe-100`, 60% size, centred)
3. **Product features carousel** — Splide, 3-up desktop / 1-up mobile with peek
   - Each feature: image (aspect 3:4), title, description
   - Data from metafields: `feature_image_one/two/three`, `feature_description_one/two/three`
4. **Product images** — standard image gallery
5. **Purchase section** — centred, `max-w-xl`
   - Variant selector, add to cart, size guide link
   - Reuses existing product form / purchase logic from Phase 2C
6. **Sticky buy bar** — fixed bottom within modal, slides up when purchase section scrolls out of view
   - "Buy now" button (scrolls to purchase section within modal)
   - Close / back button
   - `bg-white/80` backdrop

**Modals within modal:**
- Size guide drawer (existing)
- Image carousel modal (existing, from PDP)

**Key considerations:**
- Section rendering API returns fully rendered Liquid HTML, so the product form, variant selector, and price all work out of the box
- JS in the injected section needs reinitialising after DOM insertion (Splide for features carousel, variant selector, add-to-cart handlers)
- Modal needs scroll lock on the body, focus trap for accessibility, and escape key to close
- Add-to-cart from within the modal should update the cart drawer as normal

---

## Reference Files

| Type | Path |
|------|------|
| **Quiz** | |
| HTML | `_reference/scraped/html/shoe-finder.html` |
| Data | `_reference/scraped/data/stream/shoe-finder-route-routes-shoe-finder.json` |
| JS | `_reference/scraped/assets/js/shoe-finder-C793lMT2.js` |
| Route | `_reference/repo/app/routes/shoe-finder.tsx` |
| Components | `_reference/repo/app/components/pages/shoeFinder.tsx` |
| | `_reference/repo/app/components/partials/shoeFinder/slide.tsx` |
| | `_reference/repo/app/components/partials/shoeFinder/question.tsx` |
| | `_reference/repo/app/components/partials/shoeFinder/answer.tsx` |
| Hook | `_reference/repo/app/hooks/useShoeFinder.ts` |
| **Results** | |
| Data | `_reference/scraped/data/stream/golf-shoes-route-routes-golf-shoes.json` |
| Route | `_reference/repo/app/routes/golf-shoes.tsx` |
| Components | `_reference/repo/app/components/pages/shoeListing.tsx` |
| | `_reference/repo/app/components/partials/ecommerce/shoeProduct.tsx` |
| **Detail** | |
| Route | `_reference/repo/app/routes/golf-shoes_.$slug.tsx` |
| Components | `_reference/repo/app/components/pages/shoeSingle.tsx` |
| | `_reference/repo/app/components/partials/product/features.tsx` |
| | `_reference/repo/app/components/partials/product/imageScroll.tsx` |

---

## Tag Filtering — How It Works

The source site uses a custom React route that queries the Shopify Storefront API with `product_type:"Golf Shoes" AND tag:"Men" AND tag:"Spikeless"`. The tags (`Men`, `Women`, `Cleated`, `Spikeless`, `Classic`, `Modern`, `Black`, `White`, `Other`) already exist on the products in Shopify.

**For our Shopify theme**, we use **client-side JS filtering** on the same page as the quiz. All products from the selected collection are rendered server-side with `data-tags` attributes. After the quiz completes, JS shows only the cards whose tags match ALL the user's answers (AND logic). No collection URL filtering, no `current_tags`, no page navigation.

---

## Metafields Required

All under the `custom` namespace:

| Key | Type | Used By | Status |
|-----|------|---------|--------|
| `png_image` | `single_line_text_field` (Google Drive URL) | Results card, Detail hero — transparent shoe cutout | **Exists** — Drive URL converted to `lh3.googleusercontent.com` embed format in Liquid |
| `product_display_name` | `single_line_text_field` | Already used by collection page colour grouping | Exists |
| `feature_image_one` | `single_line_text_field` (URL) | Detail page features carousel | Exists |
| `feature_description_one` | `single_line_text_field` | Detail page features carousel (format: "Title ‚ Description") | Exists |
| `feature_image_two` | `single_line_text_field` (URL) | Detail page features carousel | Exists |
| `feature_description_two` | `single_line_text_field` | Detail page features carousel | Exists |
| `feature_image_three` | `single_line_text_field` (URL) | Detail page features carousel | Exists |
| `feature_description_three` | `single_line_text_field` | Detail page features carousel | Exists |
| `features_and_benefits` | `multi_line_text_field` | Detail page (bullet list, `*` delimited) | Exists |

### Transparent shoe image — Google Drive URL conversion

The source site stores transparent shoe PNGs in Google Drive and references them via a `custom.png_image` text metafield containing a Drive download URL (e.g. `https://drive.usercontent.google.com/download?id=XXXXX&export=view`). The source site uses a server-side proxy route (`/api/images/drive/:id`) to stream the images and avoid hotlinking issues.

**For Shopify**, we extract the Drive file ID from the URL in Liquid and convert it to Google's embeddable image CDN format:

- **Input:** `https://drive.usercontent.google.com/download?id=1Agj6nH_...&export=view`
- **Output:** `https://lh3.googleusercontent.com/d/1Agj6nH_...`

The `lh3.googleusercontent.com` format is Google's image CDN — it serves the raw image directly without redirects or referer checks, so it works in `<img>` tags without a proxy.

**Liquid conversion:** `assign drive_id = shoe_image | split: 'id=' | last | split: '&' | first`

**Fallback:** If `custom.png_image` is not set on a product, the results card and detail page hero fall back to `product.featured_image`.

**Scale:** ~100 products with `custom.png_image` metafields already populated. No migration needed.

---

## Schema Outline

### Quiz + Results Section (`shoe-finder.liquid`)

```
section settings:
  # Quiz
  - background_image        (image_picker) — shared bg for quiz + results (bg-fixed)
  - heading                 (text) — "Find your perfect golf shoe."
  - cta_label               (text) — "Get Started" (accessibility fallback)
  - outro_heading           (text)
  - outro_text              (text)

  # Results
  - results_collection      (collection) — collection picker, client selects the golf shoes collection
  - results_heading         (text) — "Your footwear lineup"
  - results_heading_all     (text) — "All golf shoes" (shown when no filters / reset)

blocks (type: quiz_step, limit: 8):
  - question                (text)
  - answer_1_label          (text)
  - answer_1_image          (image_picker)
  - answer_1_tag            (text) — tag value for filtering
  - answer_2_label          (text)
  - answer_2_image          (image_picker)
  - answer_2_tag            (text)
  - answer_3_label          (text) — optional, for 3-answer questions
  - answer_3_image          (image_picker)
  - answer_3_tag            (text)
  - skip_label              (text) — "A mix of both" / "Any colour" button
```

### Detail Section (`shoe-detail.liquid`)

```
section settings:
  - (minimal — most content comes from the product object + metafields)
  - show_features           (checkbox) — toggle features carousel
  - show_scroll_indicator   (checkbox) — toggle scroll progress
```

---

## Files To Create/Modify

### New files
- `sections/shoe-finder.liquid` — quiz + results grid + modal container (replace skeleton)
- `sections/shoe-detail.liquid` — product detail section (rendered via section rendering API into modal)
- `snippets/shoe-product-card.liquid` — transparent PNG product card

### Modified files
- `templates/page.shoe-finder.json` — populate with default quiz blocks
- `docs/shoe-finder.md` — this file (already updated)

### Existing files reused (no changes needed)
- Product form / purchase logic from Phase 2C
- Size guide drawer
- Splide carousel (for features)
- Icon snippet (chevron-left, chevron-right, x-mark)

---

## Build Plan

## Build Plan

Each sub-phase follows the [build playbook](docs/build-playbook.md) process:

1. **Scope** — audit scraped HTML + repo source, document exact markup and classes, flag decisions → come back to you for review
2. **Build** — markup & classes first (visually identical to source), JS second, schema last → come back to you for review

**Styling standard:** Every Tailwind class must match the source character by character. Scraped HTML is ground truth. No extra UI, no wrapper divs, no elements not in the source. CSS must be identical. Refer to `_reference/scraped/html/` and `_reference/repo/` during both scope and build.

### 4B-i — Quiz Section `[x]`
Single instance.
- Schema + page template defaults ✓
- Markup (all slides, answer cards, buttons) — visually identical to source ✓
- Question heading typography fix: added `text-3xl lg:text-4xl` (was missing) ✓
- Inline JS state machine ✓
- Tag handleization in redirect URL ✓
- **Note:** All slides use `absolute inset-0` + `pointer-events-none` (toggled by JS) because Liquid server-renders all 6 slides simultaneously, unlike React which mounts one at a time. Root has `overflow-hidden`.

### 4B-ii — Results Grid `[x]`
Single instance. Lives inside `shoe-finder.liquid`, shown after quiz completes.
- Results container markup (hidden by default, revealed by JS)
- Shoe product card snippet (transparent PNG via `custom.png_image` Drive URL → `lh3.googleusercontent.com`, fallback to featured image)
- Collection picker setting — client selects the golf shoes collection
- All products rendered server-side with `data-tags` attributes
- JS filtering: show cards matching ALL selected tags (AND logic)
- "Back to Shoe Finder" resets to quiz intro
- Background image (reuses quiz `background_image`, `bg-cover bg-center bg-fixed`)
- Progressive enhancement: card hrefs fall back to `/products/{handle}`

### 4B-iii-a — Shoe Detail Section `[x]`
Single instance. The content rendered inside the modal.
- `shoe-detail.liquid` section layout — visually identical to source
- Hero with transparent PNG + circular bg
- Features carousel (Splide, metafield data)
- Product images + purchase section (reuse existing)
- Sticky buy bar (IntersectionObserver within modal)

### 4B-iii-b — Modal Shell & AJAX `[x]`
Single instance. Wired into the results grid within `shoe-finder.liquid`.
- Modal overlay container (`fixed inset-0 z-40`, full-screen `bg-white` panel) ✓
- AJAX fetch via section rendering API (`/products/{handle}?section_id=shoe-detail`) ✓
- DOM injection + script activation (clone `<script>` tags so they execute after innerHTML) ✓
- Splide CSS/JS pre-loaded in shoe-finder.liquid so modal content can init immediately ✓
- shoe-detail.liquid init scoped to last `[data-shoe-detail]` for modal context ✓
- Scroll lock (`body.overflow = hidden`), focus trap (tab cycling), escape key ✓
- `shoe-detail:close` custom event wired to close modal + restore scroll ✓
- Loading spinner while fetching, error fallback on fetch failure ✓
- Cart drawer integration works via existing `window.cartDrawer.refreshDrawer()` in shoe-detail.liquid ✓
- Progressive enhancement: cards still link to `/products/{handle}` if JS fails ✓

### 4B-iv — Polish & Validation `[ ]`
- Mobile testing (h-dvh, touch targets, modal UX)
- Transition timing QA
- Verify metafield access on staging products
- Full flow test: quiz → results → modal → add to cart → close → back
- Shopify MCP `validate_theme`

## Implementation Notes

- **Tag matching:** Tags on product cards are lowercase. Quiz answer tags in the schema should match the product tags exactly (case-insensitive comparison in JS)
- **Product count:** All products in the selected collection are rendered server-side. If the collection grows large (100+), consider lazy rendering or pagination — but current scale (~8–30 products) is fine
- **JS reinitialisation:** `innerHTML` doesn't execute script tags. After injecting modal content, manually init Splide, bind variant selector, wire add-to-cart handlers
- **No deep linking:** Modal doesn't change URL. Could add `history.pushState` later if needed, but not in initial build
- **Progressive enhancement:** If JS fails, shoe cards link to `/products/{handle}` (standard PDP)
- **Feature image metafields:** May also be Google Drive URLs — verify on staging before building 4B-iii-a

---

## Content Management — Source vs Shopify

In the source site, the quiz is a **Sanity CMS document** (`_type: "shoeFinder"`). The content team manages everything through Sanity Studio:

- Background image
- Intro heading/body (portable text)
- Questions array — each with title, answer objects (image, title, tag), and optional "both" button text
- Outro content (portable text)

The GROQ query (`{...}`) fetches the entire document — no hardcoded questions anywhere in the codebase.

**For Shopify**, the theme editor replaces Sanity Studio. The section schema with blocks gives the same editability:

| Sanity | Shopify equivalent |
|--------|--------------------|
| `backgroundImage` (image) | Section setting: `background_image` (image_picker) |
| `introContent` (portable text) | Section settings: `heading` (text) + `subheading` (richtext) |
| `questions[]` (array of objects) | Blocks of type `quiz_step` |
| Question `title` | Block setting: `question` (text) |
| Question `answers[]` (image, title, tag) | Block settings: `answer_1_label/image/tag`, `answer_2_...`, `answer_3_...` |
| Question `buttonText` | Block setting: `skip_label` (text) |
| `questionsEndContent` (portable text) | Section settings: `outro_heading` (text) + `outro_text` (richtext) |

The client retains full control — add/remove/reorder quiz steps, change images, update question text, edit tags — all via the Shopify theme customiser. No code changes needed to update quiz content.

---

## Client Questions

- **Transparent images:** ~~Client needs to upload PNGs~~ **Resolved** — using existing `custom.png_image` metafield (Google Drive URLs) with Liquid conversion to `lh3.googleusercontent.com` embed format. ~100 products already populated. No client action needed.
- **Feature metafields:** Are `feature_image_one/two/three` and `feature_description_one/two/three` populated on all golf shoe products, or only some?
- **Golf shoes collection:** Client needs to create a manual collection containing all golf shoe products. The section has a collection picker — no specific handle required.
