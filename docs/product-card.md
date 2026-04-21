# Product Card & Price (Phase 2A)

> Detailed audit, plan, and build notes for product card, colour swatch, and price snippets.

**Reference:** `_reference/scraped/html/collection-mens-apparel.html`, `_reference/scraped/assets/js/colourSwatch-DOHlnrKs.js`, `_reference/scraped/assets/js/card-BvMkuDS6.js`
**Shopify MCP:** `search_docs_chunks` for product object, variant object, product.images, product.media, `validate_theme` on product-card.liquid + price.liquid

---

## Colour swatch strategy

The source site uses **separate Shopify products per colour** (not variant options). These are linked together visually as one product card with colour swatches. The source site's `linkedColours` array was computed server-side by its Remix + Sanity CMS stack — it does not exist as a Shopify metafield.

**Metafields available on each product (set in Shopify admin):**
- `custom.product_display_name` — the shared product line name (e.g. "Air Jordan NU Retro 1 G Golf Shoes"), used to group colour siblings and as the card title
- `custom.swatch_colour` — hex value for this product's swatch dot (e.g. `#000000`)
- `custom.swatch_colour_secondary` — optional secondary hex for split/dual-colour swatches
- `custom.color` — simple colour name (e.g. "Black")
- `custom.product_display_colour` — full colour description (e.g. "Black/White/Palomino")

**Grouping approach:**
- Products with the same `custom.product_display_name` are treated as one card with colour swatches
- The **collection template (2B)** handles grouping: nested loop over `collection.products`, match by `product_display_name`, deduplicate so only one card renders per group
- The first product in each group is the "primary" — its image, price, and vendor are shown
- Each sibling contributes a swatch dot linking to its own product URL
- The active swatch is highlighted for the currently displayed product

**Card rendering:**
- **Title:** `product.metafields.custom.product_display_name` (falls back to `product.title` if not set)
- **Image:** `aspect-[9/12]` container, two overlaid images for desktop hover swap (primary fades out, secondary shows)
- **Swatches (desktop):** slide up from bottom of image on hover (`translate-y-full` → `translate-y-0`), rendered inside a `bg-taupe-300/90` bar
- **Swatches (mobile):** always visible below product info
- **Price:** via `{% render 'price' %}` — regular price bold, compare-at struck through if on sale
- **Link:** entire card links to `product.url`

**The `product-card.liquid` snippet accepts:**
- `product` — the primary product to display
- `swatches` — a string of swatch data (colour hex, URL, active state) passed from the collection template. If empty, no swatches render — card works standalone

---

## Build notes
- 3 files created: `snippets/price.liquid`, `snippets/colour-swatch.liquid`, `snippets/product-card.liquid`
- 1 file modified: `locales/en.default.json` (added `products.product.sold_out` key)
- **Price snippet:** handles regular, sale (compare-at struck through + red sale price), and sold-out states. Uses `money` filter for currency formatting
- **Colour swatch snippet:** renders circular dot with primary colour + optional secondary split (diagonal rotation matching source React component). Active state via `border-taupe-900`, inactive via `border-transparent`. Two sizes: `size-7` (desktop) / `size-5` (mobile via `small` param). Wrapped in `<a>` tag linking to sibling product
- **Product card snippet:** matches source site structure exactly — `aspect-[9/12]` image container, two overlaid images for desktop hover swap (`md:group-hover:opacity-0`), desktop swatches slide up from bottom on hover (`translate-y-full → translate-y-0` in `bg-taupe-300/90` bar), mobile swatches always visible below info. Product info: vendor (xs/sm, taupe-700) → display name (base) → colour name (sm), all centred. Uses `product.metafields.custom.product_display_name` with fallback to `product.title`. Sold-out badge rendered top-left when `product.available == false`
- Card accepts `swatches` and `swatches_mobile` as pre-built HTML strings — swatch grouping logic deferred to 2B (collection template)
- Uses `image_url: width: 800 | image_tag` with responsive `sizes` and `widths` attributes
- All files pass Shopify Theme Check
- Tailwind CSS recompiled with new utility classes
