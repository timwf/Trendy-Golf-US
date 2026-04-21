# Article Template — Spec Doc

## References

| Source | File |
|--------|------|
| Scraped HTML — articles | `_reference/scraped/html/magazine-article-1.html`, `magazine-article-open-champ.html`, `magazine-article-gift-guide.html`, `magazine-article-adidas-shoes.html` |
| Scraped data — articles | `_reference/scraped/data/stream/magazine-article-*-route-routes-magazine_--slug.json` |
| Scraped JS | `_reference/scraped/assets/js/magazine_._slug-BpbqEaKF.js` |
| Repo — article route | `_reference/repo/app/routes/magazine_.$slug.tsx` |
| Repo — featured carousel | `_reference/repo/app/components/blocks/magazineArticles.tsx` |
| Repo — data hooks | `_reference/repo/app/hooks/useMagazinesFeatured.ts` |

### Already Built

| File | Status |
|------|--------|
| `sections/magazine-articles.liquid` | Complete — Splide carousel of article cards (reuse for "Latest Articles" at bottom) |
| `snippets/magazine-card.liquid` | Complete — individual article card |

---

## Files to Create

| File | Purpose |
|------|---------|
| `templates/article.json` | Article page JSON template |
| `sections/article-template.liquid` | Article page section — breadcrumbs, hero, body content, images |
| `snippets/breadcrumb.liquid` | Breadcrumb navigation (reusable) |

---

## Source Architecture — Sanity vs Shopify

The source site does **not** use Shopify's native blog/article system at all. All magazine content lives exclusively in Sanity CMS, fetched via GROQ queries (`*[_type == "magazine"]`). Evidence:

- No `templates/article.json` or `templates/blog.json` in the source Shopify theme
- Empty `article` and `blog` arrays in `.shopify/metafields.json`
- Zero Shopify article API calls in the repo — only product/cart/collection/customer
- Redirect files map old Shopify blog URLs (`/blogs/magazine/...`) to new Sanity routes, confirming they migrated away from Shopify's blog system

In Sanity, each article is assembled from **flexible content blocks** (breadcrumbs → content → inlineImages → content → productCarousel, etc.) with per-block spacing/animation options. Shopify's `article.content` is a single HTML blob from the rich text editor — no block system.

The existing Shopify blog/article content predates the headless build — the client moved to Sanity but is now coming back to Shopify. The articles should already exist in Shopify's native system. No content migration required; we just need to build a template that renders them with the source site's styling.

**Note:** Some Sanity articles used block types (`productCarousel`, `bannerCarousel`) that don't have equivalents in Shopify's article editor. Any content that relied on those blocks won't carry over automatically — flag to client if specific articles look incomplete.

---

## Overview

The article template renders Shopify's native article data with the source site's styling:

1. **Breadcrumbs** — Home > Magazine > Article Title
2. **Hero header** — title, excerpt, date (centred)
3. **Featured image** — full-width article image
4. **Article body** — rich text content (`article.content`)
5. **Related articles** — "Latest Articles" carousel (reuse existing `magazine-articles` section)

---

## HTML Structure — Breadcrumbs (upgraded from source)

Source uses `<ul>` with no `<nav>` wrapper. Below is the upgraded version with accessibility improvements (`<nav>`, `<ol>`, `aria-current`). Source `data-discover="true"` on links is a Remix artifact — not replicated.

