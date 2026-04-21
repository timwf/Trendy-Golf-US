# TrendyGolf UK — Shopify Theme Build Plan

## Approach

**Clean Shopify 2.0 theme from scratch** — not a Dawn fork. The source site is 100% Tailwind CSS with Splide.js carousels. Building from scratch lets us drop the scraped HTML markup almost directly into Liquid templates without fighting Dawn's opinions.

**Dawn as reference only** — cherry-pick Liquid patterns for cart API, predictive search, customer account forms, etc. when needed. Don't fork or inherit its structure.

**Shopify MCP** — **REQUIRED for every phase.** Use throughout the build for:
- `search_docs_chunks` / `fetch_full_docs` — look up Liquid tags, filters, objects, and section schema before writing any template code
- `validate_theme` — run after building/editing any theme file to catch errors early
- `validate_graphql_codeblocks` — validate any Admin API or Storefront API queries
- `introspect_graphql_schema` — check available fields/types when working with Shopify APIs
- `learn_shopify_api` — reference Cart API, Product API, Collection API, etc. before implementing JS or Liquid that touches them

**Every sub-phase must use Shopify MCP** to validate Liquid syntax, confirm schema structure, and verify API usage — do not skip this step.

**Staging store:** `trendy-golf-development.myshopify.com` — custom app installed with Admin API access token, API key, and secret. Credentials stored in `.env` (gitignored). Use the Admin API token for theme pushes, product queries, and testing.

**Deployment:** Repo connected to staging store via Shopify GitHub integration. Pushes to `main` auto-sync to the theme. No `shopify theme push` needed — just commit and push.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **CSS** | Tailwind CSS (CLI) | Compile with custom config matching source site tokens. Ship compiled CSS in `assets/` |
| **Carousel** | Splide.js | Already used on source site. Vanilla JS, no React dependency |
| **JS** | Vanilla JS | Drawer toggles, filter logic, carousel init, cart AJAX. No framework |
| **Templating** | Liquid + JSON templates | Shopify 2.0 sections-everywhere architecture |
| **Icons** | Inline SVG snippets | Source site uses Heroicons (chevrons, heart, user, trash, etc.) |

---

## Theme File Structure

