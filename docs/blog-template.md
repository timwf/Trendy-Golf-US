# Blog Listing Template — Spec Doc

## References

| Source | File |
|--------|------|
| Scraped HTML — listing | `_reference/scraped/html/magazine.html` |
| Scraped data — listing | `_reference/scraped/data/stream/magazine-route-routes-$.json` |
| Repo — listing block | `_reference/repo/app/components/blocks/magazineLister.tsx` |
| Repo — category filters | `_reference/repo/app/components/partials/common/filterTabHeaders.tsx` |
| Repo — article card | `_reference/repo/app/components/partials/post/item.tsx` |
| Repo — data hooks | `_reference/repo/app/hooks/useMagazines.ts` |

### Already Built

| File | Status |
|------|--------|
| `sections/magazine-articles.liquid` | Complete — Splide carousel of article cards (used on homepage / other pages) |
| `snippets/magazine-card.liquid` | Complete — individual article card (image, category tag, title, read more) |

---

## Files to Create

| File | Purpose |
|------|---------|
| `templates/blog.json` | Blog listing JSON template |
| `sections/blog-template.liquid` | Blog listing section — hero, category filters, article grid, load more |

---

## Overview

The magazine/blog listing displays a hero header area with title + description, optional category filter tabs, an article grid, and "Load more" pagination.

### Source HTML Structure — Page Hero

```html
<section class="page-block relative page-block--magazineLister lg:mb-14 lg:pt-14 mb-8 pt-8 bg-transparent">
  <div class="container-wide">
    <div class="mb-10 grid grid-cols-1 lg:grid-cols-6">
      <div class="lg:col-span-4">
        <h1>
          <span class="font-serif">
            <span class="text-4xl lg:text-5xl">Inside The Magazine</span>
          </span>
        </h1>
      </div>
      <div class="lg:col-span-2">
        <p>Keep in the know with the latest product releases, brand collections
        and news from the sporting fashion world...</p>
      </div>
    </div>
  </div>
</section>
```

### Source HTML Structure — Category Filter Tabs

From repo `magazineLister.tsx` (wrapper) + `filterTabHeaders.tsx` (inner):

```html
<!-- magazineLister.tsx wraps FilterTabHeaders in container-wide overflow-hidden -->
<div class="container-wide overflow-hidden">
  <div class="mb-6 overflow-x-auto pb-2">
    <div class="mx-auto inline-flex flex-nowrap justify-center md:mb-10 md:flex xl:w-3/4">
      <!-- "All" tab -->
      <div>
        <a class="whitespace-nowrap border-b px-6 py-3 focus:outline-none lg:px-10 lg:py-4 lg:text-lg
                  border-clubhouse-green-600 text-clubhouse-green-600"
           href="/blogs/magazine">
          All
        </a>
      </div>
      <!-- Category tabs -->
      <div>
        <a class="whitespace-nowrap border-b px-6 py-3 focus:outline-none lg:px-10 lg:py-4 lg:text-lg
                  border-taupe-400 text-taupe-700"
           href="/blogs/magazine/tagged/category-name">
          Category Name
        </a>
      </div>
    </div>
  </div>
</div>
```

**Note:** The source wraps filters in `container-wide overflow-hidden`. The `overflow-hidden` clips the outer container while the inner `overflow-x-auto` enables horizontal scroll within the filter row itself. In our Liquid build, tabs are `<a>` links (not `<button>`) since filtering is URL-based.

**Active state:** `border-clubhouse-green-600 text-clubhouse-green-600`
**Inactive state:** `border-taupe-400 text-taupe-700`

### Source HTML Structure — Article Grid

From repo `magazineLister.tsx`:

