# Cart Drawer (Phase 1E)

> Slide-out mini cart drawer — line items, quantity picker, remove, checkout button, upsell carousel, AJAX cart API integration.

**Reference:**
```
_reference/scraped/html/cart.html                                  # Scraped drawer markup (empty state)
_reference/repo/app/components/partials/ecommerce/miniCart.tsx      # Drawer shell + logic
_reference/repo/app/components/partials/ecommerce/lineItem.tsx      # Line item component
_reference/repo/app/components/partials/ecommerce/quantity.tsx      # Quantity picker
_reference/repo/app/components/partials/common/offcanvas.tsx        # Offcanvas container
_reference/repo/app/components/partials/global/rewardsModalTrigger.tsx  # Rewards banner (logged-out)
_reference/repo/app/components/partials/global/rewardsWidgetTrigger.tsx # Rewards button (logged-in)
_reference/repo/app/components/partials/common/loaderIcon.tsx       # Loading spinner
_reference/repo/app/hooks/useCartLineItems.ts                      # Cart mutation logic
_reference/repo/app/routes/api.cart.tsx                             # Cart API (add/remove/update)
_reference/repo/app/utils/classes.ts                               # Button class utility
```

**Shopify MCP:** `learn_shopify_api` for Cart API (AJAX), `search_docs_chunks` for `cart` object + `line_item` properties + `routes.cart`, `validate_theme` on cart-drawer.liquid + snippets

---

## Files to create

| File | Purpose |
|------|---------|
| `sections/cart-drawer.liquid` | Drawer shell — overlay, panel, header, line items, footer |
| `snippets/cart-line-item.liquid` | Individual line item (image, title, variant, quantity, price, remove) |
| `snippets/quantity-picker.liquid` | Reusable quantity picker (minus/input/plus) |

**Files to update:**

| File | Change |
|------|--------|
| `layout/theme.liquid` | Render `{% section 'cart-drawer' %}` before `</body>` |
| `assets/theme.js` | Add cart drawer JS (open/close, AJAX add/remove/update, quantity changes) |
| `snippets/icon.liquid` | Add `x-mark`, `trash`, `minus`, `plus`, `chevron-right`, `trophy` icons if missing |

---

## Source HTML Structure

### Offcanvas container (from `offcanvas.tsx` + scraped HTML)

```html
<!-- Drawer panel -->
<div role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title"
  class="fixed right-0 top-0 z-40 flex h-dvh w-full max-w-[31rem] flex-col overflow-y-auto bg-taupe-100 transition-all duration-500 ease-in-out translate-x-full shadow-none">
  ...
</div>

<!-- Backdrop overlay -->
<div class="fixed left-0 top-0 z-[39] h-full w-full overflow-hidden bg-black/50 transition-opacity duration-500 ease-in-out pointer-events-none opacity-0"></div>
```

**Open state:** panel gets `translate-x-0 shadow-xl`, overlay gets `opacity-1` + remove `pointer-events-none`
**Closed state:** panel gets `translate-x-full shadow-none`, overlay gets `pointer-events-none opacity-0`

### Drawer content area

```html
<div class="flex-1 p-8">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h2 id="cart-drawer-title" class="mb-0 font-sans font-bold text-lg lg:text-xl">Your Cart</h2>
    <div>
      <button aria-label="close navigation" class="shrink-0">
        <!-- XMarkIcon size-6 -->
      </button>
    </div>
  </div>

  <!-- Rewards banner (logged-out state) -->
  <div class="mb-4 flex items-center gap-2 bg-clubhouse-green-600 p-4 text-sm text-white">
    <!-- TrophyIcon size-5 min-w-5 -->
    <span class="inline [&_*]:mb-0">
      <b>Register</b> at checkout to unlock <b>TGCC Rewards</b> with your purchase.
      <button class="inline font-bold underline">Learn more</button>
    </span>
  </div>

  <!-- Line items list -->
  <div class="mb-8">
    <ul class="mb-10">
      <li class="mb-6 border-b border-taupe-400 pb-6 last:mb-0 last:border-0 last:pb-0">
        <!-- cart-line-item.liquid rendered here -->
      </li>
    </ul>
  </div>

  <!-- Empty state -->
  <div class="mb-8">
    <p>Your basket is empty.</p>
  </div>

  <!-- Upsell carousel ("You might also like" / "You might like") -->
  <h3 class="mb-6 font-bold text-lg lg:text-xl">You might also like</h3>
  <div class="overflow-hidden">
    <!-- Splide carousel: 2 perPage desktop, 1 perPage mobile, arrows, no pagination -->
    <!-- Uses product-card.liquid -->
  </div>
</div>
```