```html
<section class="page-block relative page-block--breadcrumbs lg:mb-14 mb-8 bg-transparent">
  <div class="container pt-5">
    <nav aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-1 lg:gap-2">
        <!-- Home link (hidden on mobile) -->
        <li class="items-center hidden md:flex">
          <a class="text-teal-green flex items-center gap-1 text-xs font-semibold leading-none underline"
             href="/">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                 aria-hidden="true" data-slot="icon" class="size-3">
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clip-rule="evenodd"/>
            </svg>Home
          </a>
          <span class="pl-1 lg:pl-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                 aria-hidden="true" data-slot="icon" class="size-3 text-neutral-500">
              <path fill-rule="evenodd" d="M15.256 3.042a.75.75 0 0 1 .449.962l-6 16.5a.75.75 0 1 1-1.41-.513l6-16.5a.75.75 0 0 1 .961-.449Z" clip-rule="evenodd"/>
            </svg>
          </span>
        </li>
        <!-- Magazine link -->
        <li class="items-center flex">
          <a class="text-teal-green flex items-center gap-1 text-xs font-semibold leading-none underline"
             href="/magazine">Magazine</a>
          <span class="pl-1 lg:pl-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                 aria-hidden="true" data-slot="icon" class="size-3 text-neutral-500">
              <path fill-rule="evenodd" d="M15.256 3.042a.75.75 0 0 1 .449.962l-6 16.5a.75.75 0 1 1-1.41-.513l6-16.5a.75.75 0 0 1 .961-.449Z" clip-rule="evenodd"/>
            </svg>
          </span>
        </li>
        <!-- Current article title -->
        <li class="items-center flex" aria-current="page">
          <span class="text-2xs text-neutral-500 md:text-xs">Article Title</span>
        </li>
      </ol>
    </nav>
  </div>
</section>
```


---

## Source HTML Structure — Article Hero (Title/Date)

**Spacing note:** Sanity applies per-block spacing/background — some articles use `bg-transparent` with margin-based spacing (e.g. `lg:mb-36 mb-28`), others use `bg-white` with padding-based spacing. We use the gift-guide variant below (`bg-white`, padding) as the canonical set for the fixed Shopify template. This is a deliberate simplification.

```html
<section class="page-block relative page-block--content lg:pt-20 lg:pb-36 pt-28 pb-28 bg-white">
  <div data-inview="false" class="group-inview group/blocks">
    <div class="container-narrow text-center">
      <div class="opacity-0 -translate-y-14 transition-all duration-1000 ease animation-group
                  group-data-[inview=true]/blocks:opacity-100
                  group-data-[inview=true]/blocks:translate-y-0">
        <p>
          <span class="font-serif">
            <span class="text-3xl lg:text-4xl">Article Headline</span>
          </span>
        </p>
        <p>Article subtitle or excerpt</p>
        <p>01.12.2023</p>
      </div>
    </div>
  </div>
</section>
```

---

## Source HTML Structure — Featured Image

```html
<section class="page-block relative page-block--inlineImages lg:pt-14 pt-8 bg-white">
  <div class="container flex flex-col justify-center gap-5 lg:flex-row">
    <div class="flex basis-full justify-center">
      <img class="block justify-self-center" src="..." width="" height="auto" loading="lazy"/>
    </div>
  </div>
</section>
```

---

## Source HTML Structure — Article Body Content

```html
<section class="page-block relative page-block--content lg:pt-14 lg:pb-36 pt-8 pb-28 bg-white">
  <div data-inview="false" class="group-inview group/blocks">
    <div class="container-narrow text-left">
      <div class="opacity-0 -translate-y-14 transition-all duration-1000 ease animation-group
                  group-data-[inview=true]/blocks:opacity-100
                  group-data-[inview=true]/blocks:translate-y-0">
        <h3><span class="text-3xl lg:text-4xl">Section Heading</span></h3>
        <h4><span class="text-xl lg:text-2xl">Sub Heading</span></h4>
        <p>Body text paragraph...</p>
        <p>Paragraph with <a href="..." class="text-clubhouse-green-600 underline">inline link</a></p>
        <ol class="mb-6 ml-5 list-decimal">
          <li><span class="font-bold">Bold title:</span> Description</li>
        </ol>
      </div>
    </div>
  </div>
</section>
```

---

## Source HTML Structure — Related Articles ("Latest Articles")

Already built as `sections/magazine-articles.liquid` — Splide carousel with heading. Reuse in `article.json`.

---

## Key Tailwind Classes