```
theme/
├── assets/
│   ├── theme.css                  # Compiled Tailwind output
│   ├── splide.min.js              # Splide carousel library
│   ├── splide.min.css             # Splide base styles
│   ├── theme.js                   # Main JS (drawers, filters, cart, etc.)
│   └── fonts/                     # Playfair Display + Oxygen (self-hosted)
│
├── config/
│   ├── settings_schema.json       # Global theme settings (colours, fonts, socials, GTM ID, etc.)
│   └── settings_data.json         # Default values
│
├── layout/
│   └── theme.liquid               # Main layout — head, header, footer, cart drawer, overlays
│
├── templates/
│   ├── index.json                 # Homepage
│   ├── collection.json            # Collection pages
│   ├── product.json               # Product pages
│   ├── blog.json                  # Magazine listing
│   ├── article.json               # Magazine article
│   ├── page.json                  # Default page
│   ├── page.contact.json          # Contact page
│   ├── page.rewards.json          # Rewards/TGCC page
│   ├── page.shoe-finder.json      # Shoe finder quiz
│   ├── page.brands.json           # Brands listing
│   ├── page.brand-landing.json    # Individual brand page
│   ├── page.launches.json         # Launches listing
│   ├── page.trendygolf-stores.json        # Flagship stores landing
│   ├── page.trendygolf-canary-wharf.json  # Canary Wharf flagship
│   ├── page.trendygolf-manchester.json    # Manchester flagship
│   ├── page.corporate.json                # Corporate / custom golf apparel enquiry
│   ├── cart.json                  # Cart page (fallback for drawer)
│   ├── search.json                # Search results
│   ├── customers/login.json       # Login
│   ├── customers/register.json    # Register
│   ├── customers/account.json     # Account dashboard
│   ├── customers/order.json       # Order detail
│   └── 404.json                   # Not found
│
├── sections/
│   ├── header.liquid              # Header + mega menu + mobile nav
│   ├── announcement-bar.liquid    # Announcement bar
│   ├── footer.liquid              # Footer (4 columns + newsletter + socials)
│   ├── cart-drawer.liquid         # Slide-out cart drawer
│   ├── hero-carousel.liquid       # Banner carousel (Splide, supports video)
│   ├── banner-cards.liquid        # Feature/promo card grid
│   ├── product-carousel-tabs.liquid # Tabbed product showcase ("This Season's Highlights")
│   ├── content-block.liquid       # Rich text + CTA content section
│   ├── logo-marquee.liquid        # Brand logo ticker
│   ├── magazine-articles.liquid   # Magazine article grid
│   ├── social-grid.liquid         # Social/Instagram grid
│   ├── collection-template.liquid # Collection page layout (grid + filters + sort)
│   ├── product-template.liquid    # PDP layout (images, variants, details, size guide)
│   ├── blog-template.liquid       # Blog listing layout
│   ├── article-template.liquid    # Article layout
│   ├── rewards-hero.liquid        # Rewards page hero
│   ├── rewards-tiers.liquid       # Rewards tier comparison table
│   ├── shoe-finder.liquid         # Shoe finder quiz
│   ├── contact-form.liquid        # Contact form
│   ├── brand-grid.liquid          # Brands page card grid
│   ├── brand-hero.liquid          # Brand landing hero
│   ├── launch-list.liquid         # Launches listing
│   ├── fifty-fifty.liquid         # Alternating image+text rows (flagship stores)
│   ├── content-columns.liquid     # Multi-column image + title + body grid (custom apparel)
│   ├── main-content.liquid         # Generic page content ({{ page.content }})
│   └── product-explore-more.liquid # "Explore more" product recommendations
│
├── snippets/
│   ├── product-card.liquid        # Product card (image, hover swap, swatches, price)
│   ├── colour-swatch.liquid       # Colour swatch dot
│   ├── price.liquid               # Price display (sale/compare)
│   ├── icon.liquid                # SVG icon renderer
│   ├── image.liquid               # Responsive image helper
│   ├── pagination.liquid          # Load more / pagination
│   ├── breadcrumb.liquid          # Breadcrumb nav
│   ├── mega-menu-dropdown.liquid  # Mega menu dropdown panel
│   ├── filter-sidebar.liquid      # Collection filter panel
│   ├── size-guide-drawer.liquid   # Size guide slide-out
│   └── social-links.liquid        # Social media links
│
├── blocks/
│   ├── carousel-slide.liquid      # Individual carousel slide (image/video + CTA)
│   ├── banner-card.liquid         # Individual banner/promo card
│   ├── product-detail-row.liquid  # Expandable product detail (accordion)
│   ├── tier-column.liquid         # Rewards tier column
│   ├── quiz-step.liquid           # Shoe finder quiz step
│   └── logo-item.liquid           # Brand logo for marquee
│
└── locales/
    ├── en.default.json            # English translations
    └── en.default.schema.json     # Schema translations
```

---

## Build Process

→ [docs/build-playbook.md](docs/build-playbook.md) — full playbook with parallel audit rounds

Every sub-phase follows four phases:

1. **Scope & Decisions** — audit references (scraped HTML first), create spec doc, identify settings, flag client questions
2. **Three Audit Rounds** — parallel styling + functionality agents review the spec against source and Shopify MCP, fixes applied after each round
3. **Build** — markup & classes first (styling wins), JS second, schema last
4. **Validate** — `validate_theme`, visual comparison, functional testing, build notes

Status key: `[ ]` not started · `[~]` in progress · `[x]` complete

---

## Phase 1 — Foundation

> Get a deployable theme onto the staging Shopify store ASAP, then layer in styling and components.

→ [docs/foundation.md](docs/foundation.md)

### 1A — Staging Skeleton `[x]`
Minimal valid layout, settings schema, defaults, index template. Theme loads on staging.

### 1B — Tailwind Setup & Colour Extraction `[x]`
Custom colour tokens, font families, Tailwind CLI build, compiled CSS wired into layout.

### 1C — Header & Mega Menu `[x]`
→ [docs/header.md](docs/header.md)

Header with transparent/solid variants, 3-level mega menu (CSS hover on desktop, JS slide panels on mobile), announcement bar, icon snippet, search overlay.

### 1D — Footer `[x]`
→ [docs/footer.md](docs/footer.md)