```html
<div class="container-wide">
  <div id="magazinesMap" class="5xl:grid-cols-4 mb-14 grid grid-cols-1 gap-5 md:grid-cols-3">
    <!-- 1st column item (no delay) — forloop.index0 % 3 == 0 -->
    <div data-inview="false" class="group-inview group/blocks mb-5">
      <div class="opacity-0 scale-75 transition-all duration-1000 animation-group
                  group-data-[inview=true]/blocks:opacity-100
                  group-data-[inview=true]/blocks:scale-100">
        <!-- magazine-card snippet -->
      </div>
    </div>
    <!-- 2nd column item (100ms delay) — forloop.index0 % 3 == 1 -->
    <div data-inview="false" class="group-inview group/blocks mb-5">
      <div class="opacity-0 scale-75 transition-all duration-1000 animation-group
                  group-data-[inview=true]/blocks:opacity-100
                  group-data-[inview=true]/blocks:scale-100
                  md:delay-100">
        <!-- magazine-card snippet -->
      </div>
    </div>
    <!-- 3rd column item (200ms delay) — forloop.index0 % 3 == 2 -->
    <div data-inview="false" class="group-inview group/blocks mb-5">
      <div class="opacity-0 scale-75 transition-all duration-1000 animation-group
                  group-data-[inview=true]/blocks:opacity-100
                  group-data-[inview=true]/blocks:scale-100
                  md:delay-200">
        <!-- magazine-card snippet -->
      </div>
    </div>
  </div>
</div>
```

**Stagger pattern:** The listing grid uses Tailwind delay utility classes (not inline styles). Each grid item is wrapped in its own InView group (`data-inview="false"` + `group-inview group/blocks`). Column position determines the delay class using `forloop.index0 % 3`: 0 = no delay, 1 = `md:delay-100` (100ms), 2 = `md:delay-200` (200ms).

### Source HTML Structure — Load More + Count

```html
<div class="text-center">
  <div class="mb-4 flex justify-center">
    <button class="flex items-center gap-2 text-center text-sm tracking-wider transition-all
                   uppercase justify-center px-4 py-3 lg:px-10 min-w-40
                   bg-taupe-900 text-white enabled:hover:bg-taupe-600
                   disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50">
      Load more
    </button>
  </div>
  <p class="text-xs text-neutral-500">
    Showing <span>9</span> of <span>24</span> entries
  </p>
</div>
```

### Key Tailwind Classes

| Element | Classes |
|---------|---------|
| Section wrapper | `page-block relative page-block--magazineLister lg:mb-14 lg:pt-14 mb-8 pt-8 bg-transparent` |
| Hero container | `container-wide` |
| Hero grid | `mb-10 grid grid-cols-1 lg:grid-cols-6` |
| Title column | `lg:col-span-4` |
| Description column | `lg:col-span-2` |
| Title h1 outer span | `font-serif` |
| Title h1 inner span | `text-4xl lg:text-5xl` |
| Filter container | `container-wide overflow-hidden` |
| Filter wrapper | `mb-6 overflow-x-auto pb-2` |
| Filter inner | `mx-auto inline-flex flex-nowrap justify-center md:mb-10 md:flex xl:w-3/4` |
| Filter button (base) | `whitespace-nowrap border-b px-6 py-3 focus:outline-none lg:px-10 lg:py-4 lg:text-lg` |
| Filter active | `border-clubhouse-green-600 text-clubhouse-green-600` |
| Filter inactive | `border-taupe-400 text-taupe-700` |
| Article grid | `mb-14 grid grid-cols-1 gap-5 md:grid-cols-3` (+ `5xl:grid-cols-4`) |
| Grid item InView wrapper | `group-inview group/blocks mb-5` + `data-inview="false"` attribute |
| Grid item animation | `opacity-0 scale-75 transition-all duration-1000 animation-group group-data-[inview=true]/blocks:opacity-100 group-data-[inview=true]/blocks:scale-100` |
| Grid item stagger (2nd col) | `md:delay-100` |
| Grid item stagger (3rd col) | `md:delay-200` |
| Load more button | `flex items-center gap-2 text-center text-sm tracking-wider transition-all uppercase justify-center px-4 py-3 lg:px-10 min-w-40 bg-taupe-900 text-white enabled:hover:bg-taupe-600 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50` |
| Count text | `text-xs text-neutral-500` |

---

## Shopify Mapping

The source site uses Sanity CMS with categories as taxonomy terms. In Shopify:

- **Blog** = Shopify `blog` object
- **Articles** = Shopify `article` objects within a blog
- **Categories** = Shopify article `tags` (no dedicated taxonomy). Filter by tag via URL parameter.
- **Pagination** = Shopify `paginate` tag with "Load more" via AJAX (Section Rendering API)
- **Article count** = `paginate.items` (respects tag filtering, unlike `blog.articles_count` which always returns the unfiltered total)

