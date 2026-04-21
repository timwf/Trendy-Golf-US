# Product Page (Phase 2C)

> Detailed audit, plan, and build notes for all product page sub-phases (2C-i through 2C-v).

**Reference (all sub-phases):** `_reference/scraped/html/product-polo.html`, `_reference/scraped/assets/js/useVariants-Cjg2tlM0.js`, `_reference/scraped/assets/js/productCarousel-BOAptad1.js`, `_reference/scraped/assets/js/modal-DQdNT-Xv.js`
**Shopify MCP (all sub-phases):** `search_docs_chunks` for product.variants, product.media, variant selector patterns, product form tag, `learn_shopify_api` for Product API, `validate_theme` on all product files

---

## 2C-i — Product Template Shell & Image Gallery `[x]`

### Page layout

**2-col grid** — direct child of `<main>`:
```html
<div class="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-14">
  <div><!-- LEFT: Image gallery --></div>
  <div class="max-w-xl px-6"><!-- RIGHT: Product info --></div>
</div>
```
- Mobile: single column, `gap-8`
- md+: two equal columns, `gap-14`
- No container wrapper on the 2-col grid itself
- Accordion section below uses `container-narrow`

### Mobile image gallery (`block md:hidden`)

Splide carousel:
```html
<div class="relative w-full">
  <div data-pagination-hide="false" data-pagination-dark="true">
    <div class="splide relative h-full">
      <div class="absolute left-0 top-0 p-4">
        <p class="mb-0 text-sm">1 / 6</p>  <!-- slide counter -->
      </div>
      <div class="splide__track">
        <ul class="splide__list">
          <li class="splide__slide">
            <div data-measure="true" class="inline-block w-full">
              <img class="block h-auto w-full cursor-zoom-in" loading="lazy"/>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
```
- 1 perPage, swipeable
- Slide counter top-left: `absolute left-0 top-0 p-4`, format `{current} / {total}`
- Dark pagination dots
- Images: `block h-auto w-full cursor-zoom-in`, lazy loaded
- No thumbnail strip

### Desktop image gallery (`hidden md:grid`)

Static CSS grid — NOT a carousel:
```html
<div class="hidden grid-cols-2 gap-4 md:grid">
  <div class="cursor-zoom-in col-span-2"><img class="block h-auto w-full"/></div>   <!-- full width -->
  <div class="cursor-zoom-in col-span-1"><img class="block h-auto w-full"/></div>   <!-- half -->
  <div class="cursor-zoom-in col-span-1"><img class="block h-auto w-full"/></div>   <!-- half -->
  <div class="cursor-zoom-in col-span-2"><img class="block h-auto w-full"/></div>   <!-- full width -->
  <div class="cursor-zoom-in col-span-1"><img class="block h-auto w-full"/></div>   <!-- half -->
  <div class="cursor-zoom-in col-span-1"><img class="block h-auto w-full"/></div>   <!-- half -->
</div>
```
- Alternating pattern: **full, half, half** repeating
- `gap-4` between images
- `cursor-zoom-in` on wrappers (lightbox deferred)
- No explicit aspect ratio — natural image dimensions

### Sticky product info wrapper

```html
<div class="max-w-xl px-6">
  <div class="md:sticky md:top-0 md:flex md:h-[calc(100vh-64px)] md:flex-col md:justify-center">
    <!-- all product info here -->
  </div>
</div>
```
- Sticky on desktop, vertically centred in viewport minus header height (64px)

---

## 2C-ii — Product Info & Variant Selector `[x]`

### Brand name
```html
<h4 class="mb-5 text-sm uppercase text-taupe-700">Ralph Lauren</h4>
```

### Product title
```html
<h1 class="mb-3 font-sans text-xl lg:text-2xl">RLX Tailored Fit Kinetic Tech Jersey</h1>
```
- Uses body font (`font-sans`), not display font
- Title from `product.metafields.custom.product_display_name` with fallback to `product.title`

### Price
```html
<div class="mb-6">
  <span class="mb-0 text-xl"><span class="font-semibold">£125.00</span></span>
</div>
```
- `text-xl font-semibold` — larger than card price, left-aligned
- Needs PDP-specific rendering (not the centred card-style `price.liquid`)

### Content flex reorder
```html
<div class="flex flex-col">
  <div class="mb-6 md:order-2"><!-- colour + size + add to basket --></div>
  <div class="md:order-1"><!-- description excerpt --></div>
</div>
```
- Mobile: colour/size/button first, description second
- Desktop: description moves above via `md:order-1`

### Colour label + swatches
```html
<div class="mb-4">
  <p class="mb-1 text-sm"><span class="text-taupe-700">Colour:</span> Moss Agate</p>
  <div class="flex gap-1">
    <!-- reuse colour-swatch.liquid for each sibling -->
  </div>
</div>
```
- Swatch ring: `size-7` outer, `size-5` inner fill
- Active: `border-taupe-900`, inactive: `border-transparent`
- Each swatch is an `<a>` to sibling product URL
- Siblings found by matching `product_display_name` across `product.collections.first.products`

### Size selector
```html
<div class="mb-4">
  <label class="mb-2 flex items-end justify-between text-sm">
    <span>Size</span>
    <button class="text-sm font-bold text-taupe-900 hover:text-taupe-700">Size guide</button>
  </label>
  <div class="relative">
    <select class="block w-full appearance-none border border-taupe-600 bg-taupe-100 px-4 py-3 focus:outline-none">
      <option value="S" selected>S</option>
      <option value="M">M</option>
      <!-- etc. -->
    </select>
    <svg class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"><!-- chevron --></svg>
  </div>
</div>
```
- Native `<select>` with `appearance-none` + custom chevron
- Label row: "Size" left, "Size guide" button right
- Sold-out sizes should be disabled

### Add to basket button
```html
<button class="flex items-center gap-2 text-center text-sm tracking-wider transition-all
               disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
               uppercase justify-center px-4 py-3 lg:px-10 min-w-40
               bg-taupe-900 text-white enabled:hover:bg-taupe-600 w-full">
  Add to basket
</button>
```
- Full-width, `bg-taupe-900 text-white`
- Disabled states for sold-out

