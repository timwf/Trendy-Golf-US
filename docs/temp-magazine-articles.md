# Magazine Articles Section — Build Spec

## Overview

Homepage section displaying a horizontal Splide carousel of blog article cards with a heading + subtitle above. Reproduces the "The Magazine" block from the reference site.

---

## Data Source (Two Modes)

### Mode 1: Automatic (default)
Select a **blog** in section settings → pulls the latest N articles from that blog.

### Mode 2: Manual Override (blocks)
Add individual **article blocks** to hand-pick specific posts. When blocks are present, they **override** the blog setting entirely.

> **Customizer note**: The blog setting info text should read something like: *"Select a blog to show latest articles. Add article blocks below to override with specific posts."*

---

## Layout & Structure

```
<section class="page-block relative {{ margin_class }} bg-transparent">

  <!-- Top Content (heading + subheading) -->
  <div data-inview="false" class="group-inview group/blocks">
    <div class="container mb-8 text-center lg:mb-10 [animation classes]">
      <h2><span class="font-serif"><span class="text-4xl lg:text-5xl">{{ heading }}</span></span></h2>
      <div class="rte">{{ subheading }}</div>
    </div>
  </div>

  <!-- Carousel -->
  <div class="container-wide">
    <div class="splide" data-magazine-carousel>
      <div class="splide__track">
        <ul class="splide__list">
          {% for article in articles %}
            <li class="splide__slide">
              {%- render 'magazine-card', article: article -%}
            </li>
          {% endfor %}
        </ul>
      </div>
    </div>

    <!-- Optional CTA button -->
    {% if button_label != blank %}
      <div class="flex justify-center pt-10">
        <a href="{{ button_link }}" class="...button classes...">
          <span>{{ button_label }}</span>
          <!-- chevron icon -->
        </a>
      </div>
    {% endif %}
  </div>

</section>
```

---

## Splide Carousel Config

Matches the repo exactly:

```js
{
  type: 'slide',
  perPage: 3,
  gap: '1.25rem',
  arrows: false,
  pagination: false,
  drag: true,
  breakpoints: {
    480:  { perPage: 1, padding: { left: 0, right: '15%' } },
    768:  { perPage: 2, padding: { left: 0, right: '10%' } },
    1024: { perPage: 3, padding: { left: 0, right: '10%' } }
  }
}
```

---

## Magazine Card Snippet (`snippets/magazine-card.liquid`)

Each card is an `<a>` linking to the article URL.

```
<a href="{{ article.url }}" class="group relative block h-max animate-fade-in opacity-0 transition-opacity duration-500">

  <!-- Image with dark overlay -->
  <div class="relative mb-5">
    <!-- Bottom gradient overlay -->
    <div class="pointer-events-none absolute inset-0 z-1 bg-gradient-to-b from-black/0 to-black/30"></div>
    <img
      src="{{ article.image | image_url: width: 800 }}"
      srcset="{{ article.image | image_url: width: 400 }} 400w,
              {{ article.image | image_url: width: 600 }} 600w,
              {{ article.image | image_url: width: 800 }} 800w"
      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
      alt="{{ article.title | escape }}"
      class="w-full"
      loading="lazy"
    />
  </div>

  <!-- Text content -->
  <div class="flex flex-col">
    {% if show_category and article.tags.size > 0 %}
      <p class="mb-1 text-xs tracking-wider text-taupe-700">
        {{ article.tags.first }}
      </p>
    {% endif %}

    <div class="mb-2">
      <h4 class="text-base font-bold lg:text-lg mb-2">
        {{ article.title }}
      </h4>
    </div>

    <p class="mb-0 flex items-center gap-1 text-sm tracking-wide">
      Read more
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
        <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
      </svg>
    </p>
  </div>

</a>
```

---

## Animation

Same InView / data-inview intersection observer pattern used in other sections:

- **Heading**: fade + translate up on scroll (`opacity-0 -translate-y-14` → `opacity-100 translate-y-0`)
- **Cards**: `animate-fade-in` on each card (opacity transition)
- Observer config: `{ threshold: 0.3, rootMargin: '0px 0px -20%' }`

---

## Section Settings

| ID | Type | Label | Default | Notes |
|---|---|---|---|---|
| `blog` | `blog` | Blog | — | Source blog for automatic mode |
| `article_count` | `range` (1–12) | Number of articles | `3` | Only used when no blocks added |
| `heading` | `text` | Heading | `The Magazine` | |
| `subheading` | `richtext` | Subheading | — | Body text below heading |
| `show_category` | `checkbox` | Show category tag | `true` | Displays first article tag as category |
| `button_label` | `text` | Button label | — | Leave blank to hide |
| `button_link` | `url` | Button link | — | |
| `margin_bottom` | `select` | Bottom margin | `large` | none / small / medium / large |
| `enable_animation` | `checkbox` | Enable animation | `true` | |

### Margin values (consistent with other sections)
- `none`: no class
- `small`: `mb-8`
- `medium`: `mb-8 lg:mb-14`
- `large`: `mb-14 lg:mb-20`

---

## Block Settings (type: `article`)

| ID | Type | Label | Notes |
|---|---|---|---|
| `article` | `article` | Article | Shopify article picker |

When **any blocks exist**, they override the blog setting. The section should iterate blocks instead of the blog's article list.

---

## Schema

```json
{
  "name": "Magazine articles",
  "tag": "section",
  "settings": [ ... ],
  "blocks": [
    {
      "type": "article",
      "name": "Article",
      "settings": [
        {
          "type": "article",
          "id": "article",
          "label": "Article"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Magazine articles"
    }
  ]
}
```

---

## Liquid Logic (data selection)

```liquid
{%- liquid
  if section.blocks.size > 0
    comment
      Manual mode — use block articles
    endcomment
  elsif section.settings.blog != blank
    comment
      Auto mode — pull latest from selected blog
    endcomment
    assign articles = section.settings.blog.articles | limit: section.settings.article_count
  endif
-%}
```

In manual mode, iterate `section.blocks` and access `block.settings.article` for each card.

---

## Files to Create

1. `sections/magazine-articles.liquid` — Section file (markup, JS, schema)
2. `snippets/magazine-card.liquid` — Article card snippet

## Dependencies

- `splide.min.css` (already in assets, used by hero-carousel and banner-cards)
- `Splide` JS (already loaded globally)

---

## Reference

- **Repo component**: `_reference/repo/app/components/blocks/magazineArticles.tsx`
- **Repo card**: `_reference/repo/app/components/partials/post/item.tsx`
- **Scraped homepage section**: `_reference/scraped/html/homepage.html` (search for `magazineArticles`)
- **CSS classes**: All Tailwind utilities already present in `assets/theme.css`
