# Brand A-Z Listing — Phase 4C-i `[x]` complete

## Overview

The Brand A-Z page (`/pages/brands`) lets customers browse every brand TrendyGolf stocks, filterable by first letter and searchable by name. **Single page only** — no separate womenswear variant (live site has one but staging doesn't, client confirmed we're consolidating to one page).

**Template filename:** `templates/page.brand-listing.json`

> Chosen to marry up with the live Shopify store's existing page assignment on publish — same strategy used for `page.faq.json` (help-centre) and `page.contact.json` (contact). Zero admin reassignment needed.

> ⚠️ `_do-not-use/sections/brand-listing.liquid` is a **logic reference only** — the old Salvo section uses BEM classes and a different layout. We keep the metaobject pattern (already populated in the store) but rebuild markup from the source site's Tailwind classes.

---

## Source Site Reference

**Scraped page data:** `_reference/scraped/data/stream/brands-route-routes-$.json`
**Scraped HTML:** `_reference/scraped/html/brands.html` (note: brand list is hydrated client-side from `/api/fetch-brands` — only the chrome is in the static HTML)

**Source repo components:**
- `_reference/repo/app/components/blocks/brands.tsx` — A-Z section with alphabet tabs, search, grouped grid
- `_reference/repo/app/components/partials/blocks/brands/brandItem.tsx` — individual brand card (logo + hover CTAs)
- `_reference/repo/app/hooks/useBrands.ts` — filter + group logic
- `_reference/repo/app/shopify/requests/getBrands.ts` — Shopify metaobject fetch
- `_reference/repo/app/shopify/queries/brands.ts` — `QUERY_ALL_BRANDS` GraphQL

**Page composition (3 blocks, top to bottom):**

| # | Block type | Purpose | Reuse existing? |
|---|-----------|---------|-----------------|
| 1 | `bannerCarousel` | "Coming Soon APC" single-slide hero with video | ✅ `sections/hero-carousel.liquid` |
| 2 | `bannerCards` | 3-col feature cards: New In Puma / New In Nike / third brand | ✅ `sections/banner-cards.liquid` |
| 3 | `brands` | "All Brands" A-Z listing with alphabet tabs + search | ❌ **new section** |

---

## Data Source — Shopify Metaobjects

The live store already has a `brand` metaobject definition populated with entries (confirmed in `_do-not-use/sections/brand-listing.liquid` — iterates `metaobjects.brand.values`).

### Metaobject fields (verified from production admin screenshot + source repo)

Definition name: **Brand** · Type: `brand` · **34 entries** · all fields required.

| Field key | Type | Purpose |
|-----------|------|---------|
| `brand_name` | `single_line_text_field` | Display name (shown when no logo) |
| `alphabet_reference` | `single_line_text_field` (choice list, one) | Group key ("A", "B"…) |
| `brand_categories` | `list.single_line_text_field` (choice list, many) | Optional categorisation |
| `brand_image` | `file_reference` (image) | Brand logo shown in card |
| `mens_collection` | `collection_reference` | Linked men's collection |
| `womens_collection` | `collection_reference` | Linked women's collection |
| `brand_page` | `single_line_text_field` | URL/slug of optional brand landing page |

### Liquid access pattern

```liquid
{% assign brands = metaobjects.brand.values | sort: 'brand_name' %}
{% for brand in brands %}
  {{ brand.brand_name }}
  {{ brand.alphabet_reference }}
  {{ brand.brand_image | image_url: width: 400 }}
  {{ brand.brand_page }}
  {{ brand.mens_collection.value.url }}
  {{ brand.womens_collection.value.url }}
{% endfor %}
```

No admin/API work required — entries exist on production and are read server-side at render time. Deploy the theme via the Shopify GitHub integration and the page hydrates from live data on first load.

---

## Layout Specification

### Section wrapper

