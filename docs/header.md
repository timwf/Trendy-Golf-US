# Header & Mega Menu (Phase 1C)

> Detailed audit, plan, and build notes for header, announcement bar, mega menu, and icon snippet.

**Reference:** `_reference/scraped/html/homepage.html`, `_reference/scraped/data/stream/_navigations.json`, `_reference/scraped/assets/js/components-DudDNmcZ.js`
**Shopify MCP:** `search_docs_chunks` for section schema with blocks, menu/linklist objects, `validate_theme` on header.liquid + announcement-bar.liquid

---

## Source HTML Structure (from `homepage.html`)

**`<header>`** — `absolute left-0 top-0 w-full z-10`, `h-[64px] lg:h-[74px]`, transparent bg (overlays hero carousel, white text)
- **Search overlay** — child div, slides down from top (`-translate-y-full` → `translate-y-0`), contains search input + submit/close buttons
- **Left group:** hamburger button (mobile only, `xl:hidden`) + logo (`<a>` wrapping `<img>`, `max-w-[160px] md:max-w-[260px]`)
- **Centre:** desktop `<nav>` (`hidden xl:block`) with `<ul>` of top-level items
- **Right group:** country flag (skip for now), search button, wishlist (heart icon → `/account/saved`), account (user icon → `/account`), cart button (shopping bag + item count)
- All icon/text colours are `text-white` when header is transparent

**Desktop mega menu dropdown (Men, Women, Footwear have children):**
- `absolute left-0 top-full w-full`, `bg-taupe-100`, `border-t border-taupe-400`, `shadow-md`
- Two-column grid: `grid-cols-[minmax(0,4fr)_minmax(0,2fr)]`, `h-[33rem]`, `overflow-hidden`
- **Left panel:** link columns flex-wrapped at `w-[20%]` each — level-2 items are column headings (`font-semibold`), level-3 items listed below (`text-sm`, `hover:text-clubhouse-green-600`)
- **Right panel:** featured promo image with overlay text (heading) + CTA link — this is the "banner" data from `_navigations.json`
- Triggered by CSS hover via Tailwind group: `group/grandparent` on `<li>`, `group-hover/grandparent:` on the dropdown + the link underline
- Items without children (Launches, Magazine, Shoe Finder) render as plain links, no dropdown

**Mobile nav drawer:**
- `fixed left-0 top-0 z-50 w-[90%] md:max-w-lg xl:hidden`, `bg-white shadow-md`
- Slide in/out: `-translate-x-full` (hidden) → `translate-x-0` (visible), `duration-500`
- Top bar: country flag selector + close (X) button, same height as header (`h-[64px] lg:h-[74px]`)
- Level 1: `<ul>` with each top-level item as text + chevron-right button
- Level 2+: nested `<div>` with `absolute right-0 top-0 h-full w-[100%]`, slides in via `translate-x-full` → `translate-x-0`
- Back button needed for each sub-level

---

## Customiser Schema

**`sections/announcement-bar.liquid` schema:**
- Settings: `text` (text), `link` (url), `link_text` (text), `background_color` (color, default taupe-900), `text_color` (color, default white)
- Preset name: "Announcement bar"

**`sections/header.liquid` schema:**
- Settings:
  - `logo` (image_picker) — store logo
  - `logo_width` (range, 100–300, default 200) — logo width in px
  - `menu` (link_list, default "main-menu") — Shopify native menu, drives all nav
  - `enable_transparent_header` (checkbox, default true) — transparent over hero
  - `transparent_text_color` (color, default white)
  - `solid_bg_color` (color, default white)
  - `solid_text_color` (color, default taupe-900)
- Blocks (type `mega_menu_image`, limit 10):
  - `menu_item_title` (text) — must match a top-level menu item title exactly (e.g. "Men")
  - `image` (image_picker) — featured promo image
  - `heading` (text) — overlay heading (e.g. "Shop The Latest From Manors")
  - `link` (url) — CTA destination
  - `link_text` (text, default "Shop now") — CTA label

