# TrendyGolf UK — Headless to Shopify Migration

## Source Site
- **URL:** https://trendygolfuk.tdrstaging.co.uk/
- **Shopify store:** trendy-golf-development.myshopify.com
- **Stack:** Remix (React SSR) + Shopify Storefront API + Sanity CMS (project: 482gpifr)
- **Frontend:** Tailwind CSS (utility-first — all styling is in HTML class attributes, not a separate stylesheet)
- **Carousel lib:** Splide.js
- **Goal:** Scrape everything → build identical Shopify 2.0 theme based on Dawn
- **Design reference:** Figma (available separately)

## Approach
- **Theme build:** Fork Dawn, build out with full section schemas, settings, menu selects etc.
- **Templates are templates:** Product, collection, blog article, blog listing, cart — these are Shopify-driven. We need the HTML/CSS structure, NOT the content.
- **Content pages need content:** Homepage sections, rewards, shoe finder, launches, brands, contact, info pages — CMS content needs scraping and migrating.
- **Products/collections/articles** are already in (or will be entered into) Shopify. No data migration needed for those.

---

## Scrape Status

### Completed
- [x] **62 HTML pages** scraped (saved to `_reference/scraped/html/`)
- [x] **110 stream data files** decoded with route-specific JSON (saved to `_reference/scraped/data/stream/`)
- [x] **152 JS files** downloaded (1.7MB total) — all Remix chunks including UI components (saved to `_reference/scraped/assets/js/`)
- [x] CSS downloaded: `root-D6YYcCum.css` (62KB Tailwind build), `carousel-_uKa6oH9.css` (1.8KB Splide)
- [x] Fonts downloaded: Playfair Display (400/600/700), Oxygen (400/700) — 32 files
- [x] Favicons/icons downloaded
- [x] Sitemaps saved (pages, launches, magazine, products, collections)
- [x] Navigation structure extracted — full mega menu 3 levels deep
- [x] Site settings extracted (title, tagline, GTM ID, nav refs)
- [x] Homepage blocks extracted — 11 section types
- [x] Collection template data (filters, sorting, product cards)
- [x] Product template data (PDP structure, variants, details)
- [x] Magazine articles x3 (template reference)
- [x] Launch pages x2 (template reference)
- [x] Account pages (login, register, account)
- [x] Cart page
- [x] All info pages (help-centre, delivery, returns, terms, privacy-policy)
- [x] All brand pages — 10 total (nike, ralph-lauren, jlindeberg, g-fore, manors, puma, adidas-originals, apc, head, manorsv2)
- [x] Flagship store pages (main, canary-wharf, manchester)
- [x] Content pages (about-us, careers, corporate, custom-golf-apparel, tglab, store, golf-shoes, rewards, shoe-finder, womens-brands)

### Known Issues
- Privacy policy stream data fails to parse (unterminated string in legal text) — HTML is saved, content readable from HTML
- Search page is at `/products?q=` (not `/search`) — scraped with `q=red`
- Gift card product 404 (may be unpublished on staging)

### Content Discovery (from sitemaps)
- **32 pages** in sitemap-pages.xml — all scraped
- **98 launches** in sitemap-launches.xml — 2 scraped for template reference, rest are template-driven
- **152 magazine articles** in sitemap-magazine.xml — 3 scraped for template reference, rest are template-driven
- Products and collections — template-driven, already in Shopify

---

## Templates Needed (Shopify 2.0 — based on Dawn)

### Shopify-driven templates (data from Shopify, we build the layout)
| Template | Source Page | Key Features |
|----------|-----------|--------------|
| **Collection** | `/collections/*` | Category quick-links bar, sidebar filters (brand/type/color/size/price/availability), 3-4 col grid, hover image swap, color swatches on cards, "Load more", sort (latest/price asc/desc) |
| **Product (PDP)** | `/products/*` | Image carousel + thumbnails, variant selector (size dropdown + color swatches), size guide (Kiwi Sizing), "Add to basket", delivery countdown, expandable details (features/fabric/style code), shipping/returns info |
| **Blog listing** | `/magazine` | Article lister, hero images (1800x1200), brand spotlights, full-width content blocks |
| **Blog article** | `/magazine/*` | Individual article template — need to scrape one for reference |
| **Cart** | (drawer) | Cart drawer — need to capture |
| **Search results** | `/search` | Need to capture |
| **Account** | `/account/*` | Login, register, order history — need to capture |

