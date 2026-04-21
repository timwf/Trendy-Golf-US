# Customer Accounts — Phase 6A

## Overview

The full suite of customer account templates: login, register, dashboard, order history, address book, plus Shopify's auto-handled password reset and activation pages. Source site uses a custom React frontend; we're mirroring its layout and Tailwind styling in Shopify Liquid using the standard `{% form 'customer_*' %}` tags.

**Seven templates in total:**
1. **Login** (`templates/customers/login.json`) — two-column gate: rewards marketing (left) + login form (right)
2. **Register** (`templates/customers/register.json`) — same two-column shell, register form
3. **Account dashboard** (`templates/customers/account.json`) — sidebar + main content, profile form
4. **Order detail** (`templates/customers/order.json`) — full order summary (line items, totals, addresses)
5. **Address book** (`templates/customers/addresses.json`) — list + add/edit/delete addresses
6. **Reset password** (`templates/customers/reset_password.json`) — minimal form, Shopify-handled
7. **Activate account** (`templates/customers/activate_account.json`) — minimal form, Shopify-handled

Order history (list) is shown as a block inside `account.json`, not a standalone template.

---

## Architecture

### Shopify Classic (Legacy) Accounts — decision locked

**Decision:** Classic accounts (matches the live site).

⚠️ **Important — Feb 2026 deprecation:** Shopify's changelog (Feb 26, 2026) notes legacy customer accounts are now deprecated. A final sunset date will be announced later in 2026. **Any store that's on legacy accounts and upgrades to a theme without the full set of legacy files is auto-upgraded to new customer accounts.** That's why all 7 `templates/customers/*` templates must be present — missing any of them silently flips the store to new accounts on preview/publish.

If the client wants to migrate later, the replacement is Shopify's `<shopify-account>` web component — the branded hosted-page flow (no theme templates).

### Standard Shopify Forms

All forms use Shopify's built-in `{% form %}` tags — no custom JS auth logic:
- `{% form 'customer_login' %}` — login
- `{% form 'create_customer' %}` — register
- `{% form 'customer' %}` — profile edit (on account dashboard)
- `{% form 'customer_address' %}` — add/edit address
- `{% form 'recover_customer_password' %}` — forgot password
- `{% form 'reset_customer_password' %}` — set new password
- `{% form 'activate_customer_password' %}` — activate invited account

Form errors come through `form.errors` — rendered with the same error styling used elsewhere.

### Standard Shopify Forms

All forms use Shopify's built-in `{% form %}` tags — no custom JS auth logic:
- `{% form 'customer_login' %}` — login
- `{% form 'create_customer' %}` — register
- `{% form 'customer' %}` — profile edit (on account dashboard)
- `{% form 'customer_address' %}` — add/edit address
- `{% form 'recover_customer_password' %}` — forgot password
- `{% form 'reset_customer_password' %}` — set new password
- `{% form 'activate_customer_password' %}` — activate invited account

Form errors come through `form.errors` — rendered with the same error styling used elsewhere.

---

## Source Site Reference

### Login / Register page

**Scraped HTML:** `_reference/scraped/html/account-login.html`, `account-register.html`, `login.html`
**React source:** `_reference/repo/app/routes/login.tsx`, `register.tsx` (if present)

**Layout** — two-column grid, full viewport:

```
<main class="grid min-h-screen lg:grid-cols-2">
  <!-- Left: Rewards marketing panel -->
  <section class="bg-clubhouse-green-600 text-white p-8 lg:p-16 flex flex-col justify-center">
    [Rewards logo — white/inverted]
    [Heading + marketing copy]
    [Bullet-point benefits list]
  </section>

  <!-- Right: Login/Register form -->
  <section class="bg-taupe-300 p-8 lg:p-16 flex flex-col justify-center">
    [Optional CMS content block — warning/promo banner]
    [Form]
  </section>
</main>
```

**Stacking:** Mobile shows form panel first, rewards panel below (or hidden, TBC per design).

### Account Dashboard

**Scraped HTML:** `_reference/scraped/html/account.html`
**React source:** `_reference/repo/app/routes/account.tsx`, `account._index.tsx`

**Layout** — sidebar + main content:

