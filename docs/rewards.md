# Rewards (TGCC) — Phase 4A

## Overview

The Rewards programme — **TRENDYGOLF Country Club (TGCC)** — is powered by **Upzelo**, a UK loyalty platform. The Upzelo Shopify app is installed on the staging store (`trendy-golf-development.myshopify.com`) with the **app embed turned on**. That means the launcher script and HMAC-authenticated `window.upzelo` global are live sitewide — we do **not** need to inject the script, compute the customer hash, or build an App Proxy.

This phase rebuilds the source site's **custom UI around Upzelo** so the theme matches staging exactly. Upzelo writes customer data (points, tier, rewards codes) to Shopify customer metafields, which Liquid reads directly. Dynamic interactions (opening the widget, redeeming actions, paginating activity history) go through `window.upzelo` / `window.upzelo_blocks` / direct fetches to the Upzelo loyalty API.

---

## Upzelo Integration Primer

### Loaded globally (by app embed — no work for us)

- `<script type="module" src="https://assets.upzelo.com/launcher/index.js" appId=… customerId=… hash=…>` — Upzelo's authenticated launcher
- `window.upzelo` — exposes `.toggle()` (open/close widget), `.openModal('dob')` (birthday modal) and other actions
- Upzelo's own floating widget panel — their design, opens on `upzelo.toggle()`

### Customer metafields (synced by Upzelo app → available in Liquid)

| Key | Type | Usage |
|-----|------|-------|
| `customer.metafields.upzelo.points` | `number_integer` | Points balance |
| `customer.metafields.upzelo.tier` | `json` | `{ id, title, entry_requirement, … }` — title is `Bronze` / `Silver` / `Gold` / `Black` |
| `customer.metafields.upzelo.referral_url` | `single_line_text_field` | Refer-a-friend URL |
| `customer.metafields.upzelo.active_rewards` | `json` | Array of `{ id, code, title, is_redeemed, expiry, … }` |

### Shop metafields (optional, not required for this phase)

`shop.metafields.upzelo.points_name`, `.tiers`, `.template_strings`, `.points_enabled`, `.rewards`

### JS helpers required

- **`assets.upzelo.com/launcher/index.js`** — loaded by app embed (✅ done)
- **`assets/upzelo-blocks.js`** — vendor the 150-line helper from `_reference/repo/public/scripts/upzelo_blocks.js`. Exposes `window.upzelo_blocks.redeemAction(id)` and the API fetch cache. Needed by the earn-points grid. Load via `{{ 'upzelo-blocks.js' | asset_url | script_tag }}` in `theme.liquid`.

### Live API calls (client-side fetch)

| Purpose | Endpoint | Headers | Used by |
|---------|----------|---------|---------|
| Fetch user | `GET https://app.upzelo.com/api/loyalty/user` | `x-App-Id`, `x-Upz-Customer-Id` | Account dashboard |
| Activity feed (paginated) | `GET https://app.upzelo.com/api/loyalty/activity-feed?limit=10&cursor=…` | `x-App-Id`, `x-Upz-Customer-Id` | Account dashboard history |
| Find action by title | `GET https://app.upzelo.com/api/loyalty/tiers` | `x-App-Id`, `x-Upz-Customer-Id` | Earn-points grid (redeem social actions) |
| Redeem action | `POST https://app.upzelo.com/api/loyalty/activity/:id` | `x-App-Id`, `x-Upz-Customer-Id` | Earn-points grid |

`x-App-Id` = Upzelo app ID (public, expose as theme setting `upzelo_app_id`). `x-Upz-Customer-Id` = `customer.id` (logged-in only).

---

## Source Site Reference

**Scraped page data:** `_reference/scraped/data/stream/rewards-route-routes-$.json`
**Scraped HTML:** `_reference/scraped/html/rewards.html`

