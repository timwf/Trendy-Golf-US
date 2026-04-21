# Collection Page (Phase 2B)

> Detailed audit, plan, and build notes for collection template, filter sidebar, and pagination.

**Reference:** `_reference/scraped/html/collection-mens-apparel.html`, `_reference/scraped/assets/js/filtersOffcanvas-YN9Z-5GC.js`, `_reference/scraped/assets/js/collections-CZuVGFWH.js`
**Shopify MCP:** `search_docs_chunks` for collection.filters, collection.products, paginate tag, `learn_shopify_api` for Storefront API filtering, `validate_theme` on collection-template.liquid + filter-sidebar.liquid

---

## Files created

| File | Purpose |
|------|---------|
| `templates/collection.json` | JSON template pointing to `collection-template` section |
| `sections/collection-template.liquid` | Main collection layout — title, description, quick-links, controls bar, product grid, pagination |
| `snippets/filter-sidebar.liquid` | Offcanvas filter panel using Shopify native `collection.filters` |

---

## Source HTML structure (from `collection-mens-apparel.html`)

**Main container:** `<main class="py-10"><div class="container-wide">`

**Header area** (12-unit grid on large screens):
```
mb-10 grid grid-cols-1 lg:grid-cols-6
├── lg:col-span-4: Title (h1 font-serif text-4xl lg:text-5xl)
└── lg:col-span-2: Description HTML
```

**Quick-links bar** (subcategory pills):
```
mb-10 overflow-hidden
└── flex flex-nowrap gap-2 overflow-x-auto pb-3 (mobile: horizontal scroll)
    md:flex-wrap md:gap-4 md:pb-0 (desktop: wraps)
    └── Link: inline-block whitespace-nowrap bg-taupe-300 px-5 py-3
            text-sm md:text-base tracking-wider hover:bg-taupe-400 transition-all
    └── Active: ring-2 ring-inset ring-clubhouse-green-600
```
- **Data source:** `collection.metafields.custom.collections_links` (type: `list.collection_reference`)
- Returns actual collection objects — loop directly for `.title` and `.url`
- Active state: compare each linked collection's handle to `collection.handle`

**Controls bar** (filter + sort):
```
mb-6 flex justify-between
├── LEFT: Filter button ("Show filters")
│   └── group flex cursor-pointer gap-3
│       └── Icon: bg-taupe-300 p-3
├── RIGHT: Sort dropdown
│   └── <select id="sort-by"> w-32 appearance-none bg-transparent p-3
│       └── Options from collection.sort_options
```

**Product grid:**
```html
<div id="collection-product-grid" class="mb-6 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
```

---

## Colour grouping logic (product deduplication)

Products sharing the same `custom.product_display_name` metafield are treated as one card with colour swatches. The collection template handles deduplication:

```liquid
{%- assign seen_display_names = '' -%}
{% for product in collection.products %}
  {%- assign display_name = product.metafields.custom.product_display_name | default: product.title -%}
  {%- if seen_display_names contains display_name -%}
    {%- continue -%}
  {%- endif -%}
  {%- assign seen_display_names = seen_display_names | append: '|||' | append: display_name -%}

  {%- comment -%} Build swatch data for all siblings {%- endcomment -%}
  {%- assign swatch_data = '' -%}
  {% for sibling in collection.products %}
    {%- assign sibling_name = sibling.metafields.custom.product_display_name | default: sibling.title -%}
    {%- if sibling_name == display_name -%}
      {%- assign swatch_hex = sibling.metafields.custom.swatch_colour -%}
      {%- assign swatch_hex_2 = sibling.metafields.custom.swatch_colour_secondary -%}
      {%- assign swatch_label = sibling.metafields.custom.color -%}
      {%- assign is_active = false -%}
      {%- if sibling.id == product.id -%}{%- assign is_active = true -%}{%- endif -%}
      {%- capture swatch_entry -%}{{ sibling.url }}|{{ swatch_hex }}|{{ swatch_hex_2 }}|{{ swatch_label }}|{{ is_active }}{%- endcapture -%}
      {%- if swatch_data != '' -%}{%- assign swatch_data = swatch_data | append: ',' | append: swatch_entry -%}
      {%- else -%}{%- assign swatch_data = swatch_entry -%}{%- endif -%}
    {%- endif -%}
  {% endfor %}

  {% render 'product-card', product: product, swatches: swatch_data %}
{% endfor %}
```

**Important caveat:** This O(n²) approach works within a single `paginate` page (24 products). If a colour group spans page boundaries, some swatches may be missing. This is acceptable for v1 — the source site had the same limitation with its per-page API responses.

---

## Filter sidebar implementation