```
<main class="container grid gap-5 py-10 lg:grid-cols-10 lg:gap-10">
  <!-- Sidebar (hidden on mobile) -->
  <aside class="col-span-1 hidden lg:col-span-3 lg:block 2xl:col-span-2">
    <p>Hi, {first_name}</p>
    <nav class="border-t border-taupe-400">
      <a class="flex gap-3 border-b border-taupe-400 py-3">
        [Icon] Account Details
      </a>
      [More links: Order History, Rewards, Address Book, Returns, Logout]
    </nav>
  </aside>

  <!-- Main content -->
  <div class="col-span-1 lg:col-span-7 2xl:col-span-8">
    [Page heading + form/content]
  </div>
</main>
```

**Sidebar links** (in order): Account Details, Order History, Rewards, Address Book, Returns (external link), Logout.
**Active state:** `text-clubhouse-green-600` · **Inactive:** `text-neutral-700`.
**Icons:** Heroicons outline 24px (UserIcon, ArchiveBox, Trophy, BookOpen, MapPin, ArrowRightOnRectangle).

**Main content sections** (shown one at a time, routed via URL):
- Account Details → profile form (first name, last name)
- Order History → list of order cards
- Address Book → address list + add/edit
- Rewards → link out to Rewards page or dedicated panel (TBC)
- Returns → external link

### Form field styling (shared across all forms)

```
<!-- Input -->
<input class="block w-full appearance-none border border-taupe-600 bg-white px-4 py-3 placeholder:text-taupe-600 focus:outline-none read-only:cursor-not-allowed read-only:bg-taupe-300">

<!-- Label -->
<label class="mb-2 block text-sm">First Name <span class="text-red-500">*</span></label>

<!-- Error -->
<p class="mb-0 pt-1 text-xs italic text-red-600 empty:hidden">{{ error }}</p>

<!-- Select -->
<select class="block w-full appearance-none border border-taupe-600 bg-taupe-100 px-4 py-3 focus:outline-none">

<!-- Button (primary) -->
<button class="flex items-center gap-2 bg-taupe-900 text-white text-sm tracking-wider uppercase px-4 py-3 lg:px-10 enabled:hover:bg-taupe-600 disabled:opacity-50">
  Save
</button>

<!-- Form grid -->
<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
  [Fields span col-span-1 or col-span-2]
</div>

<!-- Card wrapper -->
<div class="bg-taupe-300 p-6 mb-6">
  [Form]
</div>
```

### Order history cards

```
<article class="bg-taupe-300 p-6 flex flex-col md:flex-row md:items-center gap-4">
  <div class="flex-1">
    <p class="text-sm">Order #{{ order.name }}</p>
    <p class="text-xs text-taupe-700">{{ order.created_at | date: '%b %d, %Y' }}</p>
    <p class="mt-2 font-bold">{{ order.total_price | money }}</p>
  </div>
  <div class="grid grid-cols-3 gap-2 md:grid-cols-6 flex-1">
    [Up to 6 product thumbnails]
  </div>
  <a class="[button primary]">View Order</a>
</article>
```

### Order detail page

Standard Shopify order template:
- Order header (number, date, status)
- Line items table (image, title, variant, qty, price)
- Totals block (subtotal, shipping, tax, discount, total)
- Billing + shipping address (two columns)
- Fulfilment status per line item

### Address book

**Layout:** List of address cards + "Add new address" CTA. Click any → inline edit form.

**Address form fields** (in order, two-column grid):
1. First name (required)
2. Last name (required)
3. Company (optional, full width)
4. Address line 1 (required, full width)
5. Address line 2 (optional, full width)
6. City (required)
7. Country (required, select dropdown)
8. Province/State (conditional — only shown if country has provinces)
9. ZIP/Postal code (required)
10. Phone (optional)
11. "Set as default address" checkbox

**Country/province dependency:** Shopify provides `all_country_option_tags` filter; province dropdown is populated via JS based on selected country (standard Shopify pattern from Dawn — reuse).

### Color palette