**Source repo components:**
- `_reference/repo/app/routes/account.rewards.tsx` — Account rewards dashboard tab
- `_reference/repo/app/components/blocks/rewardsTierTable.tsx` — Tier comparison table block
- `_reference/repo/app/components/blocks/rewardsIconGrid.tsx` — Earn-points grid block
- `_reference/repo/app/components/partials/global/rewardsPopup.tsx` — Global rewards modal
- `_reference/repo/app/components/partials/global/rewardsModalTrigger.tsx` — Cart drawer logged-out banner
- `_reference/repo/app/components/partials/global/rewardsWidgetTrigger.tsx` — Cart drawer logged-in button
- `_reference/repo/app/components/assets/rewardsTrue.tsx` / `rewardsFalse.tsx` — Check / X icons
- `_reference/repo/app/utils/upzelo.ts` — API fetch helpers
- `_reference/repo/app/types/upzelo.ts` — Type definitions
- `_reference/repo/public/scripts/upzelo_blocks.js` — Client-side helper
- `_reference/repo/app/hooks/useCustomScripts.ts` — Launcher injection (not needed — app embed handles it)

---

## Page Composition — `templates/page.rewards.json`

From scraped stream JSON (5 blocks, top to bottom):

| # | Block type | Purpose | Reuse existing? |
|---|-----------|---------|-----------------|
| 1 | `bannerCarousel` | Hero banner, single slide, "Join Now" CTA → `/account` | ✅ `sections/hero-carousel.liquid` |
| 2 | `content` | Intro copy ("We are offering you the opportunity…") | ✅ `sections/content-block.liquid` |
| 3 | `content` | "How It Works" heading | ✅ `sections/content-block.liquid` |
| 4 | `iconGrid` | 3 columns: Sign Up / Earn Points / Climb the Tiers | ✅ `sections/icon-grid.liquid` (built in 4E) |
| 5 | `rewardsTierTable` | Tier comparison: Reward / Bronze / Silver / Gold / Black | ❌ **new section** |

**Note:** `rewardsIconGrid` (earn-points grid) is NOT on the scraped rewards page. It's a separately available Sanity block. Phase 4A builds the tier table; the earn-points grid can be deferred or added as a bonus section if/when the client asks for it.

---

## New Sections Required

### 1. `sections/rewards-tier-table.liquid`

**Markup structure (from `rewardsTierTable.tsx`):**

```
m-auto max-w-screen-xl
├── container mb-12 max-w-3xl text-center (topContent: heading + paragraph)
├── overflow-x-scroll px-6 md:overflow-auto 2xl:container
│   └── min-w-[720px] bg-taupe-300 px-6 py-10 lg:min-w-full
│       ├── grid grid-cols-[1.5fr_1fr_…] (column headers: icon + label)
│       ├── my-4 border-b border-taupe-600 (divider)
│       ├── grid gap-4 (rows)
│       │   └── grid min-h-12 grid-cols-[1.5fr_1fr_…] (cells: text or boolean check)
│       └── grid pt-8 grid-cols-[1.5fr_1fr_…] (footer: points required / spend tier)
└── flex justify-center pt-10 (CTA button)
```

**Grid columns class (from `getGridColsClass`):** First column is 1.5fr (the reward name), remaining are 1fr each. Supports 3–12 columns total.

**Tier colour tokens (exact from source, applied to both icon fill + text):**

| Tier | Text class | Icon `[&_rect]:!fill-*` class |
|------|-----------|------------------------------|
| Bronze | `text-amber-700` | `amber-700` |
| Silver | `text-taupe-700` | `taupe-700` |
| Gold | `text-yellow-600` | `yellow-600` |
| Black | `text-taupe-900` | `taupe-900` |
| Green | `text-clubhouse-green-600` | `clubhouse-green-600` |

**Icons:**
- Column icon: `star` (Bronze/Silver/Gold) or `trophy` (Black) — from Heroicons outline, size-12
- Row check: `IconRewardsTrue` (green tick SVG, `#3EC56E`) / `IconRewardsFalse` (grey cross SVG, `#B8B5AA`) — size-6. Add both as icon snippets.

**Seeded content (from scraped JSON):**

| Column | Bronze | Silver | Gold | Black |
|--------|--------|--------|------|-------|
| **Points Required / Spend** | Join TGCC | Spend £250 | Spend £500 | Spend £3,000 |
| Free 2 day delivery | ✅ | ❌ | ❌ | ❌ |
| Free next day delivery | ❌ | ✅ | ✅ | ✅ |
| Monthly competitions & prize draws | ✅ | ✅ | ✅ | ✅ |
| Up to date with the latest launches and news | ✅ | ✅ | ✅ | ✅ |
| Free TGCC Gift | ❌ | ✅ | ✅ | ✅ |
| Personal Shopping Access | ❌ | ❌ | ❌ | ✅ |
| Concierge including exclusive invites to events | ❌ | ❌ | ❌ | ✅ |