### Category Filtering — Approach

Shopify blogs can be filtered by tag using the URL pattern `/blogs/{handle}/tagged/{tag}`. We'll use this native Shopify mechanism:

1. Render tag filter tabs by looping `blog.all_tags | sort_natural` — must use `all_tags` (not `blog.tags`, which only returns tags from the current filtered view). Apply `| sort` since Shopify doesn't guarantee alphabetical ordering.
2. Each tab links to `{{ blog.url }}/tagged/{{ tag | handleize }}`
3. "All" links to `{{ blog.url }}`
4. Active tab detection: `{% if current_tags contains tag %}` for tag tabs, `{% if current_tags == blank %}` for "All"
5. Use Section Rendering API to load filtered results without full page reload (progressive enhancement — works without JS too)

### Pagination — Approach

Use Shopify's `{% paginate %}` tag with the Section Rendering API for "Load more":

1. Initial page renders first N articles (configurable, default 9)
2. "Load more" button fetches next page via `?section_id={{ section.id }}&page=2` (returns HTML directly). **Note:** Section IDs in JSON templates are dynamic (e.g. `template--12345__blog-template`), so the Liquid template must pass `{{ section.id }}` to JS via a data attribute.
3. Append new article cards to the grid
4. Update "Showing X of Y entries" count — use `paginate.items` for the total (respects tag filtering)
5. Hide button when all articles loaded

---

## Section Schema

```json
{
  "name": "Blog listing",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Inside The Magazine"
    },
    {
      "type": "richtext",
      "id": "description",
      "label": "Description",
      "default": "<p>Keep in the know with the latest product releases, brand collections and news from the sporting fashion world. Featuring regular updates on upcoming trends, and where to look for that new sporting style, our magazine will keep you one step ahead of the game.</p>"
    },
    {
      "type": "range",
      "id": "articles_per_page",
      "label": "Articles per page",
      "min": 3,
      "max": 24,
      "step": 3,
      "default": 9
    },
    {
      "type": "checkbox",
      "id": "show_tags",
      "label": "Show category filter tabs",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_category",
      "label": "Show category on cards",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "enable_animation",
      "label": "Enable animation",
      "default": true
    }
  ]
}
```

No `presets` key — this is a template-only section (used only in `blog.json`). Omitting `presets` entirely prevents it appearing in the "Add section" picker.

---

## JSON Template — `templates/blog.json`

```json
{
  "sections": {
    "blog-template": {
      "type": "blog-template",
      "settings": {
        "heading": "Inside The Magazine",
        "description": "<p>Keep in the know with the latest product releases, brand collections and news from the sporting fashion world. Featuring regular updates on upcoming trends, and where to look for that new sporting style, our magazine will keep you one step ahead of the game.<\/p>",
        "articles_per_page": 9,
        "show_tags": true,
        "show_category": true,
        "enable_animation": true
      }
    }
  },
  "order": ["blog-template"]
}
```

---

## JS Architecture

Inline `<script>` at bottom of `blog-template.liquid`:

**Key implementation notes:**
- The section wrapper must include `data-section-id="{{ section.id }}"` so JS can build the correct Section Rendering API URL. Section IDs in JSON templates are dynamic (e.g. `template--12345__blog-template`).
- All fetch URLs must use `window.location.pathname` as the base (not hardcoded paths) — this ensures locale-aware URLs work correctly and tag filters are preserved during pagination.
- Tag filter tabs use manually-built `<a href="{{ blog.url }}/tagged/{{ tag | handleize }}">` rather than the `link_to_tag` filter, because `link_to_tag` generates a full `<a>` tag and we need custom Tailwind classes on our markup.

1. **Category filter tabs** — each tab is an `<a>` to `/blogs/{handle}/tagged/{tag}`. Progressive enhancement: intercept clicks, fetch via Section Rendering API (`?section_id={section.id}`), swap grid content without full reload.

2. **Load more pagination** — button fetches next page via `{window.location.pathname}?section_id={sectionId}&page=N`, extracts article cards from response HTML, appends to grid, updates count text, hides button when done. **Animation for appended cards:** Each appended card already has its own `data-inview="false"` wrapper, so the existing IntersectionObserver will pick them up automatically when they enter the viewport — no special handling needed as long as the observer is re-applied to new `[data-inview]` elements after append.