| Purpose | Token |
|---------|-------|
| Primary / active nav | `clubhouse-green-600` |
| Rewards panel background | `clubhouse-green-600` |
| Form panel background | `taupe-300` |
| Card background | `taupe-300` |
| Input border | `taupe-600` |
| Input read-only bg | `taupe-300` |
| Select bg | `taupe-100` |
| Button primary | `taupe-900` (hover `taupe-600`) |
| Button danger | `red-300` (hover `red-400`) |
| Error text | `red-600` |
| Required asterisk | `red-500` |
| Inactive nav | `neutral-700` |

---

## Build Plan

Status key: `[ ]` not started · `[~]` in progress · `[x]` complete

### 6A-i — Shared Form Styling Snippets `[x]`
Reusable snippets for consistent form UI across all account pages.
- `snippets/form-input.liquid` — label + input + error wrapper, `required` asterisk, optional `sr-only` label, readonly/autocomplete/autofocus support
- `snippets/form-select.liquid` — label + select + chevron overlay + error, accepts pre-rendered `options` string (e.g. `all_country_option_tags`)
- `snippets/form-button.liquid` — 5 style variants (`dark-grey` default, `text`, `white`, `transparent`, `error`), `compact` / `min_width` / `uppercase` / `full_width` toggles, optional left/right Heroicon, renders as `<a>` if `href` passed, otherwise `<button>`
- Added Heroicons: `archive-box`, `book-open`, `star`, `pencil`, `arrow-right-end-on-rectangle`, `arrow-uturn-left`, `arrow-down-tray`, `gift`, `chart-bar-square`

### 6A-ii — Login & Register `[x]`
Two-column gate page(s) rendered over a full-bleed background image.
- `sections/customer-login.liquid`, `sections/customer-register.liquid`
- `templates/customers/login.json`, `templates/customers/register.json`
- **Structure:** `relative py-20 md:min-h-[80dvh]` outer → `container z-1` → `grid max-w-5xl md:grid-cols-2` card → left green panel + right taupe panel → absolutely-positioned background image (`absolute left-0 top-0 size-full object-cover`) behind everything
- **"Sign in" / "Create account" heading:** inside the right panel above the promo banner, centered, Playfair serif (`font-serif`), `text-3xl lg:text-4xl`
- **Rewards panel (left):** schema-editable logo (hidden on mobile), schema-editable heading (defaults to source copy), 3 default bullets — Gift / Chart-bar-square (Tier) / Star — with source-matching richtext including bold marks. Icons styled with `opacity-80` wrapper to match the muted source SVGs
- **Promo banner:** defaults to source copy — "Hurry, new customers are currently receiving <strong>exclusive benefits & rewards</strong> points!" — rendered with trophy icon + `[&_p]:mb-4` to match the source's implicit paragraph spacing
- **Red warning banner removed** per client decision (was source-site passwordless-auth warning, not relevant to classic accounts)
- **Forgot password:** inline recover panel toggle within the login section, submits to `recover_customer_password`. Server-side `show_recover` flag re-opens the panel after submit when there's a success or error
- **Cross-links:** "Don't have an account? Create one" on login, "Already have an account? Sign in" on register

### 6A-stubs — Remaining 5 templates (functional stubs) `[x]`
Built as functional stubs to keep the store on legacy customer accounts (see architecture note). Valid markup + forms work, but without the full source-matching styling yet.
- `sections/customer-account.liquid` + `templates/customers/account.json`
- `sections/customer-order.liquid` + `templates/customers/order.json`
- `sections/customer-addresses.liquid` + `templates/customers/addresses.json`
- `sections/customer-reset-password.liquid` + `templates/customers/reset_password.json`
- `sections/customer-activate-account.liquid` + `templates/customers/activate_account.json`