### TGCC rewards banner
```html
<div class="mb-4 flex items-center gap-2 bg-clubhouse-green-600 p-4 text-sm text-white">
  <!-- trophy icon --> <b>Register</b> at checkout to unlock <b>TGCC Rewards</b>...
</div>
```

### Delivery estimate
```html
<div class="flex gap-2">
  <!-- truck icon -->
  <p class="mb-0 text-sm">Get it by <span class="font-bold">tomorrow</span>
    if you order within <span class="font-bold text-clubhouse-green-600">3hrs 57mins</span></p>
</div>
```
- Static for now, dynamic countdown deferred

### Description excerpt (order-1 on desktop)
```html
<div class="md:order-1">
  <div class="mb-4">
    <p class="mb-2 text-sm">Engineered with precision...</p>
    <button class="hidden md:flex cursor-pointer items-center hover:text-taupe-700">
      Features &amp; Benefits
    </button>
  </div>
</div>
```

### Scroll progress indicator (desktop only)
- Vertical progress bar to the left of info column
- Track: `bg-taupe-400 w-0.5`, fill: `bg-taupe-900`
- Only visible at `lg:` — deferred to polish phase

---

## Variant selection JS

**URL param pattern:** `?option|Size=M`

**On page load:**
1. Parse URL params for `option|Size`
2. Find matching variant in `product.variants`
3. If no param or variant unavailable, select first available variant
4. Update UI (select value, price, button text/state)

**On size change:**
1. Get selected size value
2. Find matching variant
3. Update URL via `history.replaceState` (no reload)
4. Update price display
5. Update button text (Add to basket / Sold out) and disabled state
6. Update hidden variant ID input for the form

**Data:** Product variants JSON embedded via `{{ product.variants | json }}` in a `<script>` tag.

---

## 2C-iii — Add to Cart & Size Guide *(not yet audited)*

### Scope
- Add to cart form using Shopify `{% form 'product' %}` tag
- Size guide drawer (`snippets/size-guide-drawer.liquid`)
- Same offcanvas pattern as filter sidebar

---

## 2C-iv — Product Details Accordion `[x]`

### Source structure
Three accordions below the product grid, inside `container-narrow`:
- **Description** — product description HTML
- **Features & Benefits** — from `custom.features_and_benefits` metafield
- **Delivery & Returns** — static content

Each accordion:
```html
<button class="flex w-full items-center justify-between border-b border-taupe-400 text-left py-6">
  <span class="flex-1 pr-3 text-xl font-semibold">Description</span>
  <svg class="flex-none transition-transform size-6"><!-- chevron --></svg>
</button>
<div style="height:0;overflow:hidden">
  <div class="border-b border-taupe-400 py-6 [&_p:last-of-type]:mb-0">
    <!-- content -->
  </div>
</div>
```
- Collapsed by default, JS toggles height + opacity
- Content: `border-b border-taupe-400 py-6`

---

## 2C-v — Schema, Locales & Validation *(not yet audited)*

### Scope
- Section schema settings
- `sections.product.*` locale keys
- Tailwind CSS recompile
- `validate_theme` on all files

---

## Implementation plan (2C-i + 2C-ii)

### Files to create
| File | Purpose |
|------|---------|
| `sections/product-template.liquid` | Main PDP section — 2-col grid, image gallery, product info, variant JS, accordions |
| `templates/product.json` | JSON template pointing to `product-template` |

### Files to update
| File | Change |
|------|--------|
| `tailwind.config.js` | Add `container-narrow` component |
| `snippets/icon.liquid` | Add `truck` and `trophy` icons |
| `locales/en.default.json` | Add `sections.product.*` keys |

### Key decisions
1. **No Splide on desktop** — source uses static CSS grid with alternating full/half pattern, not carousel
2. **Splide on mobile** — swipeable carousel with slide counter (top-left) and dark pagination dots
3. **Reuse existing snippets** — `colour-swatch.liquid` for PDP swatches (siblings via `product_display_name`)
4. **PDP price inline** — render price directly in template (left-aligned `text-xl font-semibold`, different from centred card `price.liquid`)
5. **Variant JS inline** — `{% javascript %}` tag in section, same pattern as collection page
6. **Colour siblings** — loop `product.collections.first.products` to find by `product_display_name` metafield
7. **`container-narrow`** — new Tailwind plugin component for accordion section below the grid
8. **Sticky info column** — `md:sticky md:top-0` with `h-[calc(100vh-64px)]` vertical centering on desktop
9. **Flex reorder** — mobile: selectors first, description second. Desktop: description above via `md:order-1`
10. **Size selector** — native `<select>` with `appearance-none` + custom chevron SVG overlay
11. **URL-driven variants** — parse `option|Size` from URL params, `history.replaceState` on change (no reload)
12. **Accordions** — Description, Features & Benefits, Delivery & Returns. Collapsed by default, JS toggle height + opacity

### Deferred
- Lightbox / zoom on image click (polish phase)
- Scroll progress indicator on desktop (polish phase)
- Dynamic delivery countdown timer
- Size guide drawer (2C-iii)
- Add to cart form with `{% form 'product' %}` (2C-iii)

---

## Build notes (2C-i + 2C-ii + 2C-iv)

### Files created
| File | Purpose |
|------|---------|
| `sections/product-template.liquid` | Main PDP section — 2-col grid, mobile Splide gallery, desktop image grid, sticky product info, variant JS, 3 accordions |
| `templates/product.json` | JSON template pointing to `product-template` |

### Files updated
| File | Change |
|------|--------|
| `tailwind.config.js` | Added `container-narrow` component (max-width 960px) |
| `snippets/icon.liquid` | Added `truck` and `trophy` icons |
| `locales/en.default.json` | Added `sections.product.*` locale keys (colour_label, size_label, size_guide, add_to_basket, sold_out, rewards_banner, delivery_estimate, accordion headings, delivery_returns_content) |
| `locales/en.default.schema.json` | Added `sections.product` schema translations (name, layout header) |