**Liquid rendering logic:**
1. Loop `section.settings.menu.links` for top-level nav items
2. If a link has `.links` (children), render the mega menu dropdown:
   - Left panel: loop link's `.links` (level 2) as column headings, each with their own `.links` (level 3) listed below
   - Right panel: find matching `mega_menu_image` block where `block.settings.menu_item_title == link.title`, render featured image + overlay
3. Desktop: CSS-only hover via Tailwind `group/grandparent` + `group-hover/grandparent:block` (hidden by default)
4. Mobile: JS-driven slide-in panels, same linklist data

**`snippets/mega-menu-dropdown.liquid`:**
- Accepts: `link` (the top-level linklist link object), `mega_blocks` (array of mega_menu_image blocks)
- Renders the full-width dropdown panel (left columns + right featured image)

**`snippets/icon.liquid`:**
- Accepts: `icon` (string name), `size` (string, default "size-6")
- Renders inline SVG for: `bars-3`, `x-mark`, `magnifying-glass`, `heart`, `user`, `shopping-bag`, `chevron-right`, `chevron-down`, `chevron-left`, `arrow-right`
- Source: Heroicons outline set (matches source site)

**`layout/theme.liquid` changes:**
- Section group (`sections/header-group.json`) renders announcement-bar + header with theme editor eye toggle support

**JS requirements:**
- Mobile nav toggle: open/close drawer, toggle body scroll
- Mobile sub-level navigation: slide panels in/out
- Search overlay toggle
- Cart count badge update (stub, wired properly in 1E)

**Key Tailwind classes (from source):**
- Header: `absolute left-0 top-0 w-full z-10 h-[64px] lg:h-[74px]`
- Mega menu: `absolute left-0 top-full z-10 w-full bg-taupe-100 border-t border-taupe-400 shadow-md`
- Mega columns: `flex flex-wrap content-start gap-5`, each column `w-[20%]`
- Mobile drawer: `fixed left-0 top-0 z-50 w-[90%] md:max-w-lg xl:hidden bg-white shadow-md`
- Overlay: `fixed inset-0 z-[39] bg-black/50`
- Hover states: `hover:text-clubhouse-green-600`, `group-hover/grandparent:border-clubhouse-green-600`
- Transitions: `transition-transform duration-500`, `transition-all duration-300`

---

## Build notes
- 8 files created: `snippets/icon.liquid`, `sections/announcement-bar.liquid`, `snippets/mega-menu-dropdown.liquid`, `sections/header.liquid`, `sections/header-group.json`, `locales/en.default.schema.json`, plus updates to `layout/theme.liquid`, `assets/theme.js`, `locales/en.default.json`
- 10 Heroicons in icon snippet: bars-3, x-mark, magnifying-glass, heart, user, shopping-bag, chevron-right/down/left, arrow-right
- Desktop mega menu: CSS-only hover via Tailwind `group/grandparent` — no JS needed
- Mobile nav: JS-driven 3-level slide panels with `translate-x` transitions, overlay + body scroll lock
- Header transparent→solid scroll transition (>50px) via JS scroll listener + CSS custom properties
- Mega menu promo images: configurable via `mega_menu_image` blocks matched by menu item title
- Search overlay: slides down from top with form action to `{{ routes.search_url }}`
- All files pass Shopify Theme Check (only pre-existing Google Fonts CDN warnings on theme.liquid — self-host in 7B)
- Migrated from static `{% section %}` tags to `{% sections 'header-group' %}` section group — announcement bar and header now have the eye icon visibility toggle in the theme editor
- Two header variants match source site: **transparent** (`absolute`, `bg-transparent`, white text/logo — homepage, rewards, brand pages) and **solid** (`relative`, `bg-taupe-100` #f6f5f2, dark text/logo — collections, cart). Controlled by `enable_transparent_header` checkbox per page
- Solid background defaults to taupe-100 (`#f6f5f2`), not white — matches source site
- **Still needed:** second logo picker (white vs dark logo)
- **Fixed in 2B:** `absolute` → `relative` positioning swap for solid variant — header is now `absolute` only when `is_transparent` is true, otherwise `relative` so content flows below it naturally
- Tailwind CSS recompiled with all new utility classes