### Sticky footer

```html
<div class="sticky bottom-0 left-0 z-10 w-full bg-taupe-300 px-8 py-4">
  <!-- Source always shows this; conditional is an intentional enhancement for digital-only carts -->
  {% if cart.requires_shipping %}
    <p class="mb-2 text-center text-sm">Shipping &amp; Fees calculated at checkout</p>
  {% endif %}

  <!-- Checkout button (dark-grey style) -->
  <a href="{{ routes.root_url }}checkout"
    class="flex items-center gap-2 text-center text-sm tracking-wider transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 uppercase justify-center px-4 py-3 lg:px-10 min-w-40 bg-taupe-900 text-white enabled:hover:bg-taupe-600 w-full">
    <span>Checkout</span>
    <span>|</span>
    <span>{{ cart.total_price | money }}</span>
  </a>

  <!-- View cart link (transparent style) -->
  <a href="/cart"
    class="flex items-center gap-2 text-center text-sm tracking-wider transition-all uppercase justify-center px-4 py-3 lg:px-10 min-w-40 bg-transparent transition-colors enabled:hover:bg-transparent enabled:hover:text-clubhouse-green-600 w-full">
    <span class="inline-block font-bold">View cart</span>
    <!-- ChevronRightIcon size-5 -->
  </a>
</div>
```

---

## Line Item Structure (from `lineItem.tsx`)

```html
<div class="relative flex gap-4 transition-opacity">
  <!-- Loading overlay (shown during AJAX mutations) -->
  <div class="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">
    <svg class="animate-spin text-neutral-700 size-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>

  <!-- Product image -->
  <div>
    <a href="/products/{{ item.product.handle }}">
      <img src="{{ item.image | image_url: width: 160 }}"
        alt="{{ item.image.alt | escape }}"
        class="h-28 w-20 object-cover" />
    </a>
  </div>

  <!-- Content -->
  <div class="flex flex-1 flex-col">
    <!-- Title + variant + remove -->
    <div class="flex justify-between gap-2">
      <div>
        <p class="mb-1 font-semibold">
          <a href="/products/{{ item.product.handle }}">{{ item.product.title }}</a>
        </p>
        <!-- Hide "Default Title" for single-variant products -->
        {% unless item.variant.title == 'Default Title' %}
          <p class="mb-2 text-xs">{{ item.variant.title }}</p>
        {% endunless %}
        {% if item.message %}
          <p class="text-xs text-red-600">{{ item.message }}</p>
        {% endif %}
      </div>
      <div>
        <button data-line-remove="{{ item.key }}">
          <!-- TrashIcon size-4 text-taupe-900 hover:text-taupe-700 -->
        </button>
      </div>
    </div>

    <!-- Quantity + price -->
    <div class="mt-auto flex items-end justify-between pt-4">
      <div>
        <!-- quantity-picker.liquid -->
      </div>
      <div class="flex flex-col items-end justify-end gap-0.5">
        <!-- Show original price struck through if discounted -->
        {% if item.original_line_price != item.final_line_price %}
          <span class="mb-0 text-xs text-taupe-700 line-through">{{ item.original_line_price | money }}</span>
        {% endif %}
        <span class="mb-0 font-semibold">{{ item.final_line_price | money }}</span>
        <!-- Unit price shown when it differs from line total (quantity > 1 or discounted) -->
        {% if item.final_price != item.final_line_price %}
          <span class="mb-0 text-xs text-taupe-600">{{ item.final_price | money }} each</span>
        {% endif %}
      </div>
    </div>
  </div>
</div>
```