### Validation
- All files passed Shopify MCP `validate_theme` (conversation `34c3aa06`)
- Fixed: conditional `<div>` open tags across Liquid branches → refactored to assign `col_class` variable
- Fixed: description excerpt `</p>` mismatch → switched to `strip_html | truncatewords: 30`
- Fixed: missing `t:sections.product.name` in schema locale file

### Data attributes (JS hooks)
| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-product-carousel` | `.splide` | Mobile Splide init |
| `data-slide-counter` | `<p>` | Slide counter text update |
| `data-variant-select` | `<select>` | Variant change listener |
| `data-product-price` | `<div>` | Price HTML swap on variant change |
| `data-add-to-cart` | `<button>` | Button text/disabled state update |
| `data-accordion` | wrapper `<div>` | Accordion container |
| `data-accordion-btn` | `<button>` | Accordion toggle trigger |
| `data-accordion-panel` | content `<div>` | Animated height panel |
| `data-accordion-icon` | `<svg>` | Chevron rotation |
| `data-scroll-to-features` | `<button>` | Scrolls to & opens Features accordion |
| `data-size-guide-btn` | `<button>` | Size guide trigger (wired in 2C-iii) |

### Bug fixes (post-build audit)

Three root-cause issues prevented the product page from rendering correctly:

1. **Invalid JSON in locale files** — Both `locales/en.default.json` and `locales/en.default.schema.json` had `/* ... */` block comments (lines 1–9). JSON does not support comments, so Shopify could not parse translations. All `| t` calls failed, causing raw HTML tags to render as text in the delivery estimate and rewards banner.
   - **Fix:** Removed block comments from both files.

2. **Tailwind CSS not recompiled** — The product template was added but `npm run build:css` was never run. Critical classes were missing from `assets/theme.css`:
   - `md:grid` — without this, `hidden md:grid` on the desktop gallery kept it permanently `display:none` (empty left column)
   - `col-span-1` — half-width images in the alternating grid pattern
   - `container-narrow` — accordion section wrapper
   - **Fix:** Ran `npm run build:css` to regenerate `assets/theme.css`.

3. **Splide JS/CSS not loaded** — The mobile carousel referenced `Splide` in a `{% javascript %}` tag, but neither `splide.min.js` nor `splide.min.css` were loaded by the section. The `{% javascript %}` tag also offered no guarantee Splide would be available before execution.
   - **Fix:** Added `{{ 'splide.min.css' | asset_url | stylesheet_tag }}` at the top of the section. Replaced `{% javascript %}` with an inline `<script>` wrapped in `DOMContentLoaded`, preceded by `<script src="{{ 'splide.min.js' | asset_url }}" defer>`. Same pattern used by `sections/hero-carousel.liquid`.

---

## Repo audit — action items

> Identified by comparing the build against `_reference/repo/`. All items to be built matching the repo exactly.

### Quick fixes

- [x] **Accordion single-open behaviour** — Repo only allows one section open at a time. Build lets all toggle independently. Update inline JS to close others on open.

- [x] **Features & Benefits parsing** — Repo splits `features_and_benefits` metafield on `*` then `–` to render bold title + description pairs. Build dumps the raw value. Add parsing logic.

### Product form & buy box

- [x] **Add to Cart form** — Wrap variant selector + button in `{% form 'product' %}`, add hidden variant ID input. AJAX submission via `/cart/add.js`, "Adding..." / "Added!" button states, `cart:updated` custom event dispatched on success.

- [x] **Size selector** — Verified: repo (`purchase.tsx`) and live site both use a `<select>` dropdown, not radio buttons. `variantSize.tsx` exists but is unused. Current build already matches.

- [x] **Size guide — Kiwi Sizing modal** — Centered modal (`max-w-4xl`, `p-12`, `bg-taupe-100`) with Kiwi Sizing iframe (`h-[75vh]`). Close button top-right (`size-10 bg-white`). Backdrop click + Escape to close. Iframe src built from product ID/vendor/type/tags using defaults (`trendy-golf-uk.myshopify.com`, `trendygolf`). Lazy-loads iframe on first open. Created `snippets/size-guide-modal.liquid`.

- [ ] **Back-in-stock / Notify Me** — Repo shows "Notify me" button (opens modal with name + email form) when variant is OOS. Build shows disabled "Sold out" button. Implement via Klaviyo `createBackInStockSubscription` API.

- [ ] **Wishlist heart button** — Heart icon on PDP next to Add to Basket for logged-in users. Implement via Klaviyo API.

### Image gallery

- [x] **Fullscreen image zoom modal** — Full spec below in dedicated section. Built in `snippets/image-zoom-modal.liquid`.

### Below the buy box

- [ ] **Delivery estimate logic** — Dynamic next-day eligibility calculation with live countdown. Replace hardcoded "Get it by tomorrow".

- [ ] **Product statements / info boxes** — Icon + text info boxes below buy button (shipping, returns, etc.). Source from section settings or metafields.

- [ ] **Reviews modal** — Star rating clickable to open reviews modal. Match repo's review widget integration.

### Analytics

- [ ] **GA4 analytics events** — `view_item` on variant change, `add_to_cart` on API success. Wire up dataLayer pushes.

### Dependencies

- **Klaviyo** — Required for wishlist and back-in-stock. Need Klaviyo account details and API key for the new store. Need a Shopify app proxy or custom app for server-side API calls.
- ~~**Kiwi Sizing** — Need account URL for the size guide iframe.~~ Resolved: defaults hardcoded in repo (`trendy-golf-uk.myshopify.com`, `trendygolf`). Verify the new store's domain is registered with Kiwi Sizing.

### What's next
- Back-in-stock / Notify Me and Wishlist — blocked on Klaviyo
- ~~Delivery estimate logic~~ — done
- Product statements / info boxes — skipped (coded in repo but no content in Sanity CMS, never renders on live site)
- Reviews modal — blocked on Lipscore (see client questions)
- **GA4 analytics events** — next unblocked item
- **2C-v** — Expand section schema settings, review locale keys, final `validate_theme` pass

---

## Fullscreen Image Zoom Modal — Audit & Spec

> Source: `_reference/repo/app/components/partials/product/imageCarousel.tsx`, `zoomableImage.tsx`, `common/modal.tsx`, `common/carousel.tsx`
> Scraped: `_reference/scraped/html/product-polo.html`, `_reference/scraped/assets/js/modal-DQdNT-Xv.js`, `productCarousel-BOAptad1.js`

### Overview

Fullscreen modal containing a Splide carousel. Each slide renders an image as a CSS `background-image` with a toggle zoom button. Mouse hover pans the zoomed image on desktop; touch drag pans on mobile. Carousel navigation is disabled while zoomed.

---

### 1. Modal shell

Source uses Headlessui `<Dialog>` — we replicate the same markup/behaviour with vanilla HTML + JS (same pattern as `size-guide-modal.liquid`).

**Backdrop:**
```html
<div class="fixed inset-0 bg-black/50 duration-300 ease-out z-50" data-zoom-backdrop>
```
- `bg-black/50` — 50% opaque black
- Animate: `opacity-0` → `opacity-100` on open, reverse on close (`duration-300 ease-out`)
- Click backdrop → close modal

**Scroll wrapper:**
```html
<div class="fixed inset-0 w-screen h-dvh z-50">
```
- `h-dvh` — dynamic viewport height (accounts for mobile browser chrome)

**Panel:**
```html
<div class="relative mx-auto bg-taupe-100 max-w-full h-full
            transition duration-300 ease-out" data-zoom-panel>