Top content: heading "TGCC Tiers" (serif, h3) + paragraph "As you shop and engage with us, you unlock higher tiers with bigger perks and better rewards. Rise through the ranks and become the ultimate player."

Footer CTA: "Join Now" → `/account`

**Schema:**

```jsonc
{
  "name": "Rewards Tier Table",
  "settings": [
    { "type": "richtext", "id": "top_content", "label": "Top content (heading + intro)" },
    { "type": "text", "id": "cta_label", "default": "Join Now" },
    { "type": "url", "id": "cta_link" }
  ],
  "blocks": [
    {
      "type": "column",
      "name": "Tier column",
      "limit": 12,
      "settings": [
        { "type": "text", "id": "header", "label": "Tier name" },
        { "type": "select", "id": "icon", "options": [
          { "value": "star", "label": "Star" },
          { "value": "trophy", "label": "Trophy" },
          { "value": "none", "label": "None (first column)" }
        ]},
        { "type": "select", "id": "text_colour", "options": [
          { "value": "bronze" }, { "value": "silver" }, { "value": "gold" },
          { "value": "black" }, { "value": "green" }
        ]},
        { "type": "text", "id": "footer_text", "label": "Footer text (points required / spend tier)" }
      ]
    },
    {
      "type": "row",
      "name": "Reward row",
      "limit": 20,
      "settings": [
        { "type": "text", "id": "label", "label": "Reward label" },
        { "type": "checkbox", "id": "col_1", "default": false },
        { "type": "checkbox", "id": "col_2", "default": false },
        { "type": "checkbox", "id": "col_3", "default": false },
        { "type": "checkbox", "id": "col_4", "default": false },
        { "type": "checkbox", "id": "col_5", "default": false }
      ]
    }
  ],
  "presets": [{ "name": "Rewards Tier Table" }]
}
```

**Implementation notes:**
- First column header is always the reward label column — rendered with `first-of-type:items-start` alignment.
- Footer first cell is `first-of-type:text-left first-of-type:font-bold` (left-aligned bold, e.g. "Points Required").
- `min-w-[720px]` on the inner table to force horizontal scroll on mobile.
- Seed the template JSON with 4 tier columns (Bronze/Silver/Gold/Black) + 7 rows exactly matching source.

### 2. `sections/rewards-earn-grid.liquid` — **deferred** (optional)

Matches `rewardsIconGrid.tsx`. 6 cards: Create Account / Facebook / X / Instagram / SMS / Birthday. Interactive only when `customer` is logged in; clicks trigger `window.upzelo_blocks.redeemAction()` or `window.upzelo.openModal('dob')`.

**Defer unless client explicitly asks** — it's not on the scraped rewards page.

---

## Global Rewards Modal

### `snippets/rewards-modal.liquid`

Rendered in `layout/theme.liquid` (alongside cart drawer + overlay). Opens when:
- Cart drawer logged-out banner "Learn more" button is clicked (dispatches `openRewardsModal` custom event)
- Any call to `window.dispatchEvent(new CustomEvent('openRewardsModal'))`

**Markup (from `rewardsPopup.tsx`):**

```
<Modal size="2xl" clearContentPadding>
  <div class="grid grid-cols-1 bg-taupe-300 md:grid-cols-2">
    <div class="aspect-square size-full">
      [Image — desktop + mobile variants]
    </div>
    <div class="flex flex-col gap-5 px-5 py-8 md:px-10 md:py-12">
      <div class="text-left">
        [Optional logo — w-36]
        [Rich-text content]
        [Bullet list: icon (w-8) + richtext]
      </div>
    </div>
  </div>
</Modal>
```

**Modal container pattern:** reuse the existing Phase 1F Drawer/Modal pattern (fixed, centred, overlay, focus trap, escape to close).

**Schema (in `config/settings_schema.json` under "Rewards" section):**