**Loading state:** Add `pointer-events-none opacity-50` to root div during AJAX mutations.

**Note:** `mobileAlways` prop in source means image stays at `h-28 w-20` (no `md:h-52 md:w-40` breakpoint) — the drawer is narrow, so always uses mobile sizing.

### Line item properties

Custom properties (engraving, gift wrapping, etc.) should be rendered below the variant title. Properties starting with `_` are private and must be hidden:

```liquid
{% unless item.properties == empty %}
  {% for property in item.properties %}
    {%- assign first_char = property.first | slice: 0 -%}
    {% unless property.last == blank or first_char == '_' %}
      <p class="text-xs text-taupe-600">
        {{ property.first }}:
        {% if property.last contains '/uploads/' %}
          <a href="{{ property.last }}" class="underline">{{ property.last | split: '/' | last }}</a>
        {% else %}
          {{ property.last }}
        {% endif %}
      </p>
    {% endunless %}
  {% endfor %}
{% endunless %}
```

---

## Quantity Picker Structure (from `quantity.tsx`)

```html
<div class="flex items-center border border-taupe-400">
  <button type="button"
    class="flex h-10 w-6 items-center justify-center bg-transparent text-taupe-900 hover:text-taupe-700 disabled:cursor-not-allowed">
    <!-- MinusIcon size-4 -->
  </button>
  <input type="text" inputmode="numeric" pattern="[0-9]*" name="quantity"
    class="h-10 w-12 bg-transparent text-center text-sm focus:outline-none disabled:opacity-50"
    value="1" min="1" />
  <button type="button"
    class="flex h-10 w-6 items-center justify-center bg-transparent text-taupe-900 hover:text-taupe-700 disabled:cursor-not-allowed">
    <!-- PlusIcon size-4 -->
  </button>
</div>
```

**JS behaviour:**
- Input accepts numeric only (validate on keypress with `/^\d*$/`)
- On blur: parse value, if valid and changed call update; if invalid reset to current quantity
- Minus disabled when quantity = min (1)

---

## Button Styles (from `classes.ts`)

| Style | Classes |
|-------|---------|
| Base (all buttons) | `flex items-center gap-2 text-center text-sm tracking-wider transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50` |
| `dark-grey` (checkout) | `bg-taupe-900 text-white enabled:hover:bg-taupe-600` |
| `transparent` (view cart) | `bg-transparent transition-colors enabled:hover:bg-transparent enabled:hover:text-clubhouse-green-600` |
| Sizing | `uppercase justify-center px-4 py-3 lg:px-10 min-w-40` |
| Disabled | `pointer-events-none cursor-not-allowed opacity-50` |

---

## Key Tailwind Classes