```
- `bg-taupe-100` — matches modal background (#F6F5F2)
- `max-w-full h-full` — fullscreen (from `size="full"` + `flush` props)
- No padding (`clearContentPadding`)
- Entry animation: `-translate-y-8 opacity-0` → `translate-y-0 opacity-100`
- Exit animation: reverse

**Close button:**
```html
<button class="fixed right-0 top-0 z-20 flex size-10 items-center justify-center bg-white text-neutral-900 md:absolute"
        data-zoom-close>
  <!-- x-mark icon (solid, size-6) -->
</button>
```
- `size-10` (40×40px) — touch-friendly
- `fixed right-0 top-0` on mobile, `md:absolute` on desktop
- `z-20` — above carousel content
- `bg-white text-neutral-900`
- Icon: XMarkIcon **solid** variant (not outline) — `size-6`
- Close also on **Escape** key

---

### 2. Carousel (inside panel)

Reuse existing Splide setup (already loaded for mobile product carousel).

**Splide config:**
```js
{
  type: 'fade',           // Fade transition between slides (NOT slide)
  arrows: true,           // Show arrow nav
  pagination: false,      // Dots hidden by default
  drag: true,             // Enable drag/swipe
  start: startIndex,      // Open on clicked image index
  breakpoints: {
    768: {                // Mobile (≤768px)
      arrows: false,      // Hide arrows
      pagination: true,   // Show dot pagination
    }
  }
}
```

**Wrapper classes:**
```html
<div class="relative h-full"
     data-pagination-hide="false"
     data-pagination-dark="true">
  <div class="splide relative h-full">
```
- `data-pagination-hide` — dynamically set to `"true"` when zoom is active (hides dots)
- `data-pagination-dark` — always `"true"` (dark-styled dots)

**Slide counter (top-left):**
```html
<div class="absolute left-0 top-0 p-4">
  <p class="mb-0 text-sm">1 / 6</p>
</div>
```
- Format: `{current} / {total}` (1-indexed)
- Always visible on all breakpoints

**Arrow buttons (desktop only, overlay positioned):**
```html
<!-- Previous -->
<button class="splide__arrow splide__arrow--prev
               bg-taupe-300 p-3 transition-all duration-300
               disabled:bg-transparent disabled:opacity-50
               absolute left-5 top-1/2 -translate-y-1/2">
  <!-- chevron-left icon (outline, size-6) -->
</button>

<!-- Next -->
<button class="splide__arrow splide__arrow--next
               bg-taupe-300 p-3 transition-all duration-300
               disabled:bg-transparent disabled:opacity-50
               absolute right-5 top-1/2 -translate-y-1/2">
  <!-- chevron-right icon (outline, size-6) -->
</button>
```
- `bg-taupe-300` background, `p-3` padding
- Disabled: `bg-transparent opacity-50`
- Hidden on mobile via Splide breakpoint (`arrows: false` at ≤768px)
- Visible on desktop, vertically centred over slides

**Pagination dots (mobile only):**
- Rendered by Splide's built-in pagination
- Styled via `data-pagination-dark="true"` (existing CSS handles this)
- Hidden when `data-pagination-hide="true"` (zoom active)

**Each slide:**
```html
<li class="splide__slide">
  <div data-measure class="inline-block w-full h-full">
    <div class="flex h-dvh items-center justify-center">
      <!-- ZoomableImage here -->
    </div>
  </div>
</li>
```
- `h-dvh` — full dynamic viewport height
- `flex items-center justify-center` — image centred vertically and horizontally

**Drag disabled when zoomed:**
- When any image is zoomed in, set `splide.options = { drag: false }` and call `splide.refresh()`
- When zoom exits, re-enable: `splide.options = { drag: true }`

---

### 3. Zoomable image (per slide)

Uses **CSS `background-image`** (NOT an `<img>` tag) to enable pan/zoom via `background-position`.

**Outer wrapper:**
```html
<div class="relative size-full px-6 py-10 lg:p-14" data-zoom-slide>
```
- Padding `px-6 py-10` on mobile, `lg:p-14` on desktop — **removed when zoomed**
- When zoomed: just `relative size-full` (no padding)

**Image container:**
```html
<div class="mx-auto max-h-full max-w-full bg-center bg-no-repeat"
     role="img"
     aria-label="{{ image.alt }}"
     style="
       height: {zoomed ? '100%' : '{height}px'};
       width: {zoomed ? '100%' : '{width}px'};
       background-image: url('{image_url}');
       background-size: {zoomed ? 'cover' : 'contain'};
       background-position: {position};
       cursor: {zoomed ? 'zoom-in' : 'default'};
     "
     data-zoom-image>
