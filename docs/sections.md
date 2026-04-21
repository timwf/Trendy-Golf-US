# Sections

## 3A — Hero Carousel (`hero-carousel.liquid`)

> Full-viewport video/image carousel with text overlay and CTA. Reusable section — used 5× on the source homepage with different content.

### Visual Reference

- Full-bleed, viewport-height slide (video or image background)
- Text overlay anchored to bottom, centred
- Bottom gradient overlay (`from-black/0 to-black/60`) ensures text readability
- Subheading → Heading (serif) → CTA button, stacked vertically
- Progress bars along the bottom (one per slide, fills over the slide's duration)
- Fade-up entrance animation on scroll (intersection observer)

### Content Model — Per Slide (Block)

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Subheading** | `text` | Small text above heading — e.g. "Shop the latest", "New In". Optional |
| **Heading** | `text` | Large display text — e.g. "Manors", "Head". Required |
| **Heading size** | `select` | `h1` (largest) / `h2` / `h3` — controls `text-5xl lg:text-6xl` vs smaller |
| **Heading font** | `select` | `serif` (Playfair Display) / `sans` (Oxygen) — source uses serif for most |
| **Media type** | `select` | `video` / `image` |
| **Image** | `image_picker` | Background image (required for image type, fallback/poster for video) |
| **Video URL (desktop)** | `video_url` | Vimeo/YouTube embed URL — accepts `youtube`, `vimeo` |
| **Video URL (mobile)** | `video_url` | Separate mobile-optimised video (different aspect ratio) |
| **Slide duration** | `range` | Autoplay time in seconds (min 3, max 20, default 7, step 1) |
| **Button label** | `text` | CTA text — e.g. "SHOP NOW". Leave blank to hide button |
| **Button link** | `url` | CTA destination |
| **Button style** | `select` | `white` (solid white bg, dark text) / `transparent` (outlined) / `text` (text link + arrow) |

### Content Model — Section Settings

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Full height** | `checkbox` | `h-svh` vs fixed aspect ratio. Default: true |
| **Enable autoplay** | `checkbox` | Default: true |
| **Show progress bars** | `checkbox` | Slide progress indicators at bottom. Default: true |
| **Enable fade-up animation** | `checkbox` | Intersection observer entrance animation. Default: true |

### Carousel Behaviour (Splide)

```
Type:       fade (crossfade between slides)
Per page:   1
Autoplay:   true, per-slide interval from `speed` field
Pagination: custom progress bars (not Splide dots)
Arrows:     none (not on source site)
Loop:       true (infinite)
Drag:       true (swipe on mobile)
```

- Progress bars: one bar per slide, active bar fills left-to-right over the slide's duration
- When a slide has video, autoplay timer should match the `speed` field (video plays for that duration, then advances)
- Progress bars hidden when only 1 slide

### Button Styles

| Style | Classes | Visual |
|-------|---------|--------|
| `white` | `bg-white text-taupe-900 px-8 py-3 text-sm tracking-widest uppercase` | Solid white pill, dark text |
| `transparent` | `border border-white text-white px-8 py-3 text-sm tracking-widest uppercase` | Outlined, white border+text |
| `text` | `text-white text-sm tracking-widest uppercase inline-flex items-center gap-2` | Text link + chevron-right icon |

### Animation

Scroll-triggered fade-up using `data-inview` attribute + intersection observer:

```
Initial:   opacity-0 -translate-y-14
Animate:   opacity-100 translate-y-0
Duration:  1000ms ease
Stagger:   button delayed 300ms after heading
Trigger:   element enters viewport (IntersectionObserver)
```

### Video Implementation

- Desktop: Vimeo/YouTube iframe, autoplay, muted, loop, no controls
- Mobile: separate URL (different aspect ratio optimisation)
- Fallback: `image` field shown while video loads / if video fails
- Shopify `video_url` type natively accepts Vimeo and YouTube URLs

### HTML Structure (target)

```html
<section class="hero-carousel">
  <div class="splide" data-hero-carousel>
    <div class="splide__track">
      <ul class="splide__list">

        {%- for block in section.blocks -%}
        <li class="splide__slide relative h-svh max-h-screen overflow-hidden"
            data-slide-speed="{{ block.settings.slide_duration }}"
            {{ block.shopify_attributes }}>

          <!-- Background media -->
          {%- if block.settings.media_type == 'video' -%}
            <!-- Desktop video -->
            <div class="hidden lg:block absolute inset-0">
              {%- render 'hero-video', url: block.settings.video_url -%}
            </div>
            <!-- Mobile video -->
            <div class="lg:hidden absolute inset-0">
              {%- render 'hero-video', url: block.settings.video_url_mobile -%}
            </div>
          {%- endif -%}

          <!-- Fallback / poster image -->
          {%- if block.settings.image != blank -%}
            <img src="{{ block.settings.image | image_url: width: 1920 }}"
                 alt="{{ block.settings.heading | escape }}"
                 class="absolute inset-0 size-full object-cover
                        {%- if block.settings.media_type == 'video' %} lg:hidden{% endif -%}"
                 loading="lazy">
          {%- endif -%}

          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/0 to-black/60"></div>

          <!-- Text content -->
          <div class="absolute inset-x-0 bottom-0 flex flex-col items-center pb-16 px-6 text-center text-white"
               data-inview="false">
            {%- if block.settings.subheading != blank -%}
              <p class="text-sm tracking-wider uppercase mb-4 ...animation classes...">
                {{ block.settings.subheading }}
              </p>
            {%- endif -%}

            <h2 class="font-serif text-5xl lg:text-6xl mb-6 ...animation classes...">
              {{ block.settings.heading }}
            </h2>

            {%- if block.settings.button_label != blank -%}
              <a href="{{ block.settings.button_link }}"
                 class="...button style classes... ...animation classes with delay-300...">
                {{ block.settings.button_label }}
              </a>
            {%- endif -%}
          </div>

        </li>
        {%- endfor -%}

      </ul>
    </div>

    <!-- Progress bars -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      {%- for block in section.blocks -%}
        <div class="w-16 h-0.5 bg-white/40 overflow-hidden">
          <div class="h-full bg-white origin-left scale-x-0" data-progress-bar></div>
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>
```

### Schema Structure

```json
{
  "name": "t:sections.hero_carousel.name",
  "tag": "section",
  "class": "hero-carousel-section",
  "settings": [
    { "type": "checkbox", "id": "full_height", "label": "...", "default": true },
    { "type": "checkbox", "id": "autoplay", "label": "...", "default": true },
    { "type": "checkbox", "id": "show_progress", "label": "...", "default": true },
    { "type": "checkbox", "id": "enable_animation", "label": "...", "default": true }
  ],
  "blocks": [
    {
      "type": "slide",
      "name": "t:sections.hero_carousel.blocks.slide.name",
      "settings": [
        { "type": "text", "id": "subheading" },
        { "type": "text", "id": "heading" },
        { "type": "select", "id": "heading_size", "options": ["h1","h2","h3"] },
        { "type": "select", "id": "heading_font", "options": ["serif","sans"] },
        { "type": "select", "id": "media_type", "options": ["video","image"] },
        { "type": "image_picker", "id": "image" },
        { "type": "video_url", "id": "video_url", "accept": ["youtube","vimeo"] },
        { "type": "video_url", "id": "video_url_mobile", "accept": ["youtube","vimeo"] },
        { "type": "range", "id": "slide_duration", "min": 3, "max": 20, "step": 1, "default": 7 },
        { "type": "text", "id": "button_label" },
        { "type": "url", "id": "button_link" },
        { "type": "select", "id": "button_style", "options": ["white","transparent","text"] }
      ]
    }
  ],
  "presets": [
    {
      "name": "t:sections.hero_carousel.presets.name"
    }
  ]
}
```

### JavaScript Requirements

1. **Splide init** — fade mode, per-slide autoplay interval from `data-slide-speed`
2. **Progress bar sync** — CSS `scaleX` animation timed to slide duration, reset on slide change
3. **Intersection observer** — set `data-inview="true"` when section enters viewport, triggering CSS animations
4. **Video control** — pause video when slide is not active, play when active

### Dependencies

- `splide.min.js` + `splide.min.css` in `assets/` (added)
- `icon.liquid` snippet (chevron-right for text button style — already exists)
- Intersection observer utility (inline in section or in `theme.js`)

### Decisions

1. **Splide assets** — added to `assets/` (v4.x)
2. **Video poster/fallback** — `image` field doubles as video poster. No separate poster field needed
3. **Header overlay** — already handled by header section. Hero just needs no top margin/padding
4. **Mobile video** — keeping the separate `video_url_mobile` field. Source site uses different Vimeo edits per breakpoint (portrait vs landscape). Falls back to desktop video if left blank

### Status: BUILT

- `sections/hero-carousel.liquid` — section with Liquid, schema, inline JS
- `snippets/hero-video.liquid` — YouTube/Vimeo autoplay iframe snippet
- `assets/splide.min.js` + `assets/splide.min.css` — Splide v4.1.4 (full bundle from CDN)
- Locale strings added to `en.default.json` and `en.default.schema.json`
- Wired into `templates/index.json` as first section

### Repo Audit — To-Do

> Compared against `_reference/repo/app/components/blocks/bannerCarousel.tsx`, `carousel.tsx`, `useCarousel.ts`

**High priority:**

- [x] **Progress bars** — size `h-1 w-20` (not `h-0.5 w-16`), bg `bg-white/20` (not `bg-white/40`), gap `gap-3` (not `gap-2`), position `pb-6 xl:pb-8` (not `bottom-4`), remove `rounded-full`, make clickable `<button>` elements, use `z-2` not `z-10`
- [x] **Content container** — use `container-narrow` (max-width constrained) instead of `px-6`
- [x] **Animation direction** — heading should animate down (`-translate-y-14` → `0`, `animateTranslateToBottom`), button should animate up (`translate-y-14` → `0`, `animateTranslateToTop`). They converge, not both from top
- [x] **Slide responsive sizing** — repo uses `h-svh max-h-screen w-full sm:aspect-tablet sm:h-auto lg:aspect-video` (responsive breakpoints), not just `h-svh` or `aspect-[16/9]` toggle

**Medium priority:**

- [x] **Content positioning** — repo uses full-height flex container (`absolute inset-0 flex size-full flex-col items-center py-12 lg:py-14 xl:py-16 3xl:py-28`) with alignment option (`justify-start/center/end`). We always pin to bottom
- [x] **Autoplay** — switch from Splide native autoplay to `setTimeout`-based scheduling (repo sets `autoplay: false`, self-manages via `scheduleNext`)
- [x] **Heading margin** — `mb-8` not `mb-6`
- [x] **InView threshold** — use `threshold: 0.3` (repo hero passes `rootMargin: '0px 0px 0px'` but keeps default `threshold: 0.3`)

### Bug Fixes Applied

1. **Splide crash on mount** — original `splide.min.js` was a partial build missing the Sync component initialisation. Replaced with full v4.1.4 bundle from jsDelivr CDN
2. **Slide opacity stuck at 0** — Splide v4 Web Animations API overrides CSS `opacity: 1` on `.is-active`. Added `!important` CSS override and a pre-init rule for the first slide
3. **Text overlay invisible** — intersection observer only watched one `[data-inview]` element (first slide), so the active slide's text stayed at `opacity: 0`. Fixed to observe the section element and flip all `[data-inview]` elements. Also added immediate `getBoundingClientRect` check for hero already in viewport on load
4. **Vimeo video not covering slide** — iframe had conflicting CSS: `inset-0` + `size-full` forced exact 100% dimensions, preventing the 16:9 iframe from scaling beyond the container. Removed conflicting Tailwind classes; now uses only `position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)` with `min-width:100%; min-height:100%` and `aspect-ratio:16/9` for proper cover behaviour

---

## 3B — Banner Cards (`banner-cards.liquid`)

> Image card grid / carousel with text overlay and CTA. Used 2× on the source homepage — once as a 2-col grid (Men / Women) and once as a 3-col Splide carousel (APC / J.Lindeberg / Manors).

### Visual Reference

- Full-bleed image cards with text overlay anchored to bottom-centre
- Bottom gradient (`from-black/0 to-black/60`) on every card for text readability
- Hover gradient overlay (`from-black/10 to-black/30`) fades in on hover (`duration-500`)
- Heading → "SHOP NOW" text link with chevron-right, stacked vertically
- Fade-up entrance animation on scroll (intersection observer, same pattern as hero)
- Each card is a single `<a>` wrapping the entire image + overlay

### Homepage Instances

| Instance | Columns | Aspect Ratio | Heading Tag | Heading Size | Layout | Bottom Margin |
|----------|---------|-------------|-------------|-------------|--------|---------------|
| 1 (Men / Women) | 2 | `aspect-square` | `h2` | `text-3xl lg:text-4xl` | CSS grid | `lg:mb-14 mb-8` |
| 2 (APC / J.Lindeberg / Manors) | 3 | `aspect-[7/9]` | `h3` | `text-xl lg:text-2xl` | Splide carousel | `lg:mb-8 mb-8` |

### Content Model — Per Card (Block)

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Heading** | `text` | Card title — e.g. "Men", "APC", "J.Lindeberg". Required |
| **Image** | `image_picker` | Full-bleed background image. Required |
| **Link** | `url` | Card destination (entire card is clickable) |
| **Button label** | `text` | CTA text — default "SHOP NOW". Leave blank to hide |

### Content Model — Section Settings

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Layout** | `select` | `grid` / `carousel`. Grid uses CSS grid, carousel uses Splide. Default: `grid` |
| **Columns** | `range` | Number of columns — min 2, max 4, step 1, default 2. Grid mode: `md:grid-cols-{n}`. Carousel mode: `perPage` |
| **Aspect ratio** | `select` | `square` (`aspect-square`) / `7:9` (`aspect-[7/9]`) / `3:4` (`aspect-[3/4]`). Default: `square` |
| **Heading tag** | `select` | `h2` / `h3`. Semantic heading level. Default: `h2` |
| **Heading size** | `select` | `large` (`text-3xl lg:text-4xl`) / `small` (`text-xl lg:text-2xl`). Default: `large` |
| **Margin bottom** | `select` | `none` / `small` (`mb-8`) / `medium` (`mb-8 lg:mb-14`) / `large` (`mb-14 lg:mb-20`). Default: `medium` |
| **Enable animation** | `checkbox` | Intersection observer fade-up. Default: true |

### Card Structure (exact source HTML)

```html
<a class="group relative flex flex-col {aspect-ratio-class}"
   href="{{ block.settings.link }}">

  <!-- Text overlay — anchored to bottom via mt-auto -->
  <div data-inview="false"
       class="group-inview group/blocks relative z-2 mt-auto w-full p-8 md:p-10">

    <!-- Heading — fades down into position -->
    <div class="mb-2 text-center text-white md:mb-4
                opacity-0 -translate-y-14 transition-all duration-1000 ease
                group-data-[inview=true]/blocks:opacity-100
                group-data-[inview=true]/blocks:translate-y-0">
      <h2><span class="text-3xl lg:text-4xl">{{ heading }}</span></h2>
    </div>

    <!-- Button — fades up into position, 300ms delay -->
    <div class="flex justify-center delay-300
                opacity-0 translate-y-14 transition-all duration-1000 ease
                group-data-[inview=true]/blocks:opacity-100
                group-data-[inview=true]/blocks:translate-y-0">
      <span class="flex items-center gap-2 text-sm tracking-wider uppercase -mr-2 text-white">
        <span>SHOP NOW</span>
        <!-- chevron-right SVG, size-4 -->
      </span>
    </div>
  </div>

  <!-- Hover overlay — fades in on hover -->
  <div class="absolute left-0 top-0 z-1 size-full
              bg-gradient-to-b from-black/10 to-black/30
              opacity-0 transition-opacity duration-500
              group-hover:opacity-100"></div>

  <!-- Bottom gradient — always visible -->
  <div class="absolute bottom-0 left-0 z-1 h-1/3 w-full
              bg-gradient-to-b from-black/0 to-black/60"></div>

  <!-- Background image -->
  <img class="absolute left-0 top-0 size-full object-cover"
       src="{{ image }}" alt="{{ alt }}" loading="lazy"/>
</a>
```

### Grid Mode Layout

```html
<section class="page-block relative lg:mb-14 mb-8 overflow-hidden">
  <div class="container-wide">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <!-- cards here -->
    </div>
  </div>
</section>
```

### Carousel Mode Layout (3-col instance)

```html
<section class="page-block relative lg:mb-8 mb-8 overflow-hidden">
  <div class="container-wide">
    <div class="splide" data-banner-carousel>
      <div class="splide__track overflow-visible xl:overflow-hidden xl:py-1">
        <ul class="splide__list">
          <li class="splide__slide">
            <div data-measure="true" class="inline-block w-full h-full">
              <!-- card <a> here -->
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

### Carousel Behaviour (Splide)

```
Type:       slide (horizontal scroll, not fade)
Per page:   3 (xl+), 2 (md), 1 (mobile)
Gap:        1.25rem (gap-5)
Pagination: none (hidden on source)
Arrows:     none (hidden on source)
Loop:       false
Drag:       true (swipe on mobile)
```

### Animation

Same intersection observer pattern as hero carousel — per-card `data-inview` attribute:

```
Heading:   opacity-0 -translate-y-14  →  opacity-100 translate-y-0  (1000ms ease)
Button:    opacity-0 translate-y-14   →  opacity-100 translate-y-0  (1000ms ease, delay-300)
Trigger:   card enters viewport (IntersectionObserver)
Mechanism: group-data-[inview=true]/blocks: variant via group/blocks naming
```

Note: heading translates from above (negative Y), button translates from below (positive Y) — they converge to centre.

### Hover Effect

```
Default:   invisible overlay (opacity-0)
Hover:     bg-gradient-to-b from-black/10 to-black/30 fades in (opacity transition, 500ms)
Mechanism: group-hover:opacity-100 on the overlay div (card <a> has `group` class)
```

### Schema Structure

```json
{
  "name": "t:sections.banner_cards.name",
  "tag": "section",
  "class": "banner-cards-section",
  "settings": [
    { "type": "select", "id": "layout", "options": ["grid","carousel"], "default": "grid" },
    { "type": "range", "id": "columns", "min": 2, "max": 4, "step": 1, "default": 2 },
    { "type": "select", "id": "aspect_ratio", "options": ["square","7:9","3:4"], "default": "square" },
    { "type": "select", "id": "heading_tag", "options": ["h2","h3"], "default": "h2" },
    { "type": "select", "id": "heading_size", "options": ["large","small"], "default": "large" },
    { "type": "select", "id": "margin_bottom", "options": ["none","small","medium","large"], "default": "medium" },
    { "type": "checkbox", "id": "enable_animation", "default": true }
  ],
  "blocks": [
    {
      "type": "card",
      "name": "t:sections.banner_cards.blocks.card.name",
      "settings": [
        { "type": "text", "id": "heading" },
        { "type": "image_picker", "id": "image" },
        { "type": "url", "id": "link" },
        { "type": "text", "id": "button_label", "default": "SHOP NOW" }
      ]
    }
  ],
  "presets": [
    {
      "name": "t:sections.banner_cards.presets.name"
    }
  ]
}
```

### JavaScript Requirements

1. **Intersection observer** — set `data-inview="true"` on each card's overlay div when it enters viewport
2. **Splide init (carousel mode only)** — slide mode, responsive `perPage` breakpoints, reuses Splide already loaded by hero-carousel

### Dependencies

- `splide.min.js` + `splide.min.css` in `assets/` (already added for hero-carousel)
- `icon.liquid` snippet (chevron-right for button — already exists)
- Intersection observer (inline in section)

### Decisions

1. **Single section, two modes** — one `banner-cards.liquid` handles both grid and carousel layout via the `layout` setting. Avoids duplicating the card markup in two separate sections
2. **Button style** — source site only uses text link + chevron style for banner cards (no solid/outlined variants). Keeping it simple with just the one style
3. **No subheading** — source banner cards have no subheading field (unlike hero carousel). Only heading + button
4. **Splide reuse** — carousel mode reuses the same Splide JS/CSS already loaded for hero. No additional assets needed
5. **Card is the link** — the entire card `<a>` is the clickable area, not just the button text. Button label is visual only

### Status: BUILT

- `sections/banner-cards.liquid` — section with Liquid, schema, inline JS (grid + carousel modes)
- `snippets/banner-card.liquid` — reusable card snippet with image, overlay, heading, CTA
- Locale strings added to `en.default.json` and `en.default.schema.json`
- Wired into `templates/index.json` as two instances (2-col grid + 3-col carousel)

### Repo Audit — To-Do

> Compared against `_reference/repo/app/components/blocks/bannerCards.tsx`, `carousel.tsx`

**High priority:**

- [x] **Carousel peek/padding** — repo uses `padding: { left: 0, right: '15%' }` at ≤480, `right: '10%'` at ≤768, `right: '15%'` at ≤1280. Shows partial next card. We have no peek effect
- [x] **InView threshold** — use `threshold: 0.3`, `rootMargin: '0px 0px -20%'` (repo defaults) instead of `threshold: 0.15`

---

## 3C — Product Carousel Tabs (`product-carousel-tabs.liquid`)

> Tabbed product carousel with up to 3 tabs. Each tab shows a horizontal Splide carousel of product cards. Used once on the homepage with tabs "Men" / "Women". Empty tabs are hidden automatically.

### Visual Reference

- Section title centred above tabs (serif, large)
- Horizontal tab bar centred below title — active tab has green underline + bold green text
- Each tab panel contains a Splide product carousel (4 per page desktop, peek on smaller screens)
- Navigation arrows positioned above the carousel, right-aligned on `md+`
- Product cards: image (9:12 aspect), vendor, title, colour, price — hover swaps image + reveals colour swatches

### Content Model — Section Settings

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Title** | `text` | Section heading — e.g. "This Seasons Highlights". Leave blank to hide |
| **Tab 1 label** | `text` | Tab button text. Default: "Men" |
| **Tab 1 products** | `product_list` | Up to 25 products for tab 1 |
| **Tab 2 label** | `text` | Tab button text. Default: "Women" |
| **Tab 2 products** | `product_list` | Up to 25 products for tab 2 |
| **Tab 3 label** | `text` | Tab button text. Leave blank to hide tab 3 |
| **Tab 3 products** | `product_list` | Up to 25 products for tab 3 |

No blocks — all configuration via section settings. Tabs with no products assigned are hidden automatically (label alone is not enough — products must be present).

### HTML Structure — Section Wrapper

```html
<section class="page-block relative lg:mb-20 mb-14 overflow-hidden">
  <div class="container-wide">

    <!-- Title -->
    <div class="mb-6 text-center">
      <p><span class="font-serif"><span class="text-4xl lg:text-5xl">{{ section.settings.title }}</span></span></p>
    </div>

    <!-- Tabs -->
    <div>
      <div class="mb-10 flex items-center justify-center" role="tablist" aria-orientation="horizontal">
        <!-- One button per populated tab -->
        <button class="border-b px-6 py-3 focus:outline-none lg:px-10 lg:py-4 lg:text-lg
                       border-clubhouse-green-600 font-bold text-clubhouse-green-600"
                role="tab" aria-selected="true" data-tab-index="0">
          Men
        </button>
        <button class="border-b px-6 py-3 focus:outline-none lg:px-10 lg:py-4 lg:text-lg
                       border-taupe-300"
                role="tab" aria-selected="false" data-tab-index="1">
          Women
        </button>
      </div>

      <!-- Tab panels -->
      <div role="tabpanel" data-tab-panel="0">
        <!-- Splide carousel of product cards here -->
      </div>
      <div role="tabpanel" data-tab-panel="1" hidden>
        <!-- Splide carousel of product cards here -->
      </div>
    </div>

  </div>
</section>
```

### Tab Button Classes (exact from scraped HTML + repo)

| State | Classes |
|-------|---------|
| **Base (all tabs)** | `border-b px-6 py-3 focus:outline-none lg:px-10 lg:py-4 lg:text-lg` |
| **Active** | `border-clubhouse-green-600 font-bold text-clubhouse-green-600` |
| **Inactive** | `border-taupe-300` |

### Carousel Behaviour (Splide)

```
Type:       slide
Per page:   4 (desktop), 3 (≤1280), 2 (≤768), 1 (≤480)
Gap:        10px
Arrows:     true (desktop), false (≤768)
Pagination: none
Loop:       false
Drag:       true
```

#### Responsive Peek (partial next card visible)

```
≤480px:   padding: { left: 0, right: '35%' }, perPage: 1, arrows: false
≤768px:   padding: { left: 0, right: '20%' }, perPage: 2, arrows: false
≤1280px:  padding: { left: 0, right: '10%' }, perPage: 3
Desktop:  perPage: 4, no padding
```

#### Splide Track

```html
<div class="splide__track overflow-visible xl:overflow-hidden xl:py-1">
```

#### Arrow Container + Buttons

Arrows sit **above** the carousel, right-aligned on `md+`:

```html
<div class="splide__arrows flex justify-center pt-6 md:absolute md:right-0 md:top-0 md:-translate-y-full md:pb-3 md:pt-0">
  <button class="splide__arrow splide__arrow--prev bg-taupe-300 p-3 transition-all duration-300 disabled:bg-transparent disabled:opacity-50">
    <!-- chevron-left SVG, size-6 -->
  </button>
  <button class="splide__arrow splide__arrow--next bg-taupe-300 p-3 transition-all duration-300 disabled:bg-transparent disabled:opacity-50">
    <!-- chevron-right SVG, size-6 -->
  </button>
</div>
```

### Product Cards

Uses the existing `snippets/product-card.liquid` snippet — already built. Rendered via `{% render 'product-card', product: product %}` for each product in the active tab's list.

### Animation

Product cards use `animateScaleIn` with staggered delays (per-card index × step):

```
Initial:    scale-95, opacity-0
Animate:    scale-100, opacity-1
Duration:   500ms
Stagger:    each card delayed by index × step (e.g. 100ms)
Trigger:    intersection observer (InView wrapper around carousel)
```

### JavaScript Requirements

1. **Tab switching** — click handler toggles `aria-selected`, swaps active/inactive classes, shows/hides tab panels
2. **Splide init** — one Splide instance per tab panel, initialised on first tab show (lazy) or all on load
3. **Intersection observer** — `InView` wrapper triggers card entrance animations when carousel enters viewport
4. **Image hover** — pure CSS (no JS needed), handled by `group-hover` classes

### Dependencies

- `splide.min.js` + `splide.min.css` in `assets/` (already added for hero-carousel)
- `icon.liquid` snippet (chevron-left, chevron-right for arrows)
- `product-card.liquid` snippet (already exists)

### Decisions

1. **No blocks** — using `product_list` settings (×3) instead of blocks with tab assignment. Cleaner merchant UX, fewer clicks
2. **Three tabs max** — hardcoded limit keeps settings simple. Empty tabs auto-hide
3. **Product card snippet** — reuses existing `snippets/product-card.liquid` (already built)
4. **Tab switching via JS** — not using Headless UI (that's React-only). Simple vanilla JS tab handler with ARIA attributes
5. **Splide reuse** — same Splide JS/CSS already loaded for hero and banner-cards carousels
6. **Colour swatches** — handled by the existing `product-card.liquid` snippet

### Status: BUILT

- `sections/product-carousel-tabs.liquid` — section with Liquid, schema, inline JS (tabs + Splide)
- Reuses existing `snippets/product-card.liquid` for product cards
- Locale strings added to `en.default.schema.json`
- Tailwind CSS rebuilt to include new utility classes

**Note:** Run `npm run dev:css` (Tailwind watch mode) during development to keep `assets/theme.css` up to date as new classes are added.

---

## 3D — Content Block (`content-block.liquid`)

> Rich text content section with optional heading, body text, and CTA button. Used across many pages — homepage, about, delivery, launches, careers, etc. On the homepage it's a single centred serif heading: "The voice of style and fashion in golf".

### Visual Reference

- Narrow container (`container-narrow`, max-width 960px) — NOT full-width
- Text alignment configurable (left / center / right)
- Content fades down into position on scroll (intersection observer)
- Optional CTA button fades up into position (300ms stagger, converging animation)
- Used on many page types with varying spacing, backgrounds, and content

### Content Model — Block Types

Blocks are ordered by the merchant in the customizer. Available block types:

#### `heading` Block

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Text** | `text` | Heading text content. Required |
| **Tag** | `select` | `h1` / `h2` / `h3` / `h4` / `h5` / `h6` / `p`. Semantic HTML tag. Default: `h2` |
| **Size** | `select` | `h1` (`text-5xl lg:text-6xl`) / `h2` (`text-4xl lg:text-5xl`) / `h3` (`text-3xl lg:text-4xl`) / `h4` (`text-xl lg:text-2xl`) / `h5` (`text-lg lg:text-xl`) / `h6` (`text-base lg:text-lg`). Default: `h2` |
| **Font** | `select` | `serif` (Playfair Display) / `sans` (Oxygen). Default: `serif` |

#### `text` Block

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Text** | `richtext` | Body text content — supports bold, italic, links. Required |

#### `button` Block

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Label** | `text` | Button text. Required |
| **Link** | `url` | Button destination |
| **Style** | `select` | `dark-grey` / `white` / `transparent` / `text`. Default: `dark-grey` |
| **Has arrow** | `checkbox` | Show chevron-right icon after label. Default: false |

### Content Model — Section Settings

| Field | Shopify Type | Notes |
|-------|-------------|-------|
| **Alignment** | `select` | `left` (`text-left`) / `center` (`text-center`) / `right` (`text-right`). Default: `center` |
| **Background colour** | `select` | `transparent` (`bg-transparent`) / `white` (`bg-white`) / `light-grey` (`bg-taupe-100`) / `medium-grey` (`bg-taupe-400`) / `dark-grey` (`bg-taupe-900`). Default: `transparent` |
| **Margin top (desktop)** | `select` | `none` / `8` (`lg:mt-8`) / `14` (`lg:mt-14`) / `20` (`lg:mt-20`) / `28` (`lg:mt-28`) / `36` (`lg:mt-36`). Default: `none` |
| **Margin bottom (desktop)** | `select` | `none` / `8` (`lg:mb-8`) / `14` (`lg:mb-14`) / `20` (`lg:mb-20`) / `28` (`lg:mb-28`) / `36` (`lg:mb-36`). Default: `14` |
| **Padding top (desktop)** | `select` | `none` / `8` (`lg:pt-8`) / `14` (`lg:pt-14`) / `20` (`lg:pt-20`) / `28` (`lg:pt-28`). Default: `none` |
| **Padding bottom (desktop)** | `select` | `none` / `8` (`lg:pb-8`) / `14` (`lg:pb-14`) / `20` (`lg:pb-20`) / `28` (`lg:pb-28`). Default: `none` |
| **Margin top (mobile)** | `select` | `none` / `8` (`mt-8`) / `14` (`mt-14`) / `20` (`mt-20`) / `28` (`mt-28`). Default: `none` |
| **Margin bottom (mobile)** | `select` | `none` / `8` (`mb-8`) / `14` (`mb-14`) / `20` (`mb-20`) / `28` (`mb-28`). Default: `8` |
| **Padding top (mobile)** | `select` | `none` / `8` (`pt-8`) / `14` (`pt-14`) / `20` (`pt-20`) / `28` (`pt-28`). Default: `none` |
| **Padding bottom (mobile)** | `select` | `none` / `8` (`pb-8`) / `14` (`pb-14`) / `20` (`pb-20`) / `28` (`pb-28`). Default: `none` |
| **Enable animation** | `checkbox` | Intersection observer entrance animation. Default: true |

### Heading Size Map (exact from repo)

| Size | Classes |
|------|---------|
| `h1` | `text-5xl lg:text-6xl` |
| `h2` | `text-4xl lg:text-5xl` |
| `h3` | `text-3xl lg:text-4xl` |
| `h4` | `text-xl lg:text-2xl` |
| `h5` | `text-lg lg:text-xl` |
| `h6` | `text-base lg:text-lg` |

### Button Styles (exact from repo `buttonClasses`)

All buttons share base classes:
```
flex items-center gap-2 text-center text-sm tracking-wider transition-all
disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
uppercase justify-center px-4 py-3 lg:px-10 min-w-40
```

| Style | Additional Classes |
|-------|-------------------|
| `dark-grey` | `bg-taupe-900 text-white enabled:hover:bg-taupe-600` |
| `white` | `bg-white text-taupe-900 enabled:hover:bg-neutral-100` |
| `transparent` | `bg-transparent transition-colors enabled:hover:bg-transparent enabled:hover:text-clubhouse-green-600` |
| `text` | No min-width, no padding — just the base text styles + `text-white` when on dark bg |

Arrow icon: `<ChevronRightIcon class="size-4" />` appended after `<span>` label text.

### HTML Structure (exact from scraped HTML)

```html
<section class="page-block relative page-block--content {spacing-classes} {bg-class}">
  <div data-inview="false" class="group-inview group/blocks">
    <div class="container-narrow {alignment-class}">

      <!-- Heading + Text blocks — animate down (converge) -->
      <div class="opacity-0 -translate-y-14 transition-all duration-1000 ease animation-group
                  group-data-[inview=true]/blocks:opacity-100
                  group-data-[inview=true]/blocks:translate-y-0">

        <!-- heading block example -->
        <h2><span class="font-serif"><span class="text-4xl lg:text-5xl">Heading text</span></span></h2>

        <!-- text block example -->
        <p>Body text content here...</p>
      </div>

      <!-- Button block — animate up (converge) — separate div -->
      <div class="flex opacity-0 translate-y-14 transition-all duration-1000 ease animation-group
                  group-data-[inview=true]/blocks:opacity-100
                  group-data-[inview=true]/blocks:translate-y-0
                  {justify-class}">
        <a class="flex items-center gap-2 text-center text-sm tracking-wider transition-all
                  disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
                  uppercase justify-center px-4 py-3 lg:px-10 min-w-40
                  bg-taupe-900 text-white enabled:hover:bg-taupe-600
                  flex items-center gap-2 "
           href="/contact">
          <span>CONTACT US</span>
          <!-- optional chevron-right SVG, size-4 -->
        </a>
      </div>

    </div>
  </div>
</section>
```

### Animation Classes (exact from repo `utils/classes.ts`)

Content (heading + text) — `animateTranslateToBottom` (fades down into position):
```
opacity-0 -translate-y-14 transition-all duration-1000 ease animation-group
group-data-[inview=true]/blocks:opacity-100
group-data-[inview=true]/blocks:translate-y-0
```

Button — `animateTranslateToTop` (fades up into position):
```
opacity-0 translate-y-14 transition-all duration-1000 ease animation-group
group-data-[inview=true]/blocks:opacity-100
group-data-[inview=true]/blocks:translate-y-0
```

### Button Alignment (mirrors section text alignment)

| Alignment | Button Container Class |
|-----------|----------------------|
| `left` | `justify-start` |
| `center` | `justify-center` |
| `right` | `justify-end` |

### InView / Intersection Observer (exact from repo)

```
Defaults:    once: true, threshold: 0.3, rootMargin: '0px 0px -20%'
Wrapper:     <div data-inview="false" class="group-inview group/blocks">
Trigger:     sets data-inview="true" when element enters viewport
Animation:   CSS transitions via group-data-[inview=true]/blocks: variants
```

### Animation Disable (exact from repo)

When `enable_animation` is false, add these override classes to the `<section>`:
```
[&_.group-inview_.animation-group]:!translate-x-0
[&_.group-inview_.animation-group]:!translate-y-0
[&_.group-inview_.animation-group]:!scale-100
[&_.group-inview_.animation-group]:!opacity-100
[&_.group-inview_.animation-group]:!transition-none
[&_.group-inview_.animation-group]:!duration-0
```

### Rich Text Inline Styles (from repo `editor.tsx`)

Links in rich text: `text-clubhouse-green-600 underline`
Bold: `font-bold` (via `<span class="font-bold">`)
Lists: `mb-6 ml-5 list-disc` (bullets) / `mb-6 ml-5 list-decimal` (numbered)

### Homepage Instance

```
Spacing:     lg:mb-14 mb-8
Background:  bg-transparent
Alignment:   text-center
Animation:   enabled
Content:     Single heading — "The voice of style and fashion in golf"
             Tag: p, Size: h2 (text-4xl lg:text-5xl), Font: serif
```

### Other Common Instances

| Page | Spacing | BG | Alignment | Content |
|------|---------|----|-----------|---------|
| Homepage | `lg:mb-14 mb-8` | transparent | center | Heading only (serif, h2 size) |
| About Us | `lg:mb-28 mb-20` | transparent | center | h2 heading + multiple `<p>` paragraphs |
| Delivery | `lg:pt-14 mb-8 pt-8` | transparent | left | h1 heading + rich text with links |
| Delivery (CTA) | `lg:mb-14 lg:pt-14 mb-8` | transparent | center | h2 heading + dark-grey button with arrow |
| Launch page | `lg:pt-14 lg:pb-20 pt-8 pb-8` | white | center | Mixed content + dark-grey button |
| Careers | `lg:mb-28 mb-20` | transparent | center / left | h2 heading + paragraphs |

### JavaScript Requirements

1. **Intersection observer** — set `data-inview="true"` on the wrapper div when it enters viewport (`threshold: 0.3`, `rootMargin: '0px 0px -20%'`, `once: true`)

### Dependencies

- `icon.liquid` snippet (chevron-right for button arrow — already exists)
- Intersection observer (inline in section)
- `container-narrow` utility class (already in Tailwind config)

### Decisions

1. **Blocks not fields** — heading, text, and button are separate block types so the merchant can reorder, add multiples, or omit any. This matches the Sanity CMS flexibility where content is a PortableText array
2. **Heading block wraps in nested spans** — matches the scraped HTML exactly: `<h2><span class="font-serif"><span class="text-4xl lg:text-5xl">...</span></span></h2>`
3. **All content blocks share one animation div** — heading and text blocks render inside the `animateTranslateToBottom` div, button blocks render in a separate `animateTranslateToTop` div. This matches the repo where `<Editor>` and `<SanityButton>` are in separate animation wrappers
4. **Spacing is granular** — separate desktop/mobile margin/padding selects (not presets) to match the repo's per-block CMS spacing options exactly
5. **Background colour options** — match the repo's `backgroundColourClass` utility exactly

### Status: BUILT

- `sections/content-block.liquid` — section with Liquid, schema, inline JS
- Locale strings added to `en.default.schema.json`
- Tailwind CSS rebuilt to include new utility classes
- Wired into `templates/index.json` as homepage instance (matching source: serif heading, center-aligned, `lg:mb-14 mb-8`, transparent bg)

---

---

## 7. Social Grid

An image grid showcasing social/lifestyle photography, with an optional heading area displaying the brand handle, subtitle, and social channel icon links. Grid items can optionally link to social posts with a hover overlay.

### Source analysis

**React component:** `app/components/partials/global/socialGrid.tsx`
**Compiled JS:** `socialGrid-BFYOzUV3.js`
**Data source:** Manual CMS entries (no API integration)

### Key decisions

1. **All Tailwind** — no custom CSS needed, all utilities already in the build (`z-1`, `container-wide`, `size-full`, `aspect-square`, `bg-black/50`, `duration-500`)
2. **Heading area** — h2 with serif font at `text-3xl lg:text-4xl`, subtitle as `<p>`, social icons as inline SVGs (Instagram, Facebook, X)
3. **Grid** — `container-wide px-0`, responsive columns: `grid-cols-2` / `md:grid-cols-3` / `lg:grid-cols-4` / `xl:grid-cols-6`
4. **Visibility** — items 7–12 are `hidden lg:block`
5. **Hover overlay** — only on items with a link: `bg-black/50` with white social icon, fades in via `opacity-0 duration-500 group-hover:opacity-100`
6. **Icons** — two colour variants: `#35342F` (header) and `#FFFFFF` (grid overlay), inline SVGs in Liquid
7. **Max 12 blocks** — matches the source site's 12-item grid

### Status: BUILT

- `sections/social-grid.liquid` — section with Liquid, schema, inline SVG icons
- Locale strings added to `en.default.schema.json`
- No custom CSS required — all Tailwind utilities

---

*Sections still to spec: logo-marquee, magazine-articles*