| Element | Classes |
|---------|---------|
| Drawer panel | `fixed right-0 top-0 z-40 flex h-dvh w-full max-w-[31rem] flex-col overflow-y-auto bg-taupe-100 transition-all duration-500 ease-in-out` + `role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title"` |
| Backdrop | `fixed left-0 top-0 z-[39] h-full w-full overflow-hidden bg-black/50 transition-opacity duration-500 ease-in-out` |
| Content area | `flex-1 p-8` |
| Header row | `mb-6 flex items-center justify-between` |
| Title | `mb-0 font-sans font-bold text-lg lg:text-xl` |
| Close button | `shrink-0` with `size-6` icon |
| Rewards banner (logged-out) | `mb-4 flex items-center gap-2 bg-clubhouse-green-600 p-4 text-sm text-white` |
| Rewards button (logged-in) | `mb-4 flex w-full items-center gap-3 border border-taupe-600 p-4 text-left text-sm hover:border-taupe-900` |
| Line item list | `mb-10` (ul) |
| Line item li | `mb-6 border-b border-taupe-400 pb-6 last:mb-0 last:border-0 last:pb-0` |
| Line item root | `relative flex gap-4 transition-opacity` |
| Line item image | `h-28 w-20 object-cover` |
| Line item title | `mb-1 font-semibold` |
| Line item variant | `mb-2 text-xs` |
| Trash icon | `size-4 text-taupe-900 hover:text-taupe-700` |
| Quantity row | `mt-auto flex items-end justify-between pt-4` |
| Quantity border | `flex items-center border border-taupe-400` |
| Quantity buttons | `flex h-10 w-6 items-center justify-center bg-transparent text-taupe-900 hover:text-taupe-700 disabled:cursor-not-allowed` |
| Quantity input | `h-10 w-12 bg-transparent text-center text-sm focus:outline-none disabled:opacity-50` |
| Price (total) | `mb-0 font-semibold` |
| Price (unit) | `mb-0 text-xs text-taupe-600` |
| Price (original/struck) | `mb-0 text-xs text-taupe-700 line-through` |
| Loading spinner | `animate-spin text-neutral-700 size-8` |
| Loading container | `absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2` |
| Sticky footer | `sticky bottom-0 left-0 z-10 w-full bg-taupe-300 px-8 py-4` |
| Footer text | `mb-2 text-center text-sm` (conditional on `cart.requires_shipping`) |
| Checkout button | base + `bg-taupe-900 text-white enabled:hover:bg-taupe-600 w-full uppercase` |
| View cart link | base + `bg-transparent transition-colors enabled:hover:bg-transparent enabled:hover:text-clubhouse-green-600 w-full uppercase` |

---

## Data Attributes (JS hooks)

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-cart-drawer` | Drawer panel div | JS target for open/close |
| `data-cart-overlay` | Backdrop div | Click to close |
| `data-cart-close` | Close button | Close drawer |
| `data-cart-count` | Header cart icon badge | Update item count |
| `data-cart-items` | Line items container | Replace HTML on cart change |
| `data-cart-footer` | Sticky footer | Show/hide checkout, update total |
| `data-cart-empty` | Empty state message | Toggle visibility |
| `data-line-remove` | Trash button | Value = line item key |
| `data-line-key` | Line item root | Identifies line for loading state |
| `data-quantity-input` | Quantity input | Read/write quantity value |
| `data-quantity-minus` | Minus button | Decrement quantity |
| `data-quantity-plus` | Plus button | Increment quantity |

---

## AJAX Cart API + Section Rendering

Shopify's AJAX Cart API endpoints (vanilla JS, no Storefront API):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cart.js` | `GET` | Fetch current cart as JSON |
| `/cart/add.js` | `POST` | Add items (`{ items: [{ id, quantity }] }`) |
| `/cart/change.js` | `POST` | Update line item (`{ id: line_key, quantity }`) — quantity 0 removes |
| `/cart/update.js` | `POST` | Bulk update quantities (does **not** validate inventory — use `change.js` for individual updates) |
| `/cart/clear.js` | `POST` | Clear entire cart |

**Headers:** All POST requests need `Content-Type: application/json` and `Accept: application/json`.

**Important:** Use `line_item.key` (not `variant_id`) for `/cart/change.js` — a cart can have multiple line items with the same variant (different properties, discounts).

**Note:** `checkout_url` is **not** returned in the AJAX JSON response — it is only available via the Liquid `cart` object. Use the Section Rendering API (below) or hard-code `/checkout`.

### Section Rendering API (recommended approach)

Instead of fetching `/cart.js` and rebuilding HTML in JavaScript, pass a `sections` parameter to cart mutation endpoints. Shopify returns the fully rendered Liquid section HTML in the response, eliminating the need to maintain two rendering paths (Liquid + JS) and automatically handling discounts, line item properties, money formatting, etc.

```js
// Example: update quantity via /cart/change.js with section rendering
const response = await fetch('/cart/change.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: lineKey,
    quantity: newQuantity,
    sections: 'cart-drawer'
  })
});
const data = await response.json();

// data.sections['cart-drawer'] contains the fully rendered HTML
// Parse and swap the relevant DOM nodes
```