</div>
```
- `mx-auto max-h-full max-w-full` — centred, constrained
- `bg-center bg-no-repeat` — default Tailwind utilities
- **Not zoomed:** `background-size: contain`, `width/height` set to image natural dimensions in px
- **Zoomed:** `background-size: cover`, `width/height: 100%` (fills viewport)
- `cursor: zoom-in` when zoomed (indicating you can still interact), `default` when not
- `role="img"` + `aria-label` for accessibility

**Zoom toggle button:**
```html
<button class="absolute right-4 top-14 flex items-center gap-2 bg-taupe-900/50 p-4 text-white"
        data-zoom-toggle>
  <!-- When NOT zoomed: magnifying-glass-plus icon (outline, size-5) -->
  <!-- When zoomed: magnifying-glass-minus icon (outline, size-5) -->
  <span>Zoom</span>
</button>
```
- Position: `absolute right-4 top-14` (top-right, below close button)
- Background: `bg-taupe-900/50` — dark taupe at 50% opacity
- `p-4` padding, white text
- Icon: **outline** variant, `size-5` (20px)
- Switches between plus/minus magnifying glass based on zoom state
- Text label always reads "Zoom"

---

### 4. Mouse interaction (desktop zoom)

When zoomed, `mousemove` maps cursor position to `background-position` percentage:
```js
const rect = container.getBoundingClientRect();
const relX = ((clientX - rect.left) / rect.width) * 100;
const relY = ((clientY - rect.top) / rect.height) * 100;
backgroundPosition = `${relX}% ${relY}%`;
```
- Image follows the cursor — hover top-left shows top-left of image, etc.
- Only active when `isZoomed === true`

---

### 5. Touch interaction (mobile zoom)

Delta-based panning (natural drag feel):
```js
// onTouchStart: record initial position
lastTouch = { x: touch.clientX, y: touch.clientY };

// onTouchMove: calculate delta, update position
const dx = touch.clientX - lastTouch.x;
const dy = touch.clientY - lastTouch.y;
const newX = clamp(currentX - (dx / width) * 100, 0, 100);
const newY = clamp(currentY - (dy / height) * 100, 0, 100);
backgroundPosition = `${newX}% ${newY}%`;
lastTouch = { x: touch.clientX, y: touch.clientY };
```
- Subtract delta: dragging finger right moves viewport right (image pans left)
- Clamped 0–100 on both axes
- Updates `lastTouch` on each move for continuous delta calculation

---

### 6. Zoom state management

```
zoomedSlideIndex: number | null  (null = no slide zoomed)
zoomActive: zoomedSlideIndex !== null
```

**On zoom toggle:**
1. Toggle `isZoomed` boolean
2. Reset `backgroundPosition` to `'center'` (50%, 50%)
3. Fire `onZoomChange` callback to parent

**Parent receives `onZoomChange(isZoomed)`:**
- If zooming in: set `zoomedSlideIndex = slideIndex`
- If zooming out: clear `zoomedSlideIndex = null` (only if this slide was the active one)
- When `zoomActive`:
  - Set `data-pagination-hide="true"` (hides dots)
  - Disable Splide drag (`splide.options = { drag: false }`)

---

### 7. Opening the modal

**From mobile carousel:** Click on slide image → open modal at that slide index
**From desktop grid:** Click on grid image → open modal at that image index

Both fire the same handler:
```js
activeImageIndex = clickedIndex;
imageCarouselOpen = true;
```

The modal's Splide uses `start: activeImageIndex` to open on the correct slide.

---

### 8. Keyboard interactions

| Key | Action |
|-----|--------|
| Escape | Close modal |
| ArrowLeft | Previous slide (Splide built-in) |
| ArrowRight | Next slide (Splide built-in) |
| Tab | Focus trap within modal |

---

### 9. Responsive summary

| Feature | Mobile (≤768px) | Desktop (>768px) |
|---------|-----------------|-------------------|
| Carousel type | `fade` | `fade` |
| Arrows | Hidden | Visible (overlay) |
| Dots | Visible | Hidden |
| Drag/swipe | Enabled (disabled when zoomed) | Enabled (disabled when zoomed) |
| Close button | `fixed` | `absolute` |
| Image padding | `px-6 py-10` | `p-14` |
| Zoom pan | Touch delta | Mouse position |
| Counter | Visible | Visible |

---

### 10. New icons needed

| Icon | Variant | Used in |
|------|---------|---------|
| `x-mark-solid` | **Solid** (filled) | Close button — existing `x-mark` in `icon.liquid` is outline, need solid version |
| `magnifying-glass-plus` | Outline | Zoom button (not zoomed) |
| `magnifying-glass-minus` | Outline | Zoom button (zoomed) |

Note: existing `magnifying-glass` in `icon.liquid` is the search icon without +/- — need the plus and minus variants.

---

### 11. New Tailwind classes to verify

These classes need to be in `assets/theme.css` after rebuild:
- `h-dvh` — dynamic viewport height
- `bg-black/50` — already used by size-guide-modal
- `bg-taupe-900/50` — 50% opacity variant
- `size-full` — `width: 100%; height: 100%`
- `max-h-full`, `max-w-full`
- `bg-center`, `bg-no-repeat`, `bg-contain`, `bg-cover` (Tailwind utilities, but `background-size` is set inline)

---

### 12. Files to create/update

| File | Change |
|------|--------|
| `snippets/image-zoom-modal.liquid` | **New** — modal shell, Splide carousel, zoomable image markup, all JS |
| `sections/product-template.liquid` | Add `{% render 'image-zoom-modal' %}`, add click handlers on mobile carousel slides + desktop grid images, pass `product.media` data |
| `snippets/icon.liquid` | Add `x-mark-solid`, `magnifying-glass-plus`, `magnifying-glass-minus` icons |
| `assets/theme.css` | Rebuild via `npm run build:css` |

---

### 13. Data attributes plan

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-zoom-modal` | Modal root wrapper | Toggle `hidden` class to show/hide |
| `data-zoom-backdrop` | Backdrop div | Click-to-close + fade animation |
| `data-zoom-panel` | Dialog panel | Entry/exit animation target |
| `data-zoom-close` | Close button | Click handler |
| `data-zoom-carousel` | `.splide` root | Splide init for modal carousel |
| `data-zoom-counter` | Counter `<p>` | Update `{current} / {total}` text |
| `data-zoom-slide` | Outer wrapper per slide | Toggle padding on zoom |
| `data-zoom-image` | Background-image div | Pan/zoom target, style updates |
| `data-zoom-toggle` | Zoom button | Toggle zoom state |
| `data-zoom-toggle-icon` | Icon container in button | Swap plus/minus icon |
| `data-image-index` | On product images (mobile + desktop) | Pass clicked index to modal opener |

