# Client Questions

> Decisions needed from the client before we can proceed with certain features. Grouped by topic.

---

## Klaviyo — Wishlist & Back-in-Stock

**Decision: Using Klaviyo** — confirmed. Both wishlist and back-in-stock notifications will use Klaviyo's API, matching the current site.

### What we need
1. **Klaviyo account details and API key** for the new Shopify store
2. **Klaviyo catalog sync** with Shopify enabled (so variant IDs are recognised for back-in-stock subscriptions)
3. **Shopify app proxy or custom app** — needed to make server-side Klaviyo API calls from the theme (the current site uses a Remix server; Shopify themes can't call Klaviyo directly from Liquid)

### Still to confirm
- Is the **20-item wishlist cap** intentional or should it be raised?
- Which **wishlist page features** are required? Current site has: sort (latest/price), grid/list toggle, add-to-basket from wishlist, trash to remove

---

## Lipscore — Product Reviews

**Current site uses Lipscore** for product reviews (rating summaries + full review modal with pagination). The Remix site calls Lipscore's API server-side using a secret key.

### The problem
Shopify themes can't securely call the Lipscore API — the secret key can't be exposed in client-side JS. We need one of:
1. **Lipscore's own Shopify app** — if one exists, simplest path
2. **Lightweight proxy** (e.g. Cloudflare Worker) — holds the secret, theme JS calls the proxy
3. **Shopify app proxy** — more involved, requires building/hosting a small app

### What we need
1. **Lipscore API credentials** — `LIPSCORE_API_URL`, `LIPSCORE_API_KEY`, `LIPSCORE_API_SECRET`
2. **Confirm staying with Lipscore** — or migrating to a platform with native Shopify support (Judge.me, Yotpo, Stamped, etc.)? If migrating, building a Lipscore integration is wasted work.
3. **Preferred integration approach** — existing Lipscore app, proxy, or Shopify app?

---

## Rebuy — "Explore More" Product Recommendations *(Resolved)*

**Decision: Using Rebuy.** App installed + enabled on `trendy-golf-development` (global app embed active at `config/settings_data.json`). Public storefront key stored under **Theme settings → Rebuy → Rebuy API key** (`settings.rebuy_api_key`). Consumed by:
- **Cart drawer upsells** — Rebuy `trending_products` → Shopify Recommendations → curated collection
- **PDP "Explore More"** — Rebuy `similar_products` → Shopify Section Rendering API to hydrate cards; section hides on empty/error

**Outstanding:** confirm Rebuy's **Smart Cart** is disabled in the Rebuy dashboard so it doesn't auto-inject over our custom cart drawer; check other Rebuy widget rulesets aren't double-rendering on PDP.

---

## Kiwi Sizing

Need the **Kiwi Sizing account URL / embed code** for the size guide modal iframe on PDP.

---

## Upzelo — Rewards (TGCC)

**Decision: Using Upzelo** — confirmed. App installed on `trendy-golf-development.myshopify.com` with the app embed enabled in the theme editor, which handles the launcher script + HMAC customer hash automatically. Full spec: [docs/rewards.md](rewards.md).

### What we need

1. ~~Confirm Upzelo App ID~~ ✅ — `upz_app_10195ba3dcfd`, verified from live launcher script on `trendy-golf-development.myshopify.com`. Store as theme setting `upzelo_app_id`.
2. **Rewards modal content** — image (desktop + mobile), optional logo, heading + copy, 3 bullet points with icons. Defaults seeded from source-site Sanity stream (heading "Rewards That Hit Different", 3 bullets); admin can override in theme settings → Rewards (TGCC / Upzelo).
3. ~~Confirm dashboard URL~~ — resolved. `/pages/rewards` is the marketing page for everyone; logged-in customers are redirected to `/account#rewards` from `layout/theme.liquid`. The rewards view inside /account is owned by the accounts workstream.
4. **Confirm the logged-in cart "TGCC Rewards" button opens Upzelo's own widget** — staging behaviour (calls `window.upzelo.toggle()`). Alternative would be a custom-styled dashboard panel, but the accounts branch will own the in-account rewards view.

### Not needed from client
- `UPZELO_API_KEY` — that's the HMAC secret. Upzelo's Shopify app holds it. We never put it in the theme.
- Script injection / hash computation — handled by the app embed.

---

## Article Pages — Product Carousels

**Context:** The current headless site (Sanity) uses flexible content blocks for articles. Some articles include `productCarousel` blocks — dynamic product grids embedded within the article body. Shopify's native article system doesn't support this; `article.content` is a single rich text HTML blob with no block/component system.

Replicating the Sanity approach in Shopify would require shortcodes or custom HTML parsing in the article body, which is fragile and a poor editor experience.

### Recommendation

Add a **product list metafield** on articles (`article.metafields.custom.featured_products`, type: list of product references). If populated, a product carousel renders below the article body — similar to "Explore More" on PDP. This gives editors a clean way to feature products per article without needing to hack HTML.

### What we need
1. **Confirm this approach works for them** — featured products as a carousel below the article body, rather than inline within the text
2. **How many articles currently use product carousels?** — if it's very few, this may not be a priority for launch