The `sections` parameter works on `/cart/add.js`, `/cart/change.js`, `/cart/update.js`, and `/cart/clear.js`. The response includes a `sections` object keyed by section file name, containing the rendered HTML string.

**Important:** The rendered HTML includes Shopify's wrapper: `<div id="shopify-section-cart-drawer" class="shopify-section">...</div>`. The JS should parse and extract the inner content, or replace the entire wrapper depending on DOM structure.

For initial load (opening the drawer), use the Section Rendering API via GET:
```
GET /?sections=cart-drawer
```

**Locale-aware URLs:** All AJAX requests should use `window.Shopify.routes.root` as a base path for multi-locale support:
```js
fetch(window.Shopify.routes.root + 'cart/change.js', { ... })
```

### JS Architecture

```
CartDrawer class:
  - open()        → GET /?sections=cart-drawer (returns JSON keyed by section ID), parse and swap inner HTML, slide panel in, lock body scroll
  - close()       → slide panel out, unlock body scroll
  - addItem()     → POST /cart/add.js with sections param, swap HTML, open drawer
  - removeItem()  → POST /cart/change.js with quantity: 0 + sections param, swap HTML
  - updateItem()  → POST /cart/change.js with new quantity + sections param, swap HTML
  - updateCount() → update header cart badge count from response item_count
```

**Focus management:**
- Trap focus inside the drawer when open (Tab cycles through focusable elements)
- Move focus to the close button when the drawer opens
- Return focus to the trigger element (cart icon) when the drawer closes
- Escape key closes the drawer

**Events:**
- `cart:changed` — custom event dispatched after any mutation (add/remove/update)
- Header cart icon listens for this to update badge count
- Product page add-to-cart dispatches this after successful add

**Error handling:**
- `/cart/add.js` returns `{ status: 422, description: "..." }` when exceeding inventory
- `/cart/change.js` returns `{ status: 400, message: "..." }` for invalid items
- Display error inline on the affected line item or as a brief notification

**Loading states:**
- Individual line item gets `pointer-events-none opacity-50` during its mutation
- Spinner overlay centred on the line item: `absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2`
- Spinner SVG: `animate-spin text-neutral-700 size-8`

### Money format for JS

If any client-side price rendering is needed (e.g., updating the header cart total without a full section re-render), expose the shop's money format:

```liquid
<script>
  window.cartDrawerConfig = {
    moneyFormat: {{ shop.money_format | json }}
  };
</script>
```

---

## Upsell Carousel

"You might also like" section below line items, using Splide + `product-card.liquid`.

**Splide config:**
```js
{
  perPage: 2,
  gap: 10,
  arrows: true,
  pagination: false,
  padding: { left: 0, right: '10%' },
  breakpoints: {
    480: {
      perPage: 1,
      padding: { left: 0, right: '40%' }
    }
  }
}
```

**Product source:** Source site uses **Rebuy** (third-party) for trending products — not Shopify's native API. Options for Shopify theme:
1. **Curated collection** — merchant picks a collection in section settings (simplest, no dependencies)
2. **Product recommendations API** — `GET /recommendations/products.json?product_id=X&limit=4&intent=related` (requires a `product_id`, cannot show "trending" globally — only works in cart-with-items context using the last added product)
3. **Rebuy app** — if client installs Rebuy, it injects its own widget; this section becomes a fallback

**Heading logic:** "You might also like" when cart has items, "You might like" when empty.

---

## Rewards Banner

### Logged-out state (`rewardsModalTrigger.tsx`)

```html
{% unless customer %}
  <div class="mb-4 flex items-center gap-2 bg-clubhouse-green-600 p-4 text-sm text-white">
    <!-- TrophyIcon size-5 min-w-5 -->
    <span class="inline [&_*]:mb-0">
      <b>Register</b> at checkout to unlock <b>TGCC Rewards</b> with your purchase.
      <button class="inline font-bold underline">Learn more</button>
    </span>
  </div>
{% endunless %}
```