---

## Build notes (Add to Cart + Size Guide)

### Files created
| File | Purpose |
|------|---------|
| `snippets/size-guide-modal.liquid` | Centered modal (`max-w-4xl`, `p-12`, `bg-taupe-100`) with Kiwi Sizing iframe (`h-[75vh]`), backdrop, close button, Escape key |

### Files updated
| File | Change |
|------|--------|
| `sections/product-template.liquid` | Wrapped size selector + button in `{% form 'product' %}` with hidden variant ID input. AJAX add-to-cart via `/cart/add.js` with button states. Renders `size-guide-modal` snippet. Embeds Kiwi Sizing config JSON. JS builds iframe URL from product data, lazy-loads on first open, closes on backdrop/Escape/button. |

### Data attributes added
| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-product-form` | `<form>` | AJAX form submission target |
| `data-variant-id` | `<input type="hidden">` | Hidden variant ID for form + JS updates |
| `data-size-guide-modal` | wrapper `<div>` | Modal root, toggled via `hidden` class |
| `data-size-guide-backdrop` | backdrop `<div>` | Click-to-close target |
| `data-size-guide-panel` | panel `<div>` | Modal panel |
| `data-size-guide-iframe` | `<iframe>` | Kiwi Sizing iframe, src set on first open |
| `data-size-guide-close` | `<button>` | Close button |
| `data-kiwi-json` | `<script type="application/json">` | Product data for building Kiwi Sizing URL |

### Validation
- All files passed Shopify MCP `validate_theme`
- CSS rebuilt via `npm run build:css`

---

## Build notes (Fullscreen Image Zoom Modal)

### Files created
| File | Purpose |
|------|---------|
| `snippets/image-zoom-modal.liquid` | Fullscreen modal with Splide fade carousel, per-slide CSS background-image zoom/pan, mouse + touch handlers |

### Files updated
| File | Change |
|------|--------|
| `snippets/icon.liquid` | Added `x-mark-solid` (solid), `magnifying-glass-plus` (outline), `magnifying-glass-minus` (outline) icons |
| `sections/product-template.liquid` | Added `data-image-index` on mobile carousel images + desktop grid wrappers. Added click handlers (delegated) on both to call `window.openImageZoomModal(index)`. Added `{% render 'image-zoom-modal' %}`. |
| `assets/theme.css` | Rebuilt — includes `h-dvh`, `size-full`, `bg-black/50`, `bg-taupe-900/50`, `max-h-full`, `max-w-full` |

### Data attributes added
| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-zoom-modal` | Modal root | Toggle `hidden` to show/hide |
| `data-zoom-backdrop` | Backdrop `<div>` | Click-to-close + opacity animation |
| `data-zoom-panel` | Panel `<div>` | Translate/opacity entry/exit animation |
| `data-zoom-close` | Close `<button>` | Close handler |
| `data-zoom-carousel` | `.splide` root | Splide fade carousel init |
| `data-zoom-counter` | Counter `<p>` | `{current} / {total}` text updates |
| `data-zoom-slide` | Slide outer wrapper | Padding toggle on zoom |
| `data-zoom-image` | Background-image `<div>` | Pan/zoom target, inline style updates |
| `data-zoom-toggle` | Zoom `<button>` | Toggle zoom state per slide |
| `data-zoom-toggle-icon` | Icon `<span>` | Swap plus/minus SVG on zoom |
| `data-image-index` | Product images (mobile + desktop) | Pass clicked index to modal opener |

### Validation
- All files passed Shopify MCP `validate_theme` (conversation `e7d8ddfd`)
- CSS rebuilt via `npm run build:css`

---

## "Explore More" Product Recommendations — Audit & Spec

> Source: `_reference/repo/app/components/pages/productSingle.tsx` (lines 158–199), `partials/global/productCarousel.tsx`, `partials/common/carousel.tsx`, `partials/global/inView.tsx`, `partials/global/staggerItem.tsx`, `utils/classes.ts`

### Overview

Splide product card carousel below the product accordions. Heading "Explore More", arrows positioned above the carousel on desktop. Each slide is a standard product card wrapped in a staggered scale-in animation triggered by viewport intersection. Data fetched client-side via Shopify's product recommendations API (repo uses Rebuy — unavailable to us).

### Data source

**Built against Rebuy** (matches repo). Rebuy app embed is active on `trendy-golf-development` and the public storefront API key is stored under **Theme settings → Rebuy → Rebuy API key** (`settings.rebuy_api_key`).

Flow, mirroring `_reference/repo/app/.server/rebuy/getSimilarProducts.ts`:

```
GET https://rebuyengine.com/api/v1/products/similar_products
    ?key={settings.rebuy_api_key}
    &shopify_product_ids={product.id}
    &limit=8
    &country_code={localization.country.iso_code}
```