```jsonc
{
  "type": "image_picker", "id": "rewards_modal_image",
  "label": "Modal image (desktop)"
},
{
  "type": "image_picker", "id": "rewards_modal_image_mobile",
  "label": "Modal image (mobile)"
},
{
  "type": "image_picker", "id": "rewards_modal_logo",
  "label": "Modal logo (top of right column)"
},
{
  "type": "richtext", "id": "rewards_modal_content",
  "label": "Modal content (heading + copy)"
},
{
  "type": "richtext", "id": "rewards_modal_bullet_1" /* … × 3 */,
  "label": "Bullet point 1"
}
```

**JS behaviour:**

```js
// assets/theme.js — add to drawer/modal manager
window.addEventListener('openRewardsModal', () => openModal('rewards-modal'))
document.querySelectorAll('[data-open="rewards-modal"]').forEach(btn => {
  btn.addEventListener('click', () => window.dispatchEvent(new CustomEvent('openRewardsModal')))
})
```

---

## Cart Drawer Integration

Already partly built in Phase 1E (`sections/cart-drawer.liquid:34–50`). Wire up click actions:

### Logged-out banner — "Learn more"

```liquid
<button type="button"
        class="inline font-bold underline"
        data-open="rewards-modal">
  Learn more
</button>
```

### Logged-in button — "TGCC Rewards"

```liquid
<button type="button"
        onclick="window.upzelo?.toggle?.()"
        class="mb-4 flex w-full items-center gap-3 border border-taupe-600 p-4 text-left text-sm hover:border-taupe-900">
  {% render 'icon', icon: 'trophy', size: 'size-5', class: 'min-w-5 shrink-0' %}
  <span><b>TGCC Rewards</b> — View your points &amp; rewards</span>
</button>
```

No inline JS — prefer a class selector + event listener in `theme.js`.

---

## Account Rewards Dashboard — `templates/customers/rewards.json` *(or sub-route)*

Matches `account.rewards.tsx` (295 lines). Shopify customer accounts don't support sub-routes in classic account pages, so we either:
- **(a) Nested route under account.liquid** — render at `/account#rewards` with a tab switcher (JS-driven)
- **(b) Separate customer template** — `templates/customers/rewards.liquid` accessed via `/account/rewards` link, using Shopify's standard `customer-` template pattern

Recommend **(b)** — matches staging URL (`/account/rewards`) and keeps dashboards modular.

### Sections

#### `sections/customer-rewards.liquid`

**Structure:**

```
<AccountBackButton />   [reusable component → /account]
<h1>Rewards</h1>

[Green info banner — trophy icon + "As a TGCC member, you'll earn points…"]
  class: mb-8 flex items-center gap-2 bg-clubhouse-green-600 p-2 text-xs text-white md:p-4 md:text-sm

[Current tier / points card]
  class: grid-cols-2
  Left: [Icon (trophy for Bronze, star for others)] + [Tier name] + "Current Tier"
  Right: [{{ points }} Points] + "Your Points"

[Active rewards row — horizontal scroll]
  class: mb-6 bg-taupe-300 p-6
  Heading: "Active Rewards" + "Check out your rewards and find your code below to redeem at checkout."
  Cards: w-36 md:w-44
    Top half: bg-clubhouse-green-600 text-white px-4 py-6 → {{ reward.title }}
    Bottom half: bg-white px-4 py-2 hover:bg-gray-100 → {{ reward.code }} + copy icon
    onClick: copy code, show "Copied!" for 2s

[Rewards history — paginated activity feed]
  Heading: "Rewards History"
  Table (grid-cols-4): Date / Action / Points / Balance After
  Rows from live API fetch
  Pagination: "Newer history" / "Older history" buttons (cursor-based)
```

**Data sources:**
- **Tier + points + active rewards** — `customer.metafields.upzelo.*` (server-rendered Liquid, no fetch)
- **Activity feed** — vanilla JS fetch to `https://app.upzelo.com/api/loyalty/activity-feed?limit=10&cursor=…` on page load. Pagination via `next_cursor` / `prev_cursor` in response.

**JS:**

