# Phase 1 — Foundation

> Detailed audit notes, build notes, and reference material for Phase 1 sub-phases.

---

## 1A — Staging Skeleton

**Reference:** `_reference/scraped/html/homepage.html` (head structure)
**Shopify MCP:** `fetch_full_docs` for theme.liquid requirements, `search_docs_chunks` for settings_schema.json format, `validate_theme` on all files before pushing

### Build notes
- 8 files created: `layout/theme.liquid`, `config/settings_schema.json`, `config/settings_data.json`, `templates/index.json`, `sections/main-content.liquid`, `locales/en.default.json`, `assets/theme.css` (placeholder), `assets/theme.js` (placeholder)
- GTM snippet wired to `settings.gtm_id` (default: `GTM-5G4N4PSK`) — loads conditionally
- Font picker defaults: `playfair_display_n4` (headings), `assistant_n4` (body) — Oxygen is deprecated in Shopify's font picker, actual Oxygen will load via CSS in 1B
- All files pass Shopify Theme Check validation

---

## 1B — Tailwind Setup & Colour Extraction

**Reference:** `_reference/scraped/assets/css/root-D6YYcCum.css`
**Shopify MCP:** `search_docs_chunks` for asset loading best practices, `validate_theme` after wiring CSS into layout

### Build notes
- Extracted 6 taupe shades + 3 clubhouse-green shades from reference CSS
- `tailwind.config.js` — custom colours, font families (Playfair Display + Oxygen), extra breakpoints (3xl: 1680px, 4xl: 1920px)
- `src/theme.css` — Tailwind input with base layer (font defaults, scrollbar branding)
- `package.json` — `build:css` and `dev:css` scripts with Tailwind CLI
- Google Fonts loaded in `theme.liquid` (Playfair Display + Oxygen)
- Theme Check: CSS passes; layout flags Google Fonts as external assets (acceptable, can self-host in Phase 7B)

---

## 1E — Cart Drawer *(deferred — build after 2C)*

**Reference:** `_reference/scraped/html/collection-mens-apparel.html`, `_reference/scraped/data/stream/cart-route-routes-cart.json`, `_reference/scraped/assets/js/cart-DztgkzCz.js`
**Shopify MCP:** `learn_shopify_api` for Cart API (AJAX endpoints), `search_docs_chunks` for cart object + line_item properties, `validate_theme` on cart-drawer.liquid

### Scope
- Build `sections/cart-drawer.liquid` — slide-out cart with line items, upsells
- Build cart JS — AJAX add/remove/update via Shopify Cart API
- Needs product + collection pages to test add-to-cart flow

---

## 1F — Shared JS & Icons *(deferred — build after 1E)*

**Reference:** `_reference/scraped/html/homepage.html` (icon usage), `_reference/scraped/assets/js/components-DudDNmcZ.js`
**Shopify MCP:** `search_docs_chunks` for JavaScript API + section rendering API, `validate_theme` on theme.js integration

### Scope
- Build `assets/theme.js` — `Drawer` class (toggle, focus trap, escape, overlay, body scroll lock)
- Wire cart drawer + mobile nav to shared Drawer
- Unify icon.liquid if needed