Because Rebuy's response is Shopify-Admin-shaped (not storefront-shaped) and our `product-card.liquid` needs metafields/hover images/sale badges, we **do not** render cards from Rebuy's payload directly. Instead we extract `handle`s and use Shopify's Section Rendering API to render the real card:

```
GET /products/{handle}?section_id=product-card-renderer   → HTML of <product-card.liquid> for that product
```

The tiny `sections/product-card-renderer.liquid` wrapper exists only for this purpose.

- Gift cards: never show (section root has `data-gift-card="true"` and JS bails early, mirroring `useSimilarProducts.isGiftCard` guard)
- Missing API key: section hides (set `root.hidden = true`)
- Rebuy returns empty / errors: section hides
- Any card fetch errors: failed handle is skipped, remaining cards still render

### Parent context

The Explore More section lives inside a shared parent wrapper with the accordions:
```html
<div class="mb-14 flex flex-col gap-10">
  <div class="container-narrow">
    <!-- Product accordions (description, delivery, etc.) -->
  </div>
  <!-- "Explore More" section goes here -->
</div>
```
- `gap-10` creates 40px vertical spacing between accordions and carousel
- `mb-14` adds 56px bottom margin to the whole block

### Outer wrapper

```html
<div class="overflow-hidden">
  <div class="container">
    <h2 class="mb-8 text-center font-serif text-3xl lg:text-4xl">Explore More</h2>
    <!-- InView wrapper + carousel -->
  </div>
</div>
```
- `overflow-hidden` on outer div — prevents peek slides from causing horizontal scroll
- `container` — standard site container (not `container-narrow`, not `2xl:max-w-9xl`)
- Heading sits **inside** the container, **above** the InView/carousel wrapper

### Heading

```html
<h2 class="mb-8 text-center font-serif text-3xl lg:text-4xl">Explore More</h2>
```
- `<h2>` tag, sized as h3 via Heading component: `text-3xl lg:text-4xl` (from `headingSizes.h3`)
- `font-serif` — display font (Freight Display)
- `mb-8 text-center`
- Heading appears in **both** the loading state and the loaded state (always visible once fetch starts)

### InView wrapper (viewport animation trigger)

```html
<div data-inview="false" class="group-inview group/blocks">
  <!-- Splide carousel inside -->
</div>
```
- Wraps the entire carousel
- Uses `IntersectionObserver` with `threshold: 0.3` and `rootMargin: '0px 0px -20%'`
- Sets `data-inview="true"` once 30% of the element is visible (fires once — `once: true`)
- `group/blocks` class enables child animations via `group-data-[inview=true]/blocks:` selectors

**Shopify Liquid equivalent:** Use a `data-inview` attribute + inline JS `IntersectionObserver`:
```html
<div data-inview="false" class="group/blocks" id="explore-more-inview">
  <!-- carousel -->
</div>
<script>
  (function() {
    var el = document.getElementById('explore-more-inview');
    if (!el) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          el.setAttribute('data-inview', 'true');
          obs.disconnect();
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -20%' });
    obs.observe(el);
  })();
</script>
```

### Stagger animation per slide

Each product card is wrapped in a stagger container with a cascading delay:
```html
<div style="transition-delay: calc(var(--base-delay, 0ms) + 0ms);"
     class="opacity-0 scale-75 transition-all duration-1000 group-data-[inview=true]/blocks:opacity-100 group-data-[inview=true]/blocks:scale-100">
  <!-- product card -->
</div>
```

- **Initial state:** `opacity-0 scale-75` (invisible, scaled down to 75%)
- **Animated state:** `opacity-100 scale-100` (fully visible, full size)
- **Trigger:** Parent `data-inview` flips to `"true"`
- **Duration:** `1000ms` (`duration-1000`)
- **Stagger delay per slide:** `index * 90ms`
  - Slide 0: `0ms`
  - Slide 1: `90ms`
  - Slide 2: `180ms`
  - Slide 3: `270ms`
  - Slide 4: `360ms` (etc.)

**CSS needed in theme.css:**
```css
/* Stagger animation — scale-in on viewport entry */
.group\/blocks[data-inview="true"] .stagger-item {
  opacity: 1 !important;
  transform: scale(1) !important;
}
```
Or use Tailwind arbitrary group syntax if available. See CSS section below.

### Carousel (Splide)

**Splide wrapper:** The `<div class="splide">` element gets `relative` class (from carousel component line 115) — this is **critical** for `arrowsAbove` absolute positioning.

**Config:**
```js
{
  perPage: 4,
  gap: 10,
  arrows: true,
  pagination: false,
  breakpoints: {
    480: {
      perPage: 1,
      arrows: false,
      padding: { left: 0, right: '35%' },
    },
    768: {
      perPage: 2,
      arrows: false,
      padding: { left: 0, right: '20%' },
    },
    1280: {
      perPage: 3,
      padding: { left: 0, right: '10%' },
    },
  },
}
```
- Desktop (>1280px): 4 per page, arrows visible, no padding
- ≤1280px: 3 per page, 10% right peek, arrows still visible
- ≤768px: 2 per page, 20% right peek, no arrows
- ≤480px: 1 per page, 35% right peek, no arrows
- `gap: 10` (10px between slides)
- No pagination dots at any breakpoint

**Track overflow (`showOverflow: true`):**
```html
<div class="splide__track overflow-visible xl:overflow-hidden xl:py-1">
```
- `overflow-visible` below `xl` — peek slides visible outside container
- `xl:overflow-hidden` clips at ≥1280px
- `xl:py-1` — 4px vertical padding at xl (prevents box-shadow clipping)