| Element | Classes |
|---------|---------|
| Breadcrumbs section | `page-block relative page-block--breadcrumbs lg:mb-14 mb-8 bg-transparent` |
| Breadcrumbs container | `container pt-5` |
| Breadcrumbs list | `flex flex-wrap items-center gap-1 lg:gap-2` |
| Breadcrumb link | `text-teal-green flex items-center gap-1 text-xs font-semibold leading-none underline` |
| Breadcrumb separator | `pl-1 lg:pl-2` |
| Breadcrumb separator icon | `size-3 text-neutral-500` |
| Breadcrumb home icon | `size-3` |
| Breadcrumb home li | `items-center hidden md:flex` |
| Breadcrumb current text | `text-2xs text-neutral-500 md:text-xs` |
| Hero section | `page-block relative page-block--content lg:pt-20 lg:pb-36 pt-28 pb-28 bg-white` |
| Hero container | `container-narrow text-center` |
| Hero animation wrapper | `opacity-0 -translate-y-14 transition-all duration-1000 ease animation-group group-data-[inview=true]/blocks:opacity-100 group-data-[inview=true]/blocks:translate-y-0` |
| Hero title outer span | `font-serif` |
| Hero title inner span | `text-3xl lg:text-4xl` |
| Image section | `page-block relative page-block--inlineImages lg:pt-14 pt-8 bg-white` |
| Image container | `container flex flex-col justify-center gap-5 lg:flex-row` |
| Image wrapper | `flex basis-full justify-center` |
| Image | `block justify-self-center` |
| Body section | `page-block relative page-block--content lg:pt-14 lg:pb-36 pt-8 pb-28 bg-white` |
| Body container | `container-narrow text-left` |
| Body links | `text-clubhouse-green-600 underline` |
| Body ordered lists | `mb-6 ml-5 list-decimal` |
| Body bold text | `font-bold` |
| Body section headings (`<h3>`) | `text-3xl lg:text-4xl` |
| Body sub-headings (`<h4>`) | `text-xl lg:text-2xl` |
| Inview wrapper | `group-inview group/blocks` (with `data-inview="false"` attribute) |

---

## Sanity Block Structure

In Sanity there are **no top-level metadata fields** on articles — no `title`, `publishedAt`, `image`, or `excerpt` at the document level. Everything is embedded in content blocks. The `schemaData` object only has `title` and `slug` (for SEO schema markup).

Block order is **not fixed** but follows a consistent pattern across all scraped articles:

| Position | Block type | Content | Shopify equivalent |
|----------|-----------|---------|-------------------|
| 1 | `breadcrumbs` | Navigation (auto-generated) | Built into section template |
| 2 | `content` (centred) | Title (`sizeH3 fontSerif` marks), excerpt, date as plain text | `article.title`, `article.excerpt`, `article.published_at` |
| 3 | `inlineImages` | Hero/featured image | `article.image` |
| 4+ | `content` + `inlineImages` alternating | Body text, sub-headings, inline images | `article.content` (single HTML blob) |
| Occasional | `bannerCarousel` | Image/video slider | No equivalent — flag to client |
| Occasional | `productCarousel` | Product grid with Shopify handles | No equivalent — flag to client |
| Last | `magazineArticles` | Related articles carousel | Separate section (`magazine-articles.liquid`) |

### Full field mapping — Sanity → Shopify

| Rendered as | In Sanity | In Shopify |
|---|---|---|
| Page title | `blocks[1].data.content` — span with `sizeH3 fontSerif` marks | `article.title` |
| Excerpt/subtitle | `blocks[1].data.content` — second paragraph | `article.excerpt` — use `strip_html` for plain text output |
| Publication date | `blocks[1].data.content` — third paragraph (e.g. "18.07.2024") — **optional, not all articles have it** | `article.published_at` — format: `{{ article.published_at \| date: '%d.%m.%Y' }}` |
| Featured image | `blocks[2]` — first `inlineImages` block | `article.image` — use `image_url` + `image_tag` for responsive output |
| Body content | Remaining `content` + `inlineImages` blocks | `article.content` (single HTML blob, styled with `.rte-article`) |
| SEO title | `seo.metaTitle` | Shopify SEO title field |
| SEO description | `seo.metaDescription` | Shopify SEO description field |
| Categories | Returned in lister queries only, not on single articles | `article.tags` |
| Author | Not displayed in source | `article.author` (not used in template) |
| Blog reference | `path` (e.g. `/magazine/...`) | `blog` global object (not `article.blog` — `blog` is a separate page-level object on article pages) → `blog.title`, `blog.url` for breadcrumbs |
| Related articles | `magazineArticles` block | Separate section in `article.json` |