```
<section class="container-wide">
  <!-- Intro -->
  <div class="mx-auto mb-10 max-w-screen-lg text-center">
    <h3>All Brands</h3>
    <p>Whether you're searching for a new polo shirt…</p>
  </div>

  <!-- Alphabet tabs -->
  <div role="tablist" aria-label="Filter brands by first letter"
       class="mb-6 flex flex-wrap justify-center gap-2 overflow-x-auto pb-2 md:flex-nowrap">
    {% for letter in alphabet %}
      <button type="button" role="tab"
              aria-selected="false" aria-pressed="false"
              data-letter="{{ letter }}"
              class="w-16 cursor-pointer whitespace-nowrap border border-taupe-400 p-2
                     text-center transition-colors focus:outline-none focus-visible:ring
                     lg:w-20 data-[active=true]:border-clubhouse-green-800
                     data-[active=true]:bg-clubhouse-green-800 data-[active=true]:text-white">
        <span class="font-medium">{{ letter }}</span>
      </button>
    {% endfor %}
  </div>

  <!-- Search -->
  <div class="mx-auto mb-6 flex w-full max-w-md items-center rounded border border-gray-300
              bg-transparent px-4 transition-all focus-within:border-clubhouse-green-600">
    {% render 'icon', icon: 'magnifying-glass', class: 'size-6 text-gray-400' %}
    <label for="brand-search" class="sr-only">Find a brand</label>
    <input id="brand-search" type="text" placeholder="Find a brand"
           autocomplete="off" spellcheck="false" inputmode="search"
           class="w-full bg-transparent p-3 focus:outline-none" />
  </div>

  <!-- Grouped brand grid -->
  <div class="space-y-8" data-brand-groups>
    {% for group in grouped_brands %}
      <section aria-labelledby="group-{{ group.key }}" data-group="{{ group.key }}">
        <p id="group-{{ group.key }}"
           class="pt-4 text-center text-xl font-bold capitalize xl:text-2xl
                  {% unless forloop.first %}border-t border-taupe-400{% endunless %}">
          {% if group.key == 'Other' %}Other Brands{% else %}{{ group.key }}{% endif %}
        </p>
        <div class="mx-auto flex max-w-screen-xl flex-wrap justify-center">
          {% for brand in group.items %}
            <div class="group relative basis-1/2 overflow-hidden p-2
                        md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
                 data-brand-name="{{ brand.brand_name | downcase }}"
                 data-brand-letter="{{ brand.alphabet_reference | upcase }}">
              {% render 'brand-card', brand: brand %}
            </div>
          {% endfor %}
        </div>
      </section>
    {% endfor %}
  </div>

  <!-- Empty state (hidden by default, toggled by JS) -->
  <div class="py-8 text-center" data-brand-empty hidden>
    <p class="text-gray-500">No brands found</p>
  </div>
</section>
```

### Brand card snippet (`snippets/brand-card.liquid`)

Built from `brandItem.tsx`. Logo fills the card; on desktop, CTAs slide up from below on hover. On mobile, CTAs are always visible as a 2-col grid beneath the logo.

```
{% if brand.brand_image != blank %}
  <div class="my-3">
    <img class="mx-auto h-auto w-full object-contain"
         src="{{ brand.brand_image | image_url: width: 400 }}"
         alt="{{ brand.brand_image.alt | default: brand.brand_name | append: ' logo' }}"
         loading="lazy" width="400" height="auto" />
  </div>
{% else %}
  <p class="mb-2 text-center text-lg font-bold">{{ brand.brand_name }}</p>
{% endif %}

<div class="grid w-full grid-cols-2 gap-2 md:gap-4
            lg:absolute lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2 lg:translate-y-full
            lg:px-2 lg:transition-transform lg:duration-300
            group-hover:lg:translate-y-0">
  {% if brand.brand_page != blank %}
    <a href="{{ brand.brand_page }}"
       class="btn btn--compact col-span-2 justify-center text-xs hover:underline">
      The Brand
    </a>
  {% else %}
    {% if brand.mens_collection != blank %}
      <a href="{{ brand.mens_collection.url }}"
         class="btn btn--compact justify-center text-xs hover:underline
                {% if brand.womens_collection == blank %}col-span-2{% endif %}">
        Mens
      </a>
    {% endif %}
    {% if brand.womens_collection != blank %}
      <a href="{{ brand.womens_collection.url }}"
         class="btn btn--compact justify-center text-xs hover:underline
                {% if brand.mens_collection == blank %}col-span-2{% endif %}">
        Womens
      </a>
    {% endif %}
  {% endif %}
</div>
```