3. **InView animation** — IntersectionObserver on `[data-inview]` groups, flips to `data-inview="true"` to trigger CSS animations. Observer options: `{ rootMargin: '0px 0px 0px', threshold: 0 }` (triggers as soon as the element enters the viewport). **Note:** This differs from `magazine-articles.liquid` which uses `{ threshold: 0.3, rootMargin: '0px 0px -20%' }`. **Important:** After appending "Load more" cards, re-observe the new `[data-inview]` elements so they animate on scroll.

4. **Stagger delays** — each grid item gets a Tailwind delay class based on column position: no class (0ms) on 1st column, `md:delay-100` (100ms) on 2nd column, `md:delay-200` (200ms) on 3rd column. Pattern repeats every 3 items using `forloop.index0 % 3`. **Note:** This uses Tailwind utility classes, not inline styles — unlike the `magazine-articles.liquid` carousel which uses inline `style="transition-delay: calc(...)"` with 90ms increments.

### Empty States

- **No articles in blog** — show `<p class="pt-8 text-center text-2xl">No posts found</p>` (matches source repo `magazineLister.tsx`).
- **Tag filter returns no results** — same empty state message. Filter tabs remain visible (use `blog.all_tags` not `blog.tags`) so the user can switch tags.
- **All articles fit on one page** — hide the "Load more" button entirely. Use `{% if paginate.next %}` to conditionally render it on initial load.

---

## Accessibility

- **Filter tabs** — active tab gets `aria-current="true"`. All tabs are `<a>` links so keyboard-navigable by default.
- **Load more button** — add `aria-label="Load more articles"`. While fetching, `disable` the button to prevent double-clicks (Tailwind disabled states handle the visual feedback).
- **Grid container** — set `aria-busy="true"` on the article grid container while fetching new cards, remove when done.
- **Count text** — wrap "Showing X of Y entries" in an `aria-live="polite"` region so screen readers announce updates after load more.

---

## Deferred Items

- **Scroll restoration** — source has a full implementation: `data-slug` attributes on grid items, `onClick` handlers saving article slug to `sessionStorage`, `useScrollToSlug` hook that restores scroll position on return, and a `fixed inset-0 z-50 bg-white/80` overlay while restoring. Defer to polish phase.
- **Multi-tag filtering** — Shopify supports `/tagged/tag1+tag2` URLs for blogs. Our filter tabs are single-select (clicking a tag replaces the filter, not adds to it). If a user arrives at a multi-tag URL, multiple tabs will highlight as active — this is acceptable behaviour, no action needed.

---

## Build Checklist

Phase 0:
- [x] Scraped HTML audited
- [x] Repo source audited
- [x] Spec doc created
- [x] Section settings identified
- [x] Deferred items documented

Phase 1 — Build:
- [x] Markup & classes built
- [x] JS wired up
- [x] Section schema added

Phase 2 — Audit:
- [x] Audit round 1 — styling
- [x] Audit round 1 — functionality
- [x] Fixes applied (R1: paginate.items, dynamic section ID, empty states, richtext default, remove presets, locale-aware URLs, link_to_tag note)
- [x] Audit round 2 — styling
- [x] Audit round 2 — functionality
- [x] Fixes applied (R2: schema JSON fix, empty state text, paginate.next guard, all_tags sort, accessibility, blog.all_tags vs blog.tags)
- [x] Audit round 3 (R3: JSON template description, stagger delays 100ms/200ms not 90ms/180ms, Tailwind classes not inline styles for grid animation)
- [x] Audit round 4 (R4: InView wrapper on grid items, button classes, stagger formula forloop.index0, load-more animation re-observe, multi-tag note)
- [x] Audit round 5 (R5: sort_natural not sort, aria-busy on grid not button, container-wide overflow-hidden on filter tabs, tabs as `<a>` not `<button>` in HTML example)
- [x] Audit round 6 (R6: InView rootMargin documented — `0px 0px 0px` for grid items vs `0px 0px -20%` for carousel)

Phase 3 — Handover:
- [x] validate_theme passed
- [x] Post-build audit — styling (grid class order fix, delay class scoping fix)
- [x] Post-build audit — functionality (no issues)
- [ ] Visual comparison done
- [ ] Functional testing done
- [ ] Build notes written