---

## Article Body Styling

Shopify's `article.content` outputs raw HTML (from the rich text editor). We need to style this with a `.rte-article` wrapper class that applies the source site's typography:

**Note:** `@apply` requires Tailwind's build step (PostCSS). Confirm the theme's Tailwind pipeline handles this, or convert to plain CSS during build.

```css
.rte-article h2 { @apply text-3xl lg:text-4xl mb-4; }
.rte-article h3 { @apply text-3xl lg:text-4xl mb-4; }
.rte-article h4 { @apply text-xl lg:text-2xl mb-3; }
.rte-article p { @apply mb-4; }
.rte-article a { @apply text-clubhouse-green-600 underline; }
.rte-article ol { @apply mb-6 ml-5 list-decimal; }
.rte-article ul { @apply mb-6 ml-5 list-disc; }
.rte-article strong { @apply font-bold; }
.rte-article em { @apply italic; }
.rte-article img { @apply block mx-auto my-8; }
```

Size mapping rationale: Source uses `<h3>` at `text-3xl lg:text-4xl` for the vast majority of section headings and `<h4>` at `text-xl lg:text-2xl` for sub-headings. Both `h2` and `h3` get the large size since Shopify's RTE may use either for main headings. `font-serif` is NOT applied — source only uses it on the hero title, not body headings.

**Known limitation — two-image layouts:** Source frequently uses side-by-side images (`basis-1/2 justify-end` + `basis-1/2 justify-start`). Shopify's RTE outputs images inline with no flex wrapper, so two-image grid layouts from Sanity won't be replicated. Images in `article.content` will display full-width stacked.

---

## Breadcrumb Snippet (`snippets/breadcrumb.liquid`)

Render breadcrumbs inline in the article section rather than as a separate snippet with array params. Liquid has no `push` filter, and building nested arrays with `concat`/`split` is fragile and unreadable.

### Approach

Render the breadcrumb markup directly in `sections/article-template.liquid` using the `blog` global object:

```liquid
{%- if section.settings.show_breadcrumbs -%}
  <section class="page-block relative page-block--breadcrumbs lg:mb-14 mb-8 bg-transparent">
    <div class="container pt-5">
      <nav aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-1 lg:gap-2">
          <li class="items-center hidden md:flex">
            <a class="text-teal-green flex items-center gap-1 text-xs font-semibold leading-none underline" href="/">
              {%- comment -%}Home icon SVG{%- endcomment -%}
              Home
            </a>
            <span class="pl-1 lg:pl-2">{%- comment -%}Separator SVG{%- endcomment -%}</span>
          </li>
          <li class="items-center flex">
            <a class="text-teal-green flex items-center gap-1 text-xs font-semibold leading-none underline"
               href="{{ blog.url }}">{{ blog.title }}</a>
            <span class="pl-1 lg:pl-2">{%- comment -%}Separator SVG{%- endcomment -%}</span>
          </li>
          <li class="items-center flex" aria-current="page">
            <span class="text-2xs text-neutral-500 md:text-xs">{{ article.title }}</span>
          </li>
        </ol>
      </nav>
    </div>
  </section>
{%- endif -%}
```

If breadcrumbs are needed on other page types later, extract to a snippet at that point using individual params (`title_1`, `url_1`, etc.).

---

## Section Schema