Uses Shopify native `collection.filters` with a `<form>` approach:

```liquid
<form id="CollectionFiltersForm" action="{{ collection.url }}">
  {%- for filter in collection.filters -%}
    <details open>
      <summary>{{ filter.label }}
        {%- if filter.active_values.size > 0 -%}
          <span>({{ filter.active_values.size }})</span>
        {%- endif -%}
      </summary>

      {%- case filter.type -%}
        {%- when 'list' -%}
          <div class="grid grid-cols-2 gap-3">
            {%- for value in filter.values -%}
              <label>
                <input type="checkbox"
                  name="{{ value.param_name }}"
                  value="{{ value.value }}"
                  {% if value.active %}checked{% endif %}
                >
                {{ value.label }} ({{ value.count }})
              </label>
            {%- endfor -%}
          </div>

        {%- when 'price_range' -%}
          <div class="grid grid-cols-2 gap-2">
            <input type="number" name="{{ filter.min_value.param_name }}"
              placeholder="Min" value="{{ filter.min_value.value }}" min="0">
            <input type="number" name="{{ filter.max_value.param_name }}"
              placeholder="Max" value="{{ filter.max_value.value }}">
          </div>

        {%- when 'boolean' -%}
          <label>
            <input type="checkbox"
              name="{{ filter.param_name }}"
              value="{{ filter.true_value.value }}"
              {% if filter.true_value.active %}checked{% endif %}
            >
            {{ filter.true_value.label }}
          </label>
      {%- endcase -%}
    </details>
  {%- endfor -%}
</form>
```

**Filter types expected on this store:**

| Filter ID | Type | Label | Grid |
|-----------|------|-------|------|
| `filter.p.vendor` | LIST | Brand | 2 col |
| `filter.p.m.custom.color` | LIST | Colour | 2 col (with swatch dots) |
| `filter.p.product_type` | LIST | Product type | 2 col |
| `filter.v.option.size` | LIST | Size | **3 col** |
| `filter.v.price` | PRICE_RANGE | Price | Min/max inputs |
| `filter.p.availability` | LIST | Availability | 2 col |

**Special rendering for colour filters:** When `filter.param_name` contains `color` or `colour`, render a coloured dot alongside the label.

**Active filter pills:** Above the accordion, render pills for each `filter.active_values` entry with a remove link (`value.url_to_remove`).

**Bottom action buttons** (fixed to bottom of offcanvas):
```
fixed bottom-0 left-0 grid w-full grid-cols-2 gap-4 bg-taupe-300 p-4
├── "View products" button (closes offcanvas)
└── "Clear all" link → collection.url (resets all filters)
```

---

## AJAX Section Rendering (no page reloads)

All filtering, sorting, pagination, and pill removal use **Shopify's Section Rendering API** (`?sections=SECTION_ID`) instead of full page reloads. This returns JSON containing only the section HTML — much lighter than fetching the entire page.