4-column footer, social icons, payment icons, legal bar. Newsletter deferred to Phase 7A.

### 1E — Cart Drawer `[x]`
→ [docs/cart-drawer.md](docs/cart-drawer.md)

Slide-out cart with line items, upsells. AJAX add/remove/update via Shopify Cart API. Rebuy trending → Shopify Recommendations → curated collection fallback. Toast notifications on add-to-cart. **Client needs to provide Rebuy API key.**

### 1F — Shared JS & Icons `[ ]` *(deferred — build after 1E)*
Unified `Drawer` class (focus trap, escape, overlay, scroll lock). Wire cart drawer + mobile nav.

---

## Phase 2 — Collection & Product (Revenue-critical)

> Build order: 2A → 2B → 2C, then circle back to 1E → 1F.

### 2A — Product Card & Price `[x]`
→ [docs/product-card.md](docs/product-card.md)

Product card with hover image swap, colour swatches (separate products per colour linked by `product_display_name` metafield), price snippet with sale/sold-out states.

### 2B — Collection Page `[x]`
→ [docs/collection.md](docs/collection.md)

Collection template with product grid, colour grouping/deduplication, quick-links from metafield, native filter sidebar (offcanvas), sort dropdown, "Load more" pagination.

### 2C — Product Page `[x]`
→ [docs/product-page.md](docs/product-page.md)

- 2C-i — Product Template Shell & Image Gallery `[x]`
- 2C-ii — Product Info & Variant Selector `[x]`
- 2C-iii — Add to Cart & Size Guide `[x]`
- 2C-iv — Product Details Accordion `[x]`
- 2C-v — Schema, Locales & Validation `[x]`

---

## Phase 3 — Sections

### 3A — Hero & Banner Sections `[x]`
Hero Splide carousel with video support + CTA overlays. Promo banner card grid. Also serves as page hero (single slide).

**Reference:** `_reference/scraped/html/homepage.html`, `_reference/scraped/data/stream/homepage-route-routes-_index.json`, `_reference/scraped/assets/js/carousel-D_0VfbSB.js`

### 3B — Product Carousel & Content `[x]`
Tabbed product collections carousel ("This Season's Highlights"). Rich text + CTA content block. Content block also covers rich-text section use case.

**Reference:** `_reference/scraped/html/homepage.html`, `_reference/scraped/data/stream/homepage-route-routes-_index.json`

### 3C — Marquee, Magazine & Social `[x]`
Auto-scrolling brand logo ticker. Magazine article grid. Social/Instagram grid.

**Reference:** `_reference/scraped/html/homepage.html`, `_reference/scraped/data/stream/homepage-route-routes-_index.json`

---

## Phase 4 — Content Pages

### 4A — Rewards `[~]`
→ [docs/rewards.md](docs/rewards.md)

Upzelo-powered TGCC loyalty programme. Rebuild the custom UI (marketing page tier table, global rewards modal, cart drawer wiring, account rewards dashboard) around the Upzelo app embed. Launcher + HMAC auth handled by Upzelo's Shopify app (already installed + enabled on staging). Liquid reads `customer.metafields.upzelo.points/tier/active_rewards` directly; JS fetches activity feed from `app.upzelo.com/api/loyalty/*` for history pagination.

- 4A-i — Tier table section `[x]`
- 4A-ii — Global rewards modal `[x]` — `snippets/rewards-modal.liquid` + theme settings ("Rewards" group) + rendered from `layout/theme.liquid`. Opens on `openRewardsModal` window event.
- 4A-iii — Cart drawer wiring `[x]` — logged-out "Learn more" → modal event; logged-in "TGCC Rewards" → `window.upzelo.toggle()`. Delegated handlers in `assets/theme.js` survive section re-render.
- 4A-iv — Public rewards page template `[x]`
- 4A-v — Account rewards dashboard `[~]` — owned by the accounts workstream. The /pages/rewards layout stays as marketing for everyone; logged-in customers are redirected to `/account#rewards` via a tiny inline script in `layout/theme.liquid` (head). Sidebar "Rewards" link points at `/account#rewards`. The actual rewards view inside /account is built in the accounts branch.
- 4A-vi — Polish/QA `[ ]` — needs live test once published: cart "Learn more" opens modal (logged out), cart "TGCC Rewards" opens Upzelo widget (logged in), `/pages/rewards` redirects logged-in customers to `/account#rewards`.