```json
{
  "name": "Article template",
  "tag": "section",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_breadcrumbs",
      "label": "Show breadcrumbs",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_date",
      "label": "Show publication date",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_excerpt",
      "label": "Show excerpt below title",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_featured_image",
      "label": "Show featured image",
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

**Note:** `presets` intentionally omitted. This section is hardcoded in `article.json` and should not appear in the theme editor's "Add section" picker. If it needs to be editor-addable in future, add `presets` back.

---

## JSON Template — `templates/article.json`

```json
{
  "sections": {
    "article-template": {
      "type": "article-template",
      "settings": {
        "show_breadcrumbs": true,
        "show_date": true,
        "show_excerpt": true,
        "show_featured_image": true,
        "enable_animation": true
      }
    },
    "related-articles": {
      "type": "magazine-articles",
      "settings": {
        "blog": "magazine",
        "heading": "Latest Articles",
        "article_count": 3,
        "show_category": true,
        "enable_animation": true,
        "margin_bottom": "large"
      }
    }
  },
  "order": ["article-template", "related-articles"]
}
```

---

## Conditional Rendering / Edge Cases

```liquid
{%- comment -%} Excerpt — can contain HTML, use strip_html for plain text {%- endcomment -%}
{% if section.settings.show_excerpt and article.excerpt != blank %}
  <p>{{ article.excerpt | strip_html }}</p>
{% endif %}

{%- comment -%} Date — not all articles have one {%- endcomment -%}
{% if section.settings.show_date and article.published_at %}
  <p>{{ article.published_at | date: '%d.%m.%Y' }}</p>
{% endif %}

{%- comment -%} Featured image — use image_url + image_tag for responsive srcset {%- endcomment -%}
{% if section.settings.show_featured_image and article.image != blank %}
  {{ article.image | image_url: width: 1600 | image_tag: loading: 'lazy', class: 'block justify-self-center' }}
{% endif %}

{%- comment -%} Body content {%- endcomment -%}
{% if article.content != blank %}
  <div class="rte-article">{{ article.content }}</div>
{% endif %}
```

---

## SEO & Structured Data

**Meta tags:** `page_title` and `page_description` are handled by `layout/theme.liquid` — no section-level code needed. Verify the layout includes `<title>{{ page_title }}</title>` and the meta description tag.

**Article structured data:** Add JSON-LD for the article using Shopify's built-in filter:

```liquid
<script type="application/ld+json">{{ article | structured_data }}</script>
```

**Breadcrumb structured data:** Add alongside the breadcrumb nav for Google rich results:

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "{{ shop.url }}" },
    { "@type": "ListItem", "position": 2, "name": {{ blog.title | json }}, "item": "{{ shop.url }}{{ blog.url }}" },
    { "@type": "ListItem", "position": 3, "name": {{ article.title | json }} }
  ]
}
</script>
```

---

## JS Architecture

Minimal — just InView animation observer for the hero and body sections. No interactive features needed.

Ensure Splide JS is loaded before the `magazine-articles` section initialises — the related articles carousel depends on it.

---

## Deferred Items

- **Social sharing buttons** — not present in source scraped HTML. Defer to Phase 7.
- **Product carousel within articles** — source has `page-block--productCarousel` in some articles. This would require metafield-based product collection references per article. Defer — merchants can embed product links in article body HTML for now.
- **Author display** — not shown in source article pages. Don't add.

---

## Build Checklist

Phase 0 — Scope & Decisions:
- [x] Scraped HTML audited
- [x] Repo source audited
- [x] Spec doc created
- [x] Section settings identified
- [x] Client questions flagged (product carousel — see client-questions.md)
- [x] Deferred items documented

Phase 1 — Audit Rounds:
- [x] Audit round 1 — styling
- [x] Audit round 1 — functionality
- [x] Fixes applied
- [x] Audit round 2 — styling
- [x] Audit round 2 — functionality
- [x] Fixes applied
- [x] Audit round 3 — no issues found

Phase 2 — Build:
- [x] Markup & classes built
- [x] JS wired up (minimal — InView observer only, handled by existing global script)
- [x] Section schema added

Phase 3 — Validate:
- [x] validate_theme passed
- [ ] Visual comparison done
- [ ] Functional testing done
- [ ] Build notes written