**Card button priority (from `brandItem.tsx`):**
1. If `brand_page` exists → single "The Brand" button (col-span-2)
2. Else show Mens and/or Womens collection buttons (auto col-span-2 if only one exists)

---

## Filtering & Search Logic

### Server-side (Liquid)

1. Iterate `metaobjects.brand.values`, sorted alphabetically by `brand_name`
2. Group by `alphabet_reference` (fallback `'Other'`)
3. Sort group keys A–Z with `'Other'` last
4. Render all groups — letter tabs built from distinct group keys

### Client-side (vanilla JS — `assets/brand-listing.js`)

Mirrors `useBrands.ts` logic but on pre-rendered DOM:

| State | Trigger | Effect |
|-------|---------|--------|
| Letter selected | Click alphabet tab | Hide all groups except the one matching `data-group`. Toggle active style on tab. Clears search. Second click on same letter clears filter. |
| Search query | Typing in `#brand-search` | Debounced 150ms. Hide brand cards whose `data-brand-name` doesn't include query. Hide entire `<section data-group>` if all children hidden. Clears letter filter. |
| Neither | Default | All groups and cards visible. |
| Empty | No matches | Show `[data-brand-empty]` with a dynamic message. |

**No Shopify fetch needed** — everything is rendered server-side in one pass (metaobjects return fast), JS only toggles visibility.

---

## Section Schema

`sections/brand-listing.liquid` — fixed layout, content minimal (title + description live in metaobjects; intro block is editable).

```json
{
  "name": "Brand A–Z Listing",
  "settings": [
    {
      "type": "richtext",
      "id": "heading",
      "label": "Intro heading",
      "default": "<h3>All Brands</h3>"
    },
    {
      "type": "richtext",
      "id": "description",
      "label": "Intro description"
    },
    {
      "type": "checkbox",
      "id": "show_alphabet_tabs",
      "label": "Show A–Z filter tabs",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_search",
      "label": "Show search input",
      "default": true
    }
  ],
  "presets": [{ "name": "Brand A–Z Listing" }]
}
```

---

## Files to Add / Modify

| File | Action | Purpose |
|------|--------|---------|
| `templates/page.brand-listing.json` | **new** | JSON template composing hero + cards + A–Z listing |
| `sections/brand-listing.liquid` | **new** | A–Z section (intro + tabs + search + grouped grid) |
| `snippets/brand-card.liquid` | **new** | Individual brand card (logo + hover CTAs) |
| `assets/brand-listing.js` | **new** | Letter filter + debounced search |
| `snippets/icon.liquid` | edit | Add `magnifying-glass` heroicon if not already present |
| `locales/en.default.json` | edit | `brand_listing.find_a_brand`, `brand_listing.no_brands`, `brand_listing.other_brands` |

**Client setup (Shopify admin, post-deploy):**
- Assign "Brands" page to the `page.brand-listing` template

---

## Build Order

1. **Scope & Decisions** (this doc) — confirm field keys exist on staging, confirm page metafield approach vs two templates
2. **Audit rounds** (parallel) — styling agent vs `brands.tsx` + `brandItem.tsx`; functionality agent vs `useBrands.ts` + `getBrands.ts`
3. **Build** — markup + Tailwind classes first, metaobject iteration + grouping second, JS filter/search third, schema last
4. **Validate** — `validate_theme`, visual diff against `/brands` on source site, alphabet + search interaction testing, Mens/Womens filter on staging

---

## Data readiness

✅ **No blockers.** The `brand` metaobject is defined and populated (34 entries) on the production store we deploy to. Fields match the source repo exactly. Once the theme is deployed via the GitHub integration, the page hydrates on first render with live brand data.

Dev preview during the build: the GitHub-integrated theme runs against production metaobject data as soon as the theme file is pushed, so visual validation happens directly against the real brand list — no seeding needed.