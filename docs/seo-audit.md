# SEO Audit — Trendy Golf Shopify theme

**Date:** 2026-04-19
**Scope:** Theme-level SEO only (head meta, structured data, semantic HTML, analytics wiring). Off-page / content SEO (keyword strategy, backlinks, merchandising copy) is out of scope — that's the merchant's call.

**How Shopify splits SEO responsibilities** — context for the findings below:

| Layer | Who owns it | Where it lives |
| --- | --- | --- |
| Sitemap.xml | Shopify (auto) | `/sitemap.xml` — no code needed |
| robots.txt | Shopify default OR `robots.txt.liquid` override | We have **no override** → Shopify defaults apply ✅ |
| Product/article structured data | Theme | Via `{{ product \| structured_data }}` filter |
| Open Graph / Twitter meta | Theme | Manually added to `<head>` |
| Canonical, title, description | Theme + admin SEO fields | `page_title`, `page_description`, `canonical_url` |
| Analytics / pixels | **Admin-side Customer Events** (preferred) or hardcoded | Currently **hardcoded GTM** — see P0-5 below |
| Structured data for Organization / WebSite | Theme | Not present |

---

## 🔴 P0 — critical, directly block rich results & social previews

### P0-1. No Product structured data (JSON-LD)
**File:** [sections/product-template.liquid](sections/product-template.liquid)
**Status:** missing entirely.

Shopify's `structured_data` filter outputs a valid `schema.org/Product` payload with price, availability, currency, brand — exactly what Google needs for rich product cards in search. [article-template.liquid:107](sections/article-template.liquid#L107) already uses it on articles; products don't.

**Fix:** add at the bottom of the template:
```liquid
<script type="application/ld+json">{{ product | structured_data }}</script>
```