### 6A-iii — Account Dashboard & Profile `[x]`
Main account page: sidebar + tab-routed main column (Account / Order History / Rewards). Replaced stub with full build.
- `snippets/account-sidebar.liquid` — reusable sidebar (greeting + 6 nav items). Accepts `active` (`'account'|'orders'|'rewards'|'addresses'`) and `returns_url` params. Re-used in 6A-iv/v. Tab links carry `data-account-tab` (`account|order-history|rewards`) for JS-driven active-state swap on hashchange.
- `sections/customer-account.liquid` — outer `container grid gap-5 py-10 lg:grid-cols-10 lg:gap-10`, sidebar on left (`lg:col-span-3 2xl:col-span-2`), main on right (`lg:col-span-7 2xl:col-span-8`). Main column holds three sibling panels (`<section data-account-panel="account|order-history|rewards">`) — only one visible at a time, controlled by URL hash. Rewards sidebar link routes to `{{ routes.account_url }}#rewards` and renders `snippets/account-rewards-panel.liquid` as the third panel.
- **Hash-routed tab JS** (inline `<script>` at bottom of section): reads `location.hash` on load + listens for `hashchange`, toggles `hidden` on each `[data-account-panel]` and swaps `text-clubhouse-green-600`/`text-neutral-700` on each `[data-account-tab]` sidebar link. Defaults to `account` when hash is empty/unknown. No page reload — rewards panel's own MutationObserver on `hidden` kicks off the Upzelo activity fetch when it becomes visible.
- `layout/theme.liquid` redirects signed-in visitors from `/pages/rewards` to `/account#rewards` so the old standalone rewards page still works as an entry point.
- Account panel h1 "My Account" + welcome paragraph, `{% form 'customer' %}` (first/last name) inside `bg-taupe-300 p-6` card with success/error banners. Order History panel h1 (was h2 before the tab refactor — now a top-level panel to match source). Rewards panel h1 "Rewards" per source.
- Returns URL defaults to `https://returns.trendygolf.com` via `| default:` fallback on the render call (schema `url` type doesn't support `default` field); merchant can override in editor.
- Logout uses native `routes.account_logout_url`.
- Schema settings: `returns_url`, `heading`, `welcome_text`, `card_intro`, `orders_per_page` — source-exact defaults copied from `account._index.tsx`.
- Mobile: sidebar stacks above main content; all three panels swap under it via the same hash-routed JS.

### 6A-iv — Order History & Order Detail `[x]`
- Order list (inline on dashboard, `#order-history`): card grid mirroring `account.orders.tsx` — bold "Order number" label, `grid-cols-3 xl:grid-cols-6` thumbnails with `hidden xl:block` (i > 2) and `!hidden` (i > 5) cutoffs, date/total + "View Order" button (desktop right, mobile stacked). `{% paginate customer.orders by section.settings.orders_per_page %}` — schema range 5–50, default 10. Pagination nav appends `#order-history` so page changes land on the list. Empty state when `customer.orders.size == 0`.
- Order detail (`sections/customer-order.liquid`): full sidebar+main layout (sidebar with `active: 'orders'`). Mobile-only back button (→ account dashboard, `lg:hidden`). H1 "Order Details", order number/date/total meta rows with `<b>` labels. Delivery address concatenated from `order.shipping_address` (note: React uses `customer.defaultAddress` but `order.shipping_address` is semantically correct for an order). "Start a Return" → `{returns_url}/?order={{ order.id }}&zip={{ shipping.zip }}`. Line items Card with `aspect-[3/4] max-w-32 flex-1` image + `flex-[2]` details (name, size, qty, bold price with compare-at strikethrough on discount). Payment Details Card with subtotal/discount/shipping table, hr, total.
- Schema: `returns_url` on both sections, plus `orders_per_page` on the dashboard.

### 6A-v — Address Book `[x]`
- `snippets/address-item.liquid` — read-only view matching React's `AddressItem` (name bold + address1/2/city/zip/country/province/phone as mb-0 `<p>`)
- `snippets/address-form.liquid` — add/edit form matching React's `AddressForm` (two-column grid: first/last name, address1/2, city/zip, country + conditional province, phone; submit button swaps `Add address` ↔ `Save address` + arrow-down-tray icon based on `is_new`). Uses `{% form 'customer_address', address %}`.
- `sections/customer-addresses.liquid` — sidebar + main layout. Default Address Card (view + inline edit toggle, no delete/set-default since it's already default), "Add new address" toggle button + collapsible add panel, Other Addresses Card (view + Set-default/Edit/Delete per address).
- Toggle UI uses HTML `hidden` attribute (not `!hidden` class) to avoid Tailwind display-class conflicts. Small inline `<script>` handles: edit↔view toggle, add-panel toggle + scroll-into-view, country→province dependency (reading `data-provinces` JSON from `country_option_tags`), auto-opening any edit panel whose form has errors (detects `.bg-red-100` child).
- Set-default and Delete are separate sibling `{% form %}` blocks per address (HTML doesn't allow nested forms). Delete uses explicit `<input name="_method" value="delete">` to override Shopify's default PUT.

### 6A-vi — Password Reset & Account Activation `[x]`
Minimal styling pass over the stub sections.
- `sections/customer-reset-password.liquid` — new password + confirm, two-column shell
- `sections/customer-activate-account.liquid` — set initial password + confirm, two-column shell
- Both use the two-column shell from login (or a simpler single-column variant — TBC)
- `templates/customers/reset_password.json`, `templates/customers/activate_account.json`

### 6A-vii — Validation & Full-flow Test `[ ]`
- `validate_theme` via Shopify MCP
- Manual test: register → activation email → login → edit profile → add address → view order → logout
- Password reset flow: forgot → email → reset → login
- Accessibility check: labels, focus states, error announcements

---

## Resolved Decisions

- ✅ **Account system:** Classic (legacy) customer accounts — matches live site. All 7 templates must exist to prevent Shopify auto-upgrading the store to new customer accounts.
- ✅ **Returns URL:** `https://returns.trendygolf.com` — schema-editable theme setting for sidebar link and "Start a Return" button
- ✅ **Rewards panel content:** Defaulted to source copy ("Register now and begin your journey..." + 3 bullets). Schema-editable so client can update.
- ✅ **Red warning banner:** Removed (was passwordless-auth note, not relevant to classic).
- ✅ **"Sign in" / "Create account" heading:** Inside right panel, centered, Playfair serif.
- ✅ **Rewards sidebar link:** Renders a dedicated panel inside the account dashboard (`/account#rewards`). Signed-in visitors to `/pages/rewards` are redirected to `#rewards` via `layout/theme.liquid`.
- ✅ **Order history pagination:** Numbered pages (default 10 per page, schema range 5–50) — matches source site pattern.
- ✅ **Mobile sidebar behaviour:** Sidebar stacks above main content on mobile (single-page hash-routed model). Source site hides the sidebar on subpages and uses back buttons; we kept the simpler stacked layout since all three panels live on one URL.

## Remaining Client Questions

_None — all resolved._

---

## Source File Reference

| Component | Scraped HTML | React Source | Old Shopify (do-not-use) |
|-----------|-------------|-------------|--------------------------|
| Login page | `_reference/scraped/html/account-login.html`, `login.html` | `_reference/repo/app/routes/login.tsx` | `_do-not-use/templates/customers/login.json` |
| Register page | `_reference/scraped/html/account-register.html` | `_reference/repo/app/routes/login.tsx` (shared) | `_do-not-use/templates/customers/register.json` |
| Account dashboard | `_reference/scraped/html/account.html` | `_reference/repo/app/routes/account.tsx`, `account._index.tsx` | `_do-not-use/templates/customers/account.json` |
| Order history | (within account) | `_reference/repo/app/routes/account.orders.tsx` | — |
| Order detail | — | `_reference/repo/app/routes/account.(orders).$id.tsx` | `_do-not-use/templates/customers/order.json` |
| Address book | — | `_reference/repo/app/routes/account.addresses.tsx`, `.add.tsx`, `.update.tsx`, `.delete.tsx`, `.default.tsx` | `_do-not-use/templates/customers/addresses.json` |
| Password reset | — | — | `_do-not-use/templates/customers/reset_password.json` |
| Activate account | — | — | `_do-not-use/templates/customers/activate_account.json` |

---

## Shopify Docs to Reference via MCP

Use `search_docs_chunks` / `fetch_full_docs` before writing each template:
- `customer` object (fields available in Liquid)
- `form` tag variants: `customer_login`, `create_customer`, `customer`, `customer_address`, `recover_customer_password`, `reset_customer_password`, `activate_customer_password`
- `order` object and line items
- `address` object and country/province handling
- `all_country_option_tags` filter
- `customer.orders` pagination