**Reference:** `_reference/scraped/html/rewards.html`, `_reference/scraped/data/stream/rewards-route-routes-$.json`, `_reference/repo/app/routes/account.rewards.tsx`, `_reference/repo/app/components/blocks/rewardsTierTable.tsx`, `_reference/repo/app/utils/upzelo.ts`

### 4B — Shoe Finder `[~]`
→ [docs/shoe-finder.md](docs/shoe-finder.md)

Multi-step quiz → filtered results grid → AJAX product detail modal. Quiz (4B-i), results grid (4B-ii), shoe detail section (4B-iii-a), and modal shell with AJAX loading (4B-iii-b) all complete. Google Drive `png_image` URLs converted to `lh3.googleusercontent.com` embed format in Liquid. Polish & validation (4B-iv) remaining.

**Reference:** `_reference/scraped/html/shoe-finder.html`, `_reference/scraped/data/stream/shoe-finder-route-routes-shoe-finder.json`

### 4C — Brands & Brand Landing `[~]`
→ [docs/design/brand-listing.md](docs/design/brand-listing.md) (A-Z listing spec)

- 4C-i — Brand A-Z listing `[x]` — `page.brand-listing.json` template + `brand-listing` section + `brand-card` snippet. Reads live `metaobjects.brand.values` (34 entries on production). Alphabet tabs + debounced search, "Other" group fallback.
- 4C-ii — Brand landing pages `[ ]` — individual brand heroes (e.g. `/brands/nike`) with filtered collection.

**Reference:** `_reference/scraped/html/brands.html`, `_reference/scraped/html/brand-*.html`

### 4D — Launches, Contact, Flagship, Standard Pages `[~]`
→ [docs/launches.md](docs/launches.md) (launches spec) · [docs/flagship.md](docs/flagship.md) (flagship spec)

Launch list, contact form, flagship stores (3 pages — landing + Canary Wharf + Manchester), rich text + page hero sections. Default page template (`page.json`) and styled `main-content` section with `page-content` wrapper done. Launches spec created. Flagship spec created — composes from existing sections + one new `fifty-fifty.liquid` section.

**Reference:** `_reference/scraped/html/contact.html`, `_reference/scraped/html/flagship-*.html`, `_reference/scraped/html/launches.html`

### 4E — Help Centre `[ ]`
→ [docs/help-centre.md](docs/help-centre.md)

Help Centre page: banner hero + 4-up icon grid + filterable FAQ accordion + contact form. Template filename `page.faq.json` to marry up with live store's existing page assignment on publish. New sections: `icon-grid`, `faq-accordion` (metaobject-driven). FAQ content + hero image from client.

**Reference:** `_reference/scraped/html/help-centre.html`, `_reference/scraped/data/stream/help-centre-route-routes--.json`, `_reference/repo/app/components/blocks/iconGrid.tsx`, `_reference/repo/app/components/blocks/faqBlock.tsx`

### 4F — Corporate (Custom Golf Apparel) `[ ]`
→ [docs/custom-golf-apparel.md](docs/custom-golf-apparel.md)

Page title "Corporate" — `page.corporate.json` template. Marketing + enquiry page for custom/bulk apparel service. Four blocks: hero-carousel, 6-up content-columns grid ("What we offer"), icon-grid ("How it Works"), contact-form (corporate enquiries). One new section: `content-columns.liquid` (repeatable image + title + body blocks). Client to create new `/pages/corporate` page + add `/custom-golf-apparel → /pages/corporate` redirect + update footer menu.

**Reference:** `_reference/scraped/html/custom-golf-apparel.html`, `_reference/scraped/data/stream/custom-golf-apparel-route-routes--.json`

---

## Phase 5 — Blog / Magazine

### 5A — Blog & Article Templates `[ ]`
Blog listing layout + individual article layout.

**Reference:** `_reference/scraped/html/magazine.html`, `_reference/scraped/html/magazine-article-*.html`

---

## Phase 6 — Account & Search

### 6A — Customer Accounts `[ ]`
→ [docs/accounts.md](docs/accounts.md)