```js
// assets/customer-rewards.js
const APP_ID = document.querySelector('[data-upzelo-app-id]').dataset.upzeloAppId
const CUSTOMER_ID = document.querySelector('[data-customer-id]').dataset.customerId

async function loadActivity(cursor) {
  const url = new URL('https://app.upzelo.com/api/loyalty/activity-feed')
  url.searchParams.set('limit', '10')
  if (cursor) url.searchParams.set('cursor', cursor)
  const res = await fetch(url, {
    headers: { 'x-App-Id': APP_ID, 'x-Upz-Customer-Id': CUSTOMER_ID }
  })
  const { data } = await res.json()
  render(data.activities, data.next_cursor, data.prev_cursor)
}

function copyCode(code, el) {
  navigator.clipboard.writeText(code)
  el.textContent = 'Copied!'
  setTimeout(() => (el.textContent = code), 2000)
}
```

**Tier icon mapping (in Liquid):**

```liquid
{%- assign tier = customer.metafields.upzelo.tier.value -%}
{%- case tier.title -%}
  {%- when 'Bronze' -%}
    {%- assign tier_icon = 'trophy' -%}
    {%- assign tier_color = 'text-amber-700' -%}
  {%- when 'Silver' -%}
    {%- assign tier_icon = 'star' -%}
    {%- assign tier_color = 'text-taupe-700' -%}
  {%- when 'Gold' -%}
    {%- assign tier_icon = 'star' -%}
    {%- assign tier_color = 'text-yellow-600' -%}
  {%- when 'Black' -%}
    {%- assign tier_icon = 'star' -%}
    {%- assign tier_color = 'text-taupe-900' -%}
{%- endcase -%}
```

**Note:** `account.rewards.tsx` uses `IconTrophy` for Bronze only, `IconStar` for Silver/Gold/Black. Match this exactly.

### Sidebar link

Update `snippets/account-sidebar.liquid` (currently untracked per `git status`) to link "Rewards" → `/account/rewards` with trophy icon. Active state when on `/account/rewards`.

---

## New Snippets / Icons

- `snippets/icon.liquid` — add two new icon cases:
  - `rewards_check` — green tick SVG from `rewardsTrue.tsx` (`fill="#3EC56E"`)
  - `rewards_cross` — grey cross SVG from `rewardsFalse.tsx` (`fill="#B8B5AA"`)
- `snippets/rewards-modal.liquid` — global modal shell (included from `theme.liquid`)

---

## Theme Settings (add to `config/settings_schema.json`)

New "Rewards (Upzelo)" settings group:

| Setting | Type | Purpose |
|---------|------|---------|
| `upzelo_app_id` | `text` | Upzelo App ID — exposed on `<body>` dataset for JS |
| `rewards_modal_image` | `image_picker` | Modal image (desktop) |
| `rewards_modal_image_mobile` | `image_picker` | Modal image (mobile) |
| `rewards_modal_logo` | `image_picker` | Logo at top of modal right column |
| `rewards_modal_content` | `richtext` | Modal heading + copy |
| `rewards_modal_bullet_{1..3}` | `richtext` | Bullet list items |
| `rewards_modal_bullet_{1..3}_icon` | `image_picker` | Bullet icon |
| `rewards_info_banner_text` | `richtext` | Account page green banner copy |

---

## Layout Integration — `layout/theme.liquid`

Add before `</body>`:

```liquid
{% render 'rewards-modal' %}
<body data-upzelo-app-id="{{ settings.upzelo_app_id }}" {% if customer %}data-customer-id="{{ customer.id }}"{% endif %} …>
<script src="{{ 'upzelo-blocks.js' | asset_url }}" defer></script>
```

**Do NOT** add the Upzelo launcher — the app embed handles it.

---

## Delivery Plan

Status key: `[ ]` not started · `[~]` in progress · `[x]` complete

### 4A-i — Tier comparison table `[ ]`
Build `sections/rewards-tier-table.liquid` with schema. Add `rewards_check` + `rewards_cross` icons to `snippets/icon.liquid`. Seed `templates/page.rewards.json` with 4 tier columns + 7 rows matching the source exactly. Validate with `validate_theme`.

### 4A-ii — Rewards modal `[ ]`
Build `snippets/rewards-modal.liquid`. Add theme settings. Include in `theme.liquid`. Wire `openRewardsModal` custom event in `theme.js`.

### 4A-iii — Cart drawer wiring `[ ]`
Update `sections/cart-drawer.liquid:34–50`: attach `data-open="rewards-modal"` to "Learn more" button; wire logged-in button's click → `window.upzelo.toggle()`.

