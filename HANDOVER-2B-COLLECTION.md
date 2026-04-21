# Handover — Phase 2B: Collection Page

> **Status:** Audited & planned. Ready to build.
> **Prepared:** 2026-03-20
> **Depends on:** Phase 2A (product-card.liquid) — may or may not be complete. See fallback strategy below.

---

## What to build

| File | Type | Purpose |
|------|------|---------|
| `templates/collection.json` | Template | JSON template pointing to `collection-template` section |
| `sections/collection-template.liquid` | Section | Main collection layout: title, description, quick-links, filter/sort controls, product grid, load-more pagination |
| `snippets/filter-sidebar.liquid` | Snippet | Offcanvas filter panel using Shopify native `collection.filters` |
| `snippets/pagination.liquid` | Snippet | "Load more" button with JS-enhanced product appending + `<noscript>` fallback |

**Also update:** `locales/en.default.json` — add all `sections.collection.*` keys.

---

## Workflow

Follow the standard build process from BUILD.md:

1. **MCP Research** — call `learn_shopify_api(api: 'liquid')` first to get a `conversationId`, then use `search_docs_chunks` to look up `collection.filters`, `filter` object, `paginate` tag, `collection.sort_options`, and `collection.products`. Use `fetch_full_docs` for the full storefront filtering support page.
2. **Build** each file
3. **Validate** — run `validate_theme` via Shopify MCP on every new/modified file
4. **Test** — confirm on staging store (`trendy-golf-development.myshopify.com`)

**Deployment:** Just commit and push to `main`. The repo is connected to the staging store via Shopify GitHub integration — pushes auto-sync.

---

## Reference files