### Content-driven templates/pages (need actual content scraped)
| Template | Source Page | Key Features |
|----------|-----------|--------------|
| **Homepage** | `/` | Hero carousel (video), tabbed product highlights, brand spotlights, brand logo marquee, social grid, rewards CTA |
| **Launches** | `/launches` | Launch lister with release dates, pre-release/post-release states, possible countdown timers |
| **Brands** | `/brands` | Card grid with images, links to brand collections |
| **Brand Landing** | `/brands/:handle` | Brand hero, filtered collection |
| **Rewards (TGCC)** | `/pages/rewards` | Hero banner, how-it-works icon grid, 4-tier comparison table (Bronze/Silver/Gold/Black), join CTA |
| **Shoe Finder** | `/shoe-finder` | 4-step quiz (gender → spike type → style → color), image-based answers, results display |
| **Contact** | `/pages/contact` | Contact info, form (name/email/phone/order#/message), business hours |
| **Standard Pages** | `/pages/*` | Privacy, T&Cs, delivery, returns — basic rich-text content |

## Shared Sections/Components (all need section schemas)

- **Header** — mega menu with menu selects, logo, search, wishlist, cart icon, account link
- **Announcement bar** — configurable text/link
- **Mega menu** — multi-level nav with brand logos, collection links per gender
- **Footer** — 4-column (Customer Service, TGCC, About, Legal) + newsletter (Klaviyo) + social links
- **Country/region selector**
- **Search** (predictive search)
- **Wishlist**
- **Cart drawer**

## Navigation Map (from Sanity, resolved in `_reference/scraped/data/stream/_navigations.json`)

| Nav ID | Sanity Ref | Purpose |
|--------|-----------|---------|
| Nav #2 (508aaab3) | primaryNavigation + mobileNavigation | Main mega menu: Men → Women → Footwear → Launches → Magazine → Shoe Finder (3 levels deep with all subcategories) |
| Nav #3 (a81f9aae) | footerNavigationColOne | Customer Service: Help Centre, Contact, Delivery, Returns |
| Nav #0 (1a111e0b) | (footer col - about) | About: About Us, Brands, Flagship Stores, Careers, Corporate |
| Nav #1 (2e208c5f) | (footer col - TGCC) | TGCC: Rewards, eGift Cards, Magazine, Launches |
| Nav #5 (e14828db) | (test/dev nav) | Appears to be a dev/test navigation — ignore |

In Shopify these become Shopify menu objects (Navigation in admin) referenced via section schema menu selects.

## Homepage Blocks (from `_reference/scraped/data/stream/homepage-route-routes-_index.json`)

Each of these becomes a Shopify section with its own schema:

1. `bannerCarousel` — Hero carousel (with video backgrounds)
2. `bannerCards` — Feature cards (e.g. new arrivals, brand spotlights)
3. `productCarouselTabs` — "This Season's Highlights" tabbed product showcase
4. `content` — Text/CTA content block
5. `bannerCarousel` — Secondary carousel
6. `logoMarquee` — Brand logo ticker
7. `bannerCards` — Secondary feature cards
8. `bannerCarousel` — Third carousel
9. `bannerCarousel` — Fourth carousel
10. `magazineArticles` — Magazine article grid
11. `bannerCarousel` — Final carousel

## Integrations

| Integration | Purpose | Shopify Approach |
|-------------|---------|-----------------|
| Klaviyo (list: V4PnUp) | Email/newsletter | Klaviyo Shopify app |
| Kiwi Sizing | Size guides on PDP | Kiwi Sizing app |
| Upzelo | Reviews | Upzelo app or alternative |
| Google Tag Manager (GTM-5G4N4PSK) | Analytics | GTM snippet in theme |
| reCAPTCHA v3 | Spam protection | Shopify native or app |

## Design Details

- **CSS framework:** Tailwind CSS — all styling is utility classes in the HTML markup, no custom component CSS
- **Custom Tailwind tokens:** `taupe-100` through `taupe-900` (primary palette), `clubhouse-green-600` (accent)
- **Fonts:** Playfair Display (headings), Oxygen (body)
- **Main CSS:** `_reference/scraped/assets/css/root-D6YYcCum.css` — 62KB compiled Tailwind build
- **Carousel CSS:** `_reference/scraped/assets/css/carousel-_uKa6oH9.css` — Splide styles
- **Carousel lib:** Splide.js (bundled in `carousel-D_0VfbSB.js`, 41KB)
- **Product images:** Already on Shopify CDN, no migration needed
- **CMS images:** Hosted on Sanity CDN (cdn.sanity.io) — will need downloading or re-uploading to Shopify Files

### UI Components (all captured in HTML with Tailwind classes)

| Component | Pattern | Key Classes |
|-----------|---------|-------------|
| **Cart drawer** | Slides in from right | `fixed right-0 top-0 z-40 ... translate-x-full` → `translate-x-0` |
| **Size guide drawer** | Slides in from right | Same pattern as cart drawer |
| **Filter offcanvas** (mobile) | Slides in from left | `fixed left-0 top-0 z-50 ... -translate-x-full` → `translate-x-0` |
| **Backdrop overlay** | Fades in behind drawers | `fixed ... z-[49] bg-black/50 opacity-0` → `opacity-100` |
| **Mega menu dropdown** | Drops below header | `absolute left-0 top-full ... hidden` |
| **Toast notification** | Slides in from right | `fixed right-0 top-20 ... translate-x-full` |
| **Mobile nav** | Slides in from left | `fixed left-0 top-0 ... -translate-x-full` |

All transitions are CSS-driven (Tailwind `transition-*` utilities). JS just toggles classes.

### Theme Build Options for Tailwind

1. **Include Tailwind CLI** in Dawn fork — compile with same config, keep utility classes (best for ongoing changes)
2. **Use compiled CSS as-is** — `root-D6YYcCum.css` already has every utility the site uses (faster to get started)

## File Structure

```
_reference/scraped/
├── html/                       # 62 raw HTML files + sitemaps + robots.txt
│   ├── homepage.html
│   ├── collection-*.html       # 6 collection pages
│   ├── product-*.html          # 4 product pages
│   ├── magazine-article-*.html # 4 magazine articles
│   ├── launch-*.html           # 2 launch pages
│   ├── brand-*.html            # 10 brand pages
│   ├── flagship-*.html         # 3 flagship store pages
│   ├── sitemap-*.xml           # All sitemaps
│   └── *.html                  # All other pages
├── data/
│   ├── stream/                 # Decoded Remix route data as JSON
│   │   ├── _navigations.json   # Full mega menu + footer nav
│   │   ├── _settings.json      # Site settings, GTM, nav refs
│   │   ├── homepage.json       # Full homepage + root data
│   │   ├── *-route-*.json      # Page-specific route data files
│   │   └── ...                 # 110 total JSON files
│   └── *.json                  # Meta tags, summaries
└── assets/
    ├── css/                    # root-D6YYcCum.css (62KB Tailwind), carousel-_uKa6oH9.css (Splide)
    ├── js/                     # 152 files (1.7MB) — full Remix bundle inc. all UI components
    │   ├── components-DudDNmcZ.js  # 124KB — main components bundle
    │   ├── carousel-D_0VfbSB.js    # 41KB — Splide carousel library
    │   ├── filtersOffcanvas-YN9Z-5GC.js # 20KB — collection filter drawer
    │   ├── modal-DQdNT-Xv.js      # 46KB — modal/dialog system
    │   ├── cart-DztgkzCz.js        # 6KB — cart drawer logic
    │   ├── colourSwatch-DOHlnrKs.js # 4KB — colour swatch component
    │   ├── productCarousel-BOAptad1.js # product carousel wrapper
    │   ├── manifest.js             # Remix manifest (maps all routes → chunks)
    │   └── ...                     # All remaining route + utility chunks
    ├── fonts/                  # Playfair Display + Oxygen (32 files)
    └── images/                 # Favicons/icons
```

## All Scraped Pages

**Templates (design reference only — content from Shopify):**
- Collections: mens-apparel, mens-new-in, mens-shoes, mens-accessories, womens-clothing, womens-shoes, jackets
- Products: polo, shoe (collection), jacket (collection), sale (collection)
- Magazine articles: open-championship, gift-guide, adidas-shoes
- Launches: adidas-samba, nike-air-max
- Cart, Account, Login, Register, Search (`/products?q=red`)

**Content pages (need content + design):**
- Homepage, About Us, Brands, Womens Brands
- Rewards, Shoe Finder, Launches, Magazine
- Contact, Help Centre, Delivery, Returns, Terms, Privacy Policy
- Corporate, Careers, Custom Golf Apparel, TGLab, Store, Golf Shoes
- Flagship Stores (main, Canary Wharf, Manchester)
- Brand pages: Nike, Ralph Lauren, J.Lindeberg, G/FORE, Manors, Puma, Adidas Originals, APC, Head, Manors V2