**Arrow buttons (arrowsAbove pattern):**
```html
<div class="splide__arrows flex justify-center pt-6 md:absolute md:right-0 md:top-0 md:-translate-y-full md:pb-3 md:pt-0">
  <button class="splide__arrow splide__arrow--prev bg-taupe-300 p-3 transition-all duration-300 disabled:bg-transparent disabled:opacity-50">
    <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  </button>
  <button class="splide__arrow splide__arrow--next bg-taupe-300 p-3 transition-all duration-300 disabled:bg-transparent disabled:opacity-50">
    <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  </button>
</div>
```
- Mobile: centred below carousel (`flex justify-center pt-6`)
- Desktop (md+): absolute positioned top-right, above the carousel
  - `md:absolute md:right-0 md:top-0` — anchored to top-right of `relative` Splide wrapper
  - `md:-translate-y-full` — moved fully above itself (sits above heading row)
  - `md:pb-3 md:pt-0` — 12px bottom padding on desktop, removes top padding
- `bg-taupe-300 p-3` — taupe background, 12px padding
- Disabled state: `bg-transparent opacity-50`
- Icons: Heroicons outline chevrons (`fill="none"`, `stroke="currentColor"`, `stroke-width="1.5"`)

**Each slide:**
```html
<li class="splide__slide">
  <div data-measure class="inline-block w-full h-full">
    <div style="transition-delay: calc(var(--base-delay, 0ms) + {index * 90}ms);"
         class="opacity-0 scale-75 transition-all duration-1000 group-data-[inview=true]/blocks:opacity-100 group-data-[inview=true]/blocks:scale-100">
      <!-- product-card.liquid -->
    </div>
  </div>
</li>
```
- `data-measure` attribute on inner wrapper (used by Splide for height calc)
- `inline-block w-full h-full` — fills slide dimensions
- Stagger wrapper with animation classes (see Stagger section above)
- Reuse existing `product-card.liquid` snippet

### Loading state (skeleton)

Shown while recommendations are being fetched. **Heading is included in the loading state:**
```html
<div class="overflow-hidden">
  <div class="container">
    <h2 class="mb-8 text-center font-serif text-3xl lg:text-4xl">Explore More</h2>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="h-48 animate-pulse bg-black/10"></div>
      <div class="h-48 animate-pulse bg-black/10"></div>
      <div class="h-48 animate-pulse bg-black/10 hidden md:block"></div>
      <div class="h-48 animate-pulse bg-black/10 hidden md:block"></div>
    </div>
  </div>
</div>
```
- 2 skeleton blocks visible on mobile, 4 on desktop
- `h-48 animate-pulse bg-black/10` — 192px tall, pulsing, 10% black overlay
- Skeleton items 3 & 4: `hidden md:block` (desktop only)
- Entire loading block replaced by carousel block once data loads (not just skeleton grid)

### JS behaviour

Lives in `assets/theme.js` as the `ExploreMore` IIFE. On DOM ready:

1. Read `window.exploreMoreConfig` (emitted by the section Liquid with `productId`, `rebuyApiKey`, `isGiftCard`, `countryCode`, `rootUrl`)
2. Bail (hide section) if gift card, API key missing, or product id not numeric
3. `fetchSimilar()` → hits Rebuy `/products/similar_products`, returns array of handles
4. `renderCards(handles)` → parallel `fetch('/products/{handle}?section_id=product-card-renderer')` for each handle, `extractCardHtml()` strips Shopify's section wrapper div and keeps the card innerHTML
5. `mountCarousel(cards)` → builds `<li class="splide__slide">` slides with stagger wrapper, removes skeleton, reveals loaded state, mounts Splide with config above
6. `observeInView()` → `IntersectionObserver` flips `data-inview="true"` when 30% visible (once); stagger CSS variants animate each slide

### Architecture

Static section in the product template JSON — always rendered, not removable by the merchant, no presets.

**Template JSON** (`templates/product.json`):
```json
{
  "sections": {
    "main": { "type": "product-template", "settings": {} },
    "explore-more": { "type": "product-explore-more", "settings": {} }
  },
  "order": ["main", "explore-more"]
}
```

**Section file:** `sections/product-explore-more.liquid` — standalone section, no `presets` key in schema. Schema should have `"name": "Explore More"` and no blocks.

### Implementation plan

| File | Change | Status |
|------|--------|--------|
| `config/settings_schema.json` | Added "Rebuy" settings group with `rebuy_api_key` global setting (also used by cart drawer). | Done |
| `config/settings_data.json` | Key value lives at top-level `rebuy_api_key`. | Done |
| `sections/cart-drawer.liquid` | Reads `settings.rebuy_api_key` instead of the section-level setting. | Done |
| `sections/product-card-renderer.liquid` | New thin section — renders `{% render 'product-card', product: product %}` for the Section Rendering API. | Done |
| `sections/product-explore-more.liquid` | Loading skeleton + heading + Splide shell + `window.exploreMoreConfig`. | Done |
| `assets/theme.js` | `ExploreMore` IIFE — Rebuy fetch, card hydration via Section Rendering API, Splide mount, InView observer. | Done |
| `templates/product.json` | `explore-more` entry in section order. | Done |

### CSS additions needed

```css
/* Stagger scale-in animation */
.group\/blocks[data-inview="true"] .stagger-scale-in {
  opacity: 1;
  transform: scale(1);
}
.stagger-scale-in {
  opacity: 0;
  transform: scale(0.75);
  transition: all 1000ms;
}

/* Skeleton pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

/* Track overflow for peek effect */
.explore-track-overflow { overflow: visible; }
@media (min-width: 1280px) {
  .explore-track-overflow { overflow: hidden; padding-top: 4px; padding-bottom: 4px; }
}
```

### Notes
- No new card snippets needed — product cards render via `snippets/product-card.liquid` through the Section Rendering API
- Splide already loaded on product page (mobile gallery + zoom modal)
- `arrowsAbove` positioning requires the Splide wrapper div to have `position: relative` so arrow container can `absolute` position against it
- The repo also has a "Shop the Look" section (uses `recommendedProducts` from a separate Rebuy `recommended_products` endpoint with `container mb-10 2xl:max-w-9xl`) — that's a separate section, not part of this spec
- Repo's `useSimilarProducts` validates `productId` is numeric (`/^\d+$/.test(productId)`) and aborts in-flight requests on ID change — we match the numeric guard; we don't need abort since the carousel fetches once at mount