### 4A-iv — Rewards page template `[ ]`
Create `templates/page.rewards.json` assembling: `hero-carousel` (1 slide, Join Now CTA), `content-block` × 2 (intro + "How It Works"), `icon-grid` (3 cols), `rewards-tier-table`. Visual compare against scraped rewards.html.

### 4A-v — Account rewards dashboard `[ ]`
Build `templates/customers/rewards.liquid` + `sections/customer-rewards.liquid`. Add `upzelo-blocks.js` helper to `assets/`. Add `customer-rewards.js` with activity feed fetch + pagination + code-copy. Update `snippets/account-sidebar.liquid` with rewards link. Validate.

### 4A-vi — Validation & polish `[ ]`
- `validate_theme` clean
- Visual parity with scraped rewards.html + account.rewards page
- Test logged-out: marketing page renders, cart "Learn more" opens modal
- Test logged-in: tier + points show correctly on dashboard, activity feed loads + paginates, copy-code works, cart "TGCC Rewards" button opens Upzelo widget

---

## Deferred / Optional

- **Earn-points grid** (`rewardsIconGrid.tsx` equivalent) — not on scraped rewards page. Build only if client requests it.
- **Referral page** (`/refer-a-friend?referralLink=…`) — commented out on source in `account.rewards.tsx:155–171`. Skip unless client asks.
- **Birthday modal wiring** (`upzelo.openModal('dob')`) — only relevant if earn-points grid is built.

---

## Client Questions

- [x] ~~Confirm Upzelo is the loyalty provider going forward~~ — yes, app installed + embed enabled on staging
- [x] ~~Upzelo App ID~~ — confirmed from live launcher script on `trendy-golf-development.myshopify.com`: **`upz_app_10195ba3dcfd`**. (Different Upzelo app to the old Remix staging, which used `upz_app_238a1df0636e`.)
- [ ] Supply rewards-modal image, logo, and copy (can pull defaults from source site if not provided)
- [ ] Confirm `/account/rewards` URL is acceptable (matches staging)
- [ ] Confirm the logged-in cart "TGCC Rewards" button should open **Upzelo's own widget** (staging behaviour) rather than a custom-designed panel

**Reference values from source site staging env:**

| Key | Value | Notes |
|-----|-------|-------|
| `UPZELO_APP_ID` | `upz_app_10195ba3dcfd` | Public — used as `x-App-Id` header on API calls. Verified live via view-source on staging. |
| `UPZELO_APP_URL` | `https://app.upzelo.com/api` | Public — API base |
| `UPZELO_API_KEY` | *(held by Upzelo's Shopify app)* | ⚠️ **Secret** — do NOT put in theme. App embed handles HMAC server-side; we don't need direct access to this. |

---

## Reference Scrape Keys

All paths relative to `_reference/`:

| Theme Component | Scraped HTML | Scraped Data | Source TSX / JS |
|-----------------|--------------|--------------|-----------------|
| Rewards marketing page | `scraped/html/rewards.html` | `scraped/data/stream/rewards-route-routes-$.json` | n/a (composed of blocks) |
| Tier table | `scraped/html/rewards.html` (§ `rewardsTierTable`) | ditto | `repo/app/components/blocks/rewardsTierTable.tsx` |
| Rewards modal | `scraped/html/rewards.html` (global) | `scraped/data/stream/_site.json` (global.rewardsModal) | `repo/app/components/partials/global/rewardsPopup.tsx` |
| Cart logged-out banner | `scraped/html/collection-mens-apparel.html` | — | `repo/app/components/partials/global/rewardsModalTrigger.tsx` |
| Cart logged-in button | (logged-out scrape — button rendered via account session) | — | `repo/app/components/partials/global/rewardsWidgetTrigger.tsx` |
| Account dashboard | `scraped/html/account.html` (sidebar link) | — | `repo/app/routes/account.rewards.tsx` |
| Upzelo API helpers | — | — | `repo/app/utils/upzelo.ts`, `repo/public/scripts/upzelo_blocks.js` |
| Check / cross SVG icons | — | — | `repo/app/components/assets/rewardsTrue.tsx`, `rewardsFalse.tsx` |