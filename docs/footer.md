# Footer (Phase 1D)

> Detailed build notes for footer section.

**Reference:** `_reference/scraped/html/homepage.html`, `_reference/scraped/data/stream/_navigations.json`, `_reference/scraped/data/stream/_settings.json`
**Shopify MCP:** `search_docs_chunks` for footer section patterns + linklist objects, `validate_theme` on footer.liquid

---

## Build notes
- 3 files created: `sections/footer.liquid`, `snippets/social-links.liquid`, `sections/footer-group.json`
- 4 files modified: `layout/theme.liquid`, `snippets/icon.liquid` (added envelope + phone icons), `locales/en.default.json`, `locales/en.default.schema.json`
- 4-column grid layout: Contact (email, phone, social icons) + 3 configurable menu columns via `link_list` settings
- Social icons (Instagram, Facebook, X, TikTok, YouTube) read from global theme settings — custom SVGs matching source site style
- Brand wordmark: inline SVG in clubhouse-green (#234A31), toggleable via checkbox
- Payment icons: `shop.enabled_payment_types | payment_type_svg_tag` (Shopify best practice)
- Legal bar: separate `link_list` for Privacy/Terms links, auto-generated copyright `© [year] [shop name]` with override option
- Footer headings use `font-body` (Oxygen) to override global `font-display` (Playfair Display) on `<h3>` — matches source site
- Section group (`footer-group.json`) gives footer eye-icon toggle in theme editor, consistent with header approach
- Newsletter signup deferred to Phase 7A (Klaviyo integration)
- `min-h-[50vh]` added to `<main>` to separate header/footer on empty pages
- All files pass Shopify Theme Check (only pre-existing Google Fonts CDN warnings on theme.liquid)