### P0-2. No Open Graph / Twitter Card meta tags
**File:** [layout/theme.liquid:3-59](layout/theme.liquid#L3-L59)

Social shares (Facebook, LinkedIn, iMessage, Slack, WhatsApp, Twitter/X) currently render with no image, no title, no description — they'll fall back to the bare URL. Critical for product-sharing, magazine article sharing.

**Fix:** add to `<head>`, page-type-aware:
```liquid
<meta property="og:site_name" content="{{ shop.name }}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:title" content="{{ page_title | default: shop.name }}">
<meta property="og:description" content="{{ page_description | default: shop.description | escape }}">
<meta property="og:type" content="{% if template contains 'product' %}product{% elsif template contains 'article' %}article{% else %}website{% endif %}">
{%- if template contains 'product' and product.featured_image -%}
  <meta property="og:image" content="{{ product.featured_image | image_url: width: 1200 }}">
{%- elsif template contains 'article' and article.image -%}
  <meta property="og:image" content="{{ article.image | image_url: width: 1200 }}">
{%- elsif settings.social_share_image -%}
  <meta property="og:image" content="{{ settings.social_share_image | image_url: width: 1200 }}">
{%- endif -%}
<meta name="twitter:card" content="summary_large_image">
```

Needs a new `social_share_image` setting in `config/settings_schema.json` for the default fallback.

### P0-3. No homepage `<h1>`
**File:** [templates/index.json:21](templates/index.json#L21)

Hero slide 1 is configured with `heading_size: h3`. Carousel rotates through slides — Googlebot only sees the first-rendered state, so the homepage has no `<h1>` at all.

**Fix:** set slide 1's `heading_size` to `h1` in the theme editor (no code change needed), OR hardcode slide 1 to always render as H1 regardless of editor choice in [sections/hero-carousel.liquid:152](sections/hero-carousel.liquid#L152).

### P0-4. Article template has no `<h1>`
**File:** [sections/article-template.liquid:63-67](sections/article-template.liquid#L63-L67)

```liquid
<p>
  <span class="font-serif">
    <span class="text-3xl lg:text-4xl">{{ article.title }}</span>
  </span>
</p>
```

Every magazine article is missing the single most important on-page SEO signal. This is the scraped markup verbatim — the source site has the same issue but that's not a reason to keep it.

**Fix:** replace wrapper `<p>` with `<h1>`, preserve styling via classes.

### P0-5. GTM hardcoded in theme
**File:** [layout/theme.liquid:41-49, 62-66](layout/theme.liquid#L41)

GTM ID `GTM-5G4N4PSK` is inlined in the theme and fires before Shopify's consent banner. Shopify's guidance (post-2023) is to use **Customer Events** in admin (Settings → Customer events) for all pixels/analytics:

- respects merchant's consent banner (GDPR/CCPA)
- sandboxed — no direct DOM access, safer
- survives theme swaps
- no risk of double-firing with app-installed pixels

**Fix:** remove the GTM block from `theme.liquid`, recreate the equivalent in admin → Customer Events → Add custom pixel. Keep the `gtm_id` setting so merchants can see what they've used historically, or delete it entirely. **Confirm with client before removing** — they may have GTM tags scoped to the theme-level install.

---

## 🟠 P1 — high priority

### P1-1. No Organization / WebSite JSON-LD
**File:** [layout/theme.liquid](layout/theme.liquid)

Adding site-level structured data unlocks Google's knowledge panel branding (logo, social profiles) and sitelinks searchbox. One-time add to the head:

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": {{ shop.name | json }},
  "url": {{ shop.url | json }},
  "logo": {{ settings.logo | image_url: width: 600 | prepend: 'https:' | json }},
  "sameAs": [ /* Instagram, Facebook, TikTok URLs from settings */ ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": {{ shop.url | json }},
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{{ shop.url }}/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### P1-2. Collection pages missing Breadcrumb JSON-LD
**File:** [sections/collection-template.liquid](sections/collection-template.liquid)

Articles have BreadcrumbList ([article-template.liquid:41-51](sections/article-template.liquid#L41-L51)) — collections don't. Also worth adding a visible breadcrumb trail (Home › Men › Apparel) for UX, which collections currently lack.

### P1-3. Product pages missing BreadcrumbList
**File:** [sections/product-template.liquid](sections/product-template.liquid)

Same issue — no breadcrumb structured data. Breadcrumbs appear in Google SERP result snippets, improves click-through.

### P1-4. Lipscore review data not in Product JSON-LD
Once P0-1 is in, enhance it: if Lipscore rating is available (currently fetched client-side), inject `aggregateRating` into the Product JSON-LD server-side or via a second `<script>` that Google will merge. This unlocks star ratings in SERPs — big CTR win for product pages.

**Note:** Lipscore data is fetched client-side from [product-template.liquid:833](sections/product-template.liquid#L833). Google may crawl it (they render JS) but server-side is more reliable. Check if Lipscore offers a Liquid/metafield sync.

### P1-5. Lipscore API credentials exposed in public JS
**File:** [sections/product-template.liquid:729-730](sections/product-template.liquid#L729-L730)

```js
var API_KEY = '42635f2f546fb8b0f2f54f73';
var SECRET = '128517e0951cc7a7b801a5e57b78b646';
```

This is a **security issue, not an SEO one**, but worth flagging alongside. If `SECRET` is write-capable (it's sent as `X-Authorization` header), anyone viewing source can impersonate the store. **Client question:** confirm with Lipscore support whether this secret is read-only or read-write; if the latter, we need a server-side proxy.

---

## 🟡 P2 — medium priority

### P2-1. Product page heading hierarchy
**File:** [sections/product-template.liquid:83-87](sections/product-template.liquid#L83-L87)

Vendor is wrapped in `<h4>`, product title in `<h1>` — H4 appears before H1 in document order. Crawlers expect H1 to be the first structural heading.

**Fix:** change vendor `<h4>` → `<p class="...">` (styling only, not semantic heading).

### P2-2. Two `<h1>`s on shoe-detail page
**File:** [sections/shoe-detail.liquid:37, 247](sections/shoe-detail.liquid#L37)

Only one `<h1>` per page. One of these should become `<h2>`.

### P2-3. Alt text — hardcoded or unhelpful
- [sections/shoe-finder.liquid:164](sections/shoe-finder.liquid#L164) — `alt="{{ product.handle }}"` (handle = URL-slug, not human-readable)
- [sections/shoe-detail.liquid:91,118,145](sections/shoe-detail.liquid#L91) — `alt="Feature 1"`, `alt="Feature 2"`, `alt="Feature 3"` (hardcoded, meaningless)
- [sections/shop-the-look.liquid:36](sections/shop-the-look.liquid#L36) — `alt="{{ section.settings.title | escape }}"` (reuses section title, so all shop-the-look images share one alt)

**Fix:** add per-image alt settings, or fall back to `image.alt | default: product.title | default: section.settings.heading`.

### P2-4. Google Fonts render-blocking
**File:** [layout/theme.liquid:35](layout/theme.liquid#L35)

Current load is synchronous — blocks first paint. Options (pick one):
- **Host fonts locally** (download Oxygen + Playfair, serve from `assets/`, preload the most-used weights). Cleanest long-term.
- **Async pattern**: `<link rel="preload" as="style" onload="this.rel='stylesheet'">` with `<noscript>` fallback.

Affects Lighthouse perf (LCP, FCP), which also affects SEO rankings via Core Web Vitals.

---

## 🟢 P3 — polish / confirmations

### P3-1. Password overlay is cosmetic, not secure
**File:** [layout/theme.liquid:68-114](layout/theme.liquid#L68-L114)

The JS password gate is bypassable (view source, sessionStorage key is exposed) — more importantly, Google can still crawl & index the HTML because the overlay is CSS-hidden, not server-rendered. **If** the theme's running live but pre-launch and indexing is undesirable: set `<meta name="robots" content="noindex">` while password overlay is active, OR use Shopify's native storefront password (admin → Preferences) which returns the proper HTTP 401.

### P3-2. Confirm after launch
- [ ] Submit `/sitemap.xml` to Google Search Console
- [ ] Verify domain ownership in Search Console + Bing Webmaster
- [ ] Set canonical locale if multi-region (currently not — single UK store)
- [ ] Check `_report/lighthouse/home-desktop.report.json` for any SEO-category failures the audit missed

### P3-3. Things that are correct — no action needed
- ✅ `<link rel="canonical">` ([theme.liquid:26](layout/theme.liquid#L26))
- ✅ Search page `noindex` ([theme.liquid:22-24](layout/theme.liquid#L22-L24))
- ✅ `<title>` template pattern (page_title + shop.name + pagination suffix)
- ✅ `<meta name="description">` with escape
- ✅ `<html lang>` set from `request.locale.iso_code`
- ✅ Favicon via `settings.favicon`
- ✅ Sitemap auto-generated by Shopify at `/sitemap.xml` (no override needed)
- ✅ Default robots.txt (no `robots.txt.liquid` override — correct)
- ✅ 404 template returns proper HTTP 404
- ✅ Article structured data via `structured_data` filter
- ✅ Article breadcrumb JSON-LD present
- ✅ Most section `<h1>`s correctly placed
- ✅ Product images have width/height + lazy loading (good for CLS)

---

## Recommended implementation order

Single PR scope — cheap, mechanical, low-risk:
1. P0-1: Product JSON-LD (one line)
2. P0-2: OG/Twitter tags + `social_share_image` setting
3. P0-4: Article H1 fix
4. P1-1: Organization + WebSite JSON-LD
5. P2-1, P2-2: heading hierarchy fixes
6. P2-3: alt text fixes

**Hold for client confirmation:**
- P0-5 GTM migration (needs their input on whether they have other GTM tags in admin already)
- P1-5 Lipscore secret (needs Lipscore support clarification)
- P0-3 homepage H1 (editor-level change, they can do it or we can)

**Separate PR:**
- P2-4 font loading (bigger change, affects visual rendering, wants its own test cycle)
- P1-4 Lipscore aggregateRating (needs Lipscore API work)

---

## Testing after changes

- Google [Rich Results Test](https://search.google.com/test/rich-results) — paste product URL, verify Product schema passes
- Facebook [Sharing Debugger](https://developers.facebook.com/tools/debug/) — OG tags
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — OG tags (LinkedIn caches aggressively)
- Lighthouse SEO audit — should score 95+ after fixes
- Manual: view source on a product page, a collection page, an article, the homepage — verify expected JSON-LD + OG tags render