### Logged-in state (`rewardsWidgetTrigger.tsx`)

```html
{% if customer %}
  <button class="mb-4 flex w-full items-center gap-3 border border-taupe-600 p-4 text-left text-sm hover:border-taupe-900">
    <!-- TrophyIcon size-5 min-w-5 shrink-0 -->
    <span><b>TGCC Rewards</b> — View your points & rewards</span>
  </button>
{% endif %}
```

**Note:** The logged-in widget has a completely different design — bordered button (not green banner), left-aligned text, `shrink-0` on the icon. For Phase 1E, render both states. The logged-in button's click action (opening a rewards modal/panel) is deferred to Phase 7A.

---

## Section Schema

Since `cart-drawer.liquid` is statically rendered via `{% section 'cart-drawer' %}` in `layout/theme.liquid`, the schema must use `default` settings — **not `presets`**. Presets are for sections added via the theme editor; statically rendered sections use `default`.

```liquid
{% schema %}
{
  "name": "Cart drawer",
  "settings": [
    ...
  ],
  "default": {
    "settings": { ... }
  }
}
{% endschema %}
```

---

## Deferred

- **Rewards widget click action** — Phase 7A, the logged-in button renders now but its click action (opening rewards modal) requires third-party integration
- **Upsell product source** — ~~deferred~~ DONE. Built with Rebuy as primary, Shopify Recommendations API as fallback, curated collection as final fallback
- **Free shipping progress bar** — not present in source site, skip unless client requests
- **Body scroll lock** — already implemented in shared Drawer class (Phase 1F), reuse
- **Selling plans / subscriptions** — `line_item.selling_plan_allocation` not rendered. Add if store uses subscriptions
- **Cart notes & attributes** — the drawer uses a direct `/checkout` link (not a form post). Cart notes/attributes set on the full cart page are already stored server-side and will carry through to checkout regardless. No form needed in the drawer

---

## Build Notes

**Status: COMPLETE**

### Files created
- `sections/cart-drawer.liquid` — Drawer shell, rewards banners, line items, upsell carousel, sticky footer
- `snippets/cart-line-item.liquid` — Line item with image, title, variant, properties, quantity picker, price, remove
- `snippets/quantity-picker.liquid` — Reusable minus/input/plus with data attributes

### Files updated
- `snippets/icon.liquid` — Added `trash`, `minus`, `plus`, `check-circle`, `exclamation-circle` icons
- `layout/theme.liquid` — Added `{% section 'cart-drawer' %}` + toast notification markup
- `assets/theme.js` — CartDrawer class + Toast notification system
- `sections/product-template.liquid` — Wired PDP add-to-cart to toast + cart drawer refresh

### Implementation notes
- **Upsell cascade:** Rebuy trending → Shopify Recommendations API (using first cart item's product ID) → curated fallback collection (section setting). Rebuy API key is a section setting.
- **Section Rendering API:** All cart mutations (add/change/remove) pass `sections: 'cart-drawer'` and swap the returned HTML rather than rebuilding in JS. Avoids dual rendering paths.
- **Toast notification:** Matches source site — green success toast, red error toast, slides in from top-right, auto-dismisses after 2.5s. PDP add-to-cart shows toast (not drawer open), matching source behaviour.
- **Cart badge:** Hidden `<span data-cart-drawer-count>` inside the section provides item count for the header badge, since the Section Rendering API only returns cart-drawer HTML (not the header).
- **Splide arrows:** Custom `splide__arrows` markup with chevron icons + `bg-taupe-300` styling, matching other carousels in the theme.
- **422 handling:** Shopify returns 422 when quantity exceeds inventory — the drawer refreshes to show actual cart state and shows Shopify's error message via toast.
- **CSS build:** `npm run build:css` (Tailwind). All new classes are picked up via the existing content config scanning `.liquid` and `.js` files.

### Client action required
- **Rebuy API key** — needs to be entered in Theme Editor → Cart drawer section settings once the client provides it. Without it, falls back to Shopify Recommendations API / curated collection.