**Data attributes on `<main>`:** `id="collection-section"`, `data-section-id="{{ section.id }}"`, `data-collection-url="{{ collection.url }}"` — expose section context to JS (Liquid can't render inside `{% javascript %}` tags).

**Core function — `fetchSection(url)`:**
1. Appends `&sections=SECTION_ID` to the target URL
2. Fetches via `fetch()`, parses JSON response
3. Uses `DOMParser` to extract new HTML for: `#collection-product-grid`, `#load-more-container`, `[data-filter-sidebar]` inner content, `[data-filter-actions]`, `[data-collection-empty]`
4. Replaces those elements in the live DOM
5. Calls `history.pushState()` to update the URL
6. Scrolls to top of section

**Event delegation:** All click/change/submit handlers use `document.addEventListener` with selector matching (e.g. `e.target.closest('[data-filter-pill]')`). This survives DOM replacement — no rebinding needed after AJAX swaps.

**Interactions that trigger `fetchSection()`:**
- Filter checkbox change (`[data-filter-checkbox]`)
- Active filter pill remove click (`[data-filter-pill]` — `<a>` tags with `href` to `value.url_to_remove`)
- Clear all button (`[data-filter-clear-btn]`)
- Price range form submit (intercepts `#CollectionFiltersForm` submit event)
- Sort dropdown change (`[data-collection-sort]`)

**Filter URL construction — `getFilterUrl()`:**
- Serializes `#CollectionFiltersForm` via `new FormData()` → `URLSearchParams`
- Preserves `sort_by` from current URL
- Strips empty params

**Sidebar stays open during filtering:** Only the sidebar's inner HTML is replaced (`curSidebar.innerHTML = newSidebar.innerHTML`). The outer `[data-filter-sidebar]` element and its `data-filter-open` attribute are preserved, so the offcanvas doesn't close/re-animate.

**Browser back/forward:** `popstate` listener calls `fetchSection(window.location.href)` to re-render the correct state.

---

## Sort dropdown

Uses `collection.sort_options` for sort values, `collection.sort_by` for current selection. JS builds URL with `sort_by` param and calls `fetchSection()` — no page reload.

---

## Pagination — "Load more" with JS-enhanced append

Uses `{% paginate collection.products by 24 %}` wrapping the product loop.

**JS behaviour (also uses Section Rendering API):**
1. Click "Load more" → fetch `data-next-url` + `&sections=SECTION_ID`
2. Parse JSON response, extract `#collection-product-grid` children from section HTML
3. **Append** (not replace) those product cards to the existing grid
4. Extract the new `data-next-url` from the response's load-more button
5. If no next URL in the response, remove the button (no more pages)
6. `<noscript>` fallback via `default_pagination`
7. Button has `data-label` attribute for translated text restoration after loading state

---

## Section schema

Settings: `products_per_page` (range 12–48, default 24), `enable_filtering` (checkbox), `enable_sorting` (checkbox).

Quick links driven by `collection.metafields.custom.collections_links` — no section setting needed.

---

## Key Tailwind classes

| Element | Classes |
|---------|---------|
| Page wrapper | `py-10` inside `container-wide` |
| Title | `font-serif text-4xl lg:text-5xl` |
| Quick-link pill | `inline-block whitespace-nowrap bg-taupe-300 px-5 py-3 text-sm md:text-base tracking-wider hover:bg-taupe-400 transition-all` |
| Quick-link active | `ring-2 ring-inset ring-clubhouse-green-600` |
| Product grid | `grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4` |
| Filter offcanvas | `fixed right-0 top-0 z-40 h-dvh w-full max-w-[31rem] bg-white translate-x-full transition-all duration-500` |
| Backdrop | `fixed left-0 top-0 z-[39] h-full w-full bg-black/50 opacity-0 pointer-events-none transition-all duration-500` |
| Load more button | `bg-taupe-900 px-8 py-3 text-sm tracking-wider text-white hover:bg-taupe-600 transition-all` |

---

## Build notes
- 4 files created: `templates/collection.json`, `sections/collection-template.liquid`, `snippets/filter-sidebar.liquid`, `locales/en.default.schema.json` (collection keys)
- 3 files updated: `locales/en.default.json` (added `sections.collection.*` keys), `tailwind.config.js` (added `container-wide` plugin), `sections/header.liquid` (absolute→relative fix)
- `container-wide` added as Tailwind plugin matching source site exactly: responsive max-widths at each breakpoint (640→1920px), `px-6` padding, up to `160rem` fallback
- Product grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` with colour grouping via `product_display_name` metafield deduplication (O(n²) within paginate page)
- Colour swatches built as captured HTML using existing `colour-swatch.liquid` snippet, passed to `product-card.liquid` as `swatches` + `swatches_mobile` params — only rendered when swatch_count > 1
- Quick links: driven by `collection.metafields.custom.collections_links` (list.collection_reference), active state via `ring-2 ring-inset ring-clubhouse-green-600`
- Filter sidebar: CSS data-attribute offcanvas (`data-[filter-open=true]`), supports list/price_range/boolean filter types, colour filter values get swatch dots, size filters use 3-col grid
- **AJAX filtering via Shopify Section Rendering API** (`?sections=SECTION_ID`) — no page reloads on filter/sort/clear/pill-remove. Validated against Shopify MCP docs. All event handlers use document-level delegation to survive DOM replacement
- Active filter pills displayed above filter accordion with remove links (`value.url_to_remove`), AJAX-powered via `data-filter-pill`
- Sort dropdown: native `<select>` from `collection.sort_options`, AJAX via `fetchSection()`
- Load more: Section Rendering API pagination appends products to `#collection-product-grid`, updates button `data-next-url`, `<noscript>` fallback via `default_pagination`
- Browser back/forward supported via `popstate` → `fetchSection()`
- JS uses `{% javascript %}` tags (scoped to section/snippet) rather than adding to global `theme.js`
- `collection-template.liquid` JS: all AJAX + event delegation (filter, sort, pagination, sidebar open/close)
- `filter-sidebar.liquid` JS: accordion toggle only (event-delegated)
- Header fix: `absolute` → `relative` positioning for solid (non-transparent) variant
- `snippets/pagination.liquid` not created as separate file — pagination logic inlined in collection-template.liquid
- Description HTML fix: `strip_html` approach to avoid invalid `<p>` nesting flagged by Theme Check
- All files pass Shopify Theme Check
- Tailwind CSS recompiled with all new utility classes