Login, register, account dashboard, order history, address book, password reset, activate account. Seven templates total using Shopify's standard `{% form 'customer_*' %}` tags. Two-column gate layout for login/register (rewards panel + form). Sidebar + main content on dashboard.

**Reference:** `_reference/scraped/html/account.html`, `_reference/scraped/html/account-login.html`

### 6B — Search & 404 `[~]`
Predictive search + search results page. 404 page `[x]` — `templates/404.json` + `sections/not-found.liquid` mirror the source site's Remix `ErrorBoundary` ("Out of bounds" headline, full-bleed `golf-green.jpg`, "Back to home" CTA). Image shipped as `assets/404-golf-green.jpg`; section exposes editor overrides for heading, body, button label/URL, and background image.

**Reference:** `_reference/scraped/html/search-results.html`

---

## Phase 7 — Polish & Integrations

### 7A — Third-party Integrations `[ ]`
Klaviyo (newsletter, back-in-stock), Kiwi Sizing, GTM, Wishlist.

### 7B — Performance & QA `[ ]`
Lazy loading, critical CSS, image optimisation, accessibility, responsive QA.

---

## Key Patterns

### Drawer/Modal Pattern (reused across cart, filters, size guide, mobile nav)

```
Panel:    fixed [left|right]-0 top-0 z-[N] ... translate-x-full (hidden) → translate-x-0 (visible)
Overlay:  fixed inset-0 z-[N-1] bg-black/50 opacity-0 (hidden) → opacity-100 (visible)
```

### Carousel Pattern (Splide)

All carousels use Splide with varying configs:
- **Hero:** autoplay, fade/slide, video support, pagination dots
- **Product images (mobile):** 1 perPage, counter, swipe
- **Product carousel:** 4-col desktop, 2-col mobile, arrows
- **Logo marquee:** autoplay, continuous scroll, no controls

### Section Schema Pattern

Every section needs `{% schema %}` with: `name` (translatable), `settings`, `blocks` (repeatable items), `presets` (editor addable).

---

## Source Reference Map

All paths relative to `_reference/scraped/`:

| Theme Component | HTML Reference | Data Reference | JS Reference |
|----------------|---------------|----------------|--------------|
| Header + Mega Menu | `html/homepage.html` | `data/stream/_navigations.json` | `assets/js/components-DudDNmcZ.js` |
| Footer | `html/homepage.html` | `data/stream/_navigations.json`, `data/stream/_settings.json` | — |
| Cart Drawer | `html/collection-mens-apparel.html` | `data/stream/cart-route-routes-cart.json` | `assets/js/cart-DztgkzCz.js` |
| Collection Page | `html/collection-mens-apparel.html` | `data/stream/collection-*-route-*.json` | `assets/js/filtersOffcanvas-YN9Z-5GC.js`, `assets/js/collections-CZuVGFWH.js` |
| Product Page | `html/product-polo.html` | `data/stream/product-polo-route-*.json` | `assets/js/useVariants-Cjg2tlM0.js`, `assets/js/productCarousel-BOAptad1.js` |
| Homepage Carousel | `html/homepage.html` | `data/stream/homepage-route-routes-_index.json` | `assets/js/carousel-D_0VfbSB.js` |
| Product Card | `html/collection-mens-apparel.html` | — | `assets/js/colourSwatch-DOHlnrKs.js`, `assets/js/card-BvMkuDS6.js` |
| Rewards Page | `html/rewards.html` | `data/stream/rewards-route-routes-$.json` | `assets/js/rewardsPopup-C2PP3UDb.js` |
| Shoe Finder | `html/shoe-finder.html` | `data/stream/shoe-finder-route-routes-shoe-finder.json` | `assets/js/shoe-finder-C793lMT2.js` |
| Brand Pages | `html/brand-*.html` | `data/stream/brand-*-route-*.json` | — |
| Magazine | `html/magazine.html` | `data/stream/magazine-route-routes-$.json` | `assets/js/magazine_._slug-BpbqEaKF.js` |
| Search | `html/search-results.html` | `data/stream/search-results-route-*.json` | `assets/js/products-CaWRon2W.js` |
| Filters | `html/collection-mens-apparel.html` | — | `assets/js/filtersOffcanvas-YN9Z-5GC.js` |
| Size Guide | `html/product-polo.html` | — | `assets/js/modal-DQdNT-Xv.js` |