| What | File |
|------|------|
| **Primary HTML** | `_reference/scraped/html/collection-mens-apparel.html` (large file — search by section, don't read whole thing) |
| Other collections | `collection-womens-clothing.html`, `collection-mens-shoes.html`, `collection-mens-new-in.html`, `collection-mens-accessories.html`, `collection-womens-shoes.html` |
| Filter JS | `_reference/scraped/assets/js/filtersOffcanvas-YN9Z-5GC.js` |
| Collection JS | `_reference/scraped/assets/js/collections-CZuVGFWH.js` |
| API data | `_reference/scraped/data/stream/collection-mens-apparel-route-routes-collections_.$slug.json` |
| Summary | `_reference/scraped/data/collection-mens-apparel-summary.json` |

---

## Existing theme context

Before building, read these files to understand the existing patterns:

- `layout/theme.liquid` — main layout wrapper, font loading, section groups
- `assets/theme.css` — compiled Tailwind v3.4.19 with full utility set
- `assets/theme.js` — mobile nav drawer logic (use same `data-*` attribute patterns)
- `tailwind.config.js` — custom colours (taupe, clubhouse-green), fonts, breakpoints (3xl: 1680px, 4xl: 1920px)
- `sections/header.liquid` — has transparent/solid header variants; collection pages should use solid
- `snippets/icon.liquid` — SVG icon renderer, accepts `icon` (string name) and `size` params
- `locales/en.default.json` — existing translation structure to follow

**Existing sections:** `announcement-bar.liquid`, `footer.liquid`, `header.liquid`, `main-content.liquid`
**Existing snippets:** `icon.liquid`, `mega-menu-dropdown.liquid`, `social-links.liquid`
**Existing templates:** `index.json` only

---

## Detailed implementation spec

The full spec with code examples is in **BUILD.md under "2B — Audit & Plan (completed)"**. Below is a summary of key decisions.

### 1. Page layout

```
<main class="py-10">
  <div class="mx-auto max-w-screen-2xl px-4">
    <!-- Title + description grid -->
    <div class="mb-10 grid grid-cols-1 lg:grid-cols-6">
      <div class="lg:col-span-4">
        <h1 class="font-serif text-4xl lg:text-5xl">{{ collection.title }}</h1>
      </div>
      <div class="lg:col-span-2">
        {{ collection.description }}
      </div>
    </div>

    <!-- Quick links -->
    <!-- Controls bar (filter button + sort) -->
    <!-- Product grid -->
    <!-- Load more -->
  </div>
</main>
```

Check if `container-wide` exists as a Tailwind utility in the compiled CSS. If not, use `mx-auto max-w-screen-2xl px-4` as substitute.

### 2. Quick links (subcategory pills)

**Data source:** `collection.metafields.custom.collections_links` — this is a `list.collection_reference` metafield that returns actual collection objects.

```liquid
{%- assign quick_links = collection.metafields.custom.collections_links.value -%}
{%- if quick_links != blank -%}
  <div class="mb-10 overflow-hidden">
    <div class="flex flex-nowrap gap-2 overflow-x-auto pb-3 md:flex-wrap md:gap-4 md:pb-0">
      {%- for linked_collection in quick_links -%}
        <a href="{{ linked_collection.url }}"
          class="inline-block whitespace-nowrap bg-taupe-300 px-5 py-3 text-sm tracking-wider transition-all hover:bg-taupe-400 md:text-base
            {%- if linked_collection.handle == collection.handle %} ring-2 ring-inset ring-clubhouse-green-600{%- endif -%}"
        >
          {{ linked_collection.title }}
        </a>
      {%- endfor -%}
    </div>
  </div>
{%- endif -%}
```

### 3. Product grid with colour grouping

Products sharing the same `custom.product_display_name` metafield are treated as one card with colour swatches. The collection template deduplicates:

- Loop `collection.products` within a `{% paginate %}` block
- Track `seen_display_names` (pipe-delimited string)
- For each unseen display name, inner-loop to find siblings and build a swatch data string
- Pass swatch string to `{% render 'product-card', product: product, swatches: swatch_data %}`

**Full code example in BUILD.md** — see "Colour grouping logic" section.

**O(n²) caveat:** Works within a single paginate page (24 products). If a colour group spans page boundaries, some swatches may be missing. Acceptable for v1.

**Product card dependency:** If `snippets/product-card.liquid` doesn't exist yet, build a simple inline fallback that renders the product title, featured image, vendor, and price as a link to the product page. Document clearly that this should be replaced once 2A is complete.

### 4. Filter sidebar (offcanvas)

Render via `{% render 'filter-sidebar', collection: collection %}`.

**Structure:**
- Fixed panel: `fixed right-0 top-0 z-40 h-dvh w-full max-w-[31rem] bg-white`
- Closed: `translate-x-full shadow-none`
- Open: `translate-x-0 shadow-xl`
- Transition: `transition-all duration-500 ease-in-out`
- Backdrop overlay: `fixed left-0 top-0 z-[39] h-full w-full bg-black/50`

**Filter form:** Use `<form>` with Shopify native `collection.filters`:
- `filter.type == 'list'` → checkbox grid (`grid-cols-2 gap-3`, except size filters use `grid-cols-3`)
- `filter.type == 'price_range'` → min/max number inputs with Apply button
- `filter.type == 'boolean'` → single checkbox

**Special colour filter rendering:** When `filter.param_name` contains `color`, render a round swatch dot alongside the checkbox label.

**Active filter pills:** Above the filter accordion, show pills for each active filter value with a remove link (`value.url_to_remove`).

**Bottom buttons (fixed to offcanvas bottom):**
- "View products" — closes offcanvas
- "Clear all" — links to `{{ collection.url }}` (removes all filter params)

**JS for offcanvas toggle:**
- Filter button sets `data-filter-open="true"` on the sidebar container
- Close button / backdrop click / "View products" sets it to `"false"`
- Use CSS attribute selectors or JS class toggling matching existing `theme.js` patterns
- Call `document.body.style.overflow = 'hidden'` when open (prevent background scroll)

**Filter form submission:** Use JS to auto-submit on checkbox change, or provide explicit Apply/Submit buttons. The source site auto-submits on checkbox toggle. For v1, either approach works — auto-submit is more polished.

### 5. Sort dropdown

```liquid
{%- assign sort_by = collection.sort_by | default: collection.default_sort_by -%}
<select data-collection-sort class="w-32 appearance-none bg-transparent p-3">
  {%- for option in collection.sort_options -%}
    <option value="{{ option.value }}" {% if option.value == sort_by %}selected{% endif %}>
      {{ option.name }}
    </option>
  {%- endfor -%}
</select>
```

JS: On change, update `sort_by` URL param and reload page.

### 6. Pagination — "Load more" with JS append

Wrap the product loop in `{% paginate collection.products by section.settings.products_per_page %}`.

**Liquid output:**
```liquid
{% if paginate.next %}
  <div id="load-more-container" class="mt-8 flex justify-center">
    <button id="load-more-btn"
      data-next-url="{{ paginate.next.url }}"
      class="bg-taupe-900 px-8 py-3 text-sm tracking-wider text-white hover:bg-taupe-600 transition-all">
      {{ 'sections.collection.load_more' | t }}
    </button>
  </div>
{% endif %}
<noscript>{{ paginate | default_pagination }}</noscript>
```

**JS behaviour:**
1. Click "Load more" → show loading state (e.g. "Loading..." text, disable button)
2. `fetch(button.dataset.nextUrl)` → get next page HTML
3. Parse response: `new DOMParser().parseFromString(html, 'text/html')`
4. Extract `#collection-product-grid` children from the parsed doc
5. Append those children to the existing `#collection-product-grid`
6. Check if the parsed doc has a `#load-more-btn` with a `data-next-url`:
   - Yes → update button's `data-next-url` to the new value
   - No → hide/remove the "Load more" button (no more pages)
7. Optionally `history.replaceState()` to update URL

**`<noscript>` fallback:** `{{ paginate | default_pagination }}` renders standard numbered links.

### 7. Section schema

Key settings:
- `products_per_page` (range, 12–48, step 4, default 24)
- `enable_filtering` (checkbox, default true)
- `enable_sorting` (checkbox, default true)

### 8. collection.json template

```json
{
  "sections": {
    "main": {
      "type": "collection-template",
      "settings": {}
    }
  },
  "order": ["main"]
}
```

---

## Translation keys to add

Add under `sections.collection` in `locales/en.default.json`:

```json
{
  "sections": {
    "collection": {
      "name": "Collection",
      "product_count": "{{ count }} products",
      "filter": "Filter",
      "show_filters": "Show filters",
      "clear_all": "Clear all",
      "view_products": "View products",
      "sort_by": "Sort by",
      "load_more": "Load more",
      "no_products": "No products found",
      "active_filters": "Active filters",
      "remove_filter": "Remove {{ filter }}",
      "price_min": "Min",
      "price_max": "Max",
      "price_apply": "Apply",
      "price_clear": "Clear",
      "settings": {
        "layout": {
          "content": "Layout"
        },
        "products_per_page": {
          "label": "Products per page"
        },
        "enable_filtering": {
          "label": "Enable filtering"
        },
        "enable_sorting": {
          "label": "Enable sorting"
        }
      }
    }
  }
}
```

---

## Tailwind classes quick reference

All these classes are available in the compiled `assets/theme.css`:

| Element | Classes |
|---------|---------|
| Page wrapper | `py-10` + `mx-auto max-w-screen-2xl px-4` |
| Title | `font-serif text-4xl lg:text-5xl` |
| Quick-link pill | `inline-block whitespace-nowrap bg-taupe-300 px-5 py-3 text-sm md:text-base tracking-wider hover:bg-taupe-400 transition-all` |
| Quick-link active | `ring-2 ring-inset ring-clubhouse-green-600` |
| Product grid | `grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4` |
| Filter offcanvas | `fixed right-0 top-0 z-40 h-dvh w-full max-w-[31rem] bg-white translate-x-full transition-all duration-500` |
| Backdrop | `fixed left-0 top-0 z-[39] h-full w-full bg-black/50 opacity-0 pointer-events-none transition-all duration-500` |
| Filter grid | `grid grid-cols-2 gap-3` (sizes: `grid-cols-3`) |
| Active filter pill | `flex gap-1 border border-taupe-900 px-2 py-1 text-xs` |
| Load more button | `bg-taupe-900 px-8 py-3 text-sm tracking-wider text-white hover:bg-taupe-600 transition-all` |
| Sort select | `w-32 appearance-none bg-transparent p-3` |

---

## Gotchas & things to watch

1. **`container-wide`** — search the compiled CSS for this class. If it doesn't exist, use `mx-auto max-w-screen-2xl px-4` instead.

2. **Header variant** — collection pages use the **solid** header (not transparent). The header.liquid section has an `enable_transparent_header` checkbox. The collection template may need to signal this, or it can be set per-page in the theme editor.

3. **Product card snippet** — if `snippets/product-card.liquid` isn't available yet, build a minimal inline placeholder and leave a clear TODO comment. The 2A instance should be building this concurrently.

4. **`3xl` breakpoint** — this is custom (1680px in tailwind.config.js, not the default 1920px). Verify classes like `3xl:grid-cols-4` are in the compiled CSS.

5. **Metafield access** — `collection.metafields.custom.collections_links` requires the metafield definition to exist in Shopify admin with read access granted to the storefront. Verify this is set up on the staging store.

6. **Filter form submission** — Shopify's native filter URL params follow the pattern `filter.p.vendor=Nike&filter.v.option.size=L`. The `<form>` approach with checkbox `name` and `value` attributes handles this automatically when submitted. Test that filters work correctly on staging.

7. **Paginate limit** — Shopify `for` loops max at 50 items. Always wrap `collection.products` in `{% paginate %}`. The `products_per_page` setting (default 24) keeps this well under the limit.

8. **Colour grouping across pages** — The O(n²) sibling lookup only works within the current paginate page. Products split across page boundaries will show incomplete swatches. This is acceptable for v1.

9. **Validate every file** — use `validate_theme` via Shopify MCP after building each file. Fix all errors before moving on.
