# Performance Benchmark — Trendy Golf UK

**Date:** 2026-04-19
**Tooling:** Lighthouse 10.0.1, headless Chrome, mobile (simulated 4G / 1.6× CPU slowdown) + desktop presets.

## What was measured

| Site | URL | Theme |
|------|-----|-------|
| **New theme (preview)** | `https://trendy-golf-uk.myshopify.com/?preview_theme_id=188467315074` — redirects to `https://trendygolf.com/` but `_shopify_essential` cookie carries the preview context; Shopify response header confirms `server-timing: theme;desc="188467315074"` is served | `t/394/` (our WIP) |
| **TDR headless** | `https://trendygolfuk.tdrstaging.co.uk/` | Another agency's headless rebuild |

Reports on disk:
- [_report/lighthouse/home-mobile.report.html](../_report/lighthouse/home-mobile.report.html)
- [_report/lighthouse/home-desktop.report.html](../_report/lighthouse/home-desktop.report.html)
- [_report/lighthouse/tdr-mobile.report.html](../_report/lighthouse/tdr-mobile.report.html)
- [_report/lighthouse/tdr-desktop.report.html](../_report/lighthouse/tdr-desktop.report.html)

## Headline scores

### Mobile

| Metric | **Trendy (new)** | **TDR headless** | Gap |
|-|-|-|-|
| Performance | **26** | **38** | TDR +12 |
| Accessibility | **97** | 79 | Trendy +18 |
| Best Practices | 75 | **92** | TDR +17 |
| SEO | **91** | 79 | Trendy +12 |
| — | | | |
| FCP | 5.2s | 3.4s | TDR |
| LCP | **51.1s¹** | 7.3s | TDR |
| TBT | **9,170 ms** | 1,030 ms | TDR (9×) |
| CLS | 0.002 | 0 | ≈ |
| Speed Index | 19.7s | 12.3s | TDR |
| TTI | 64.8s | 21.5s | TDR |
| Total page weight | 73 MB | 102 MB | Trendy |
| DOM nodes | 2,426 | 2,838 | Trendy |
| Bootup time | 19.5s | ~1.1s² | TDR |
| 3rd-party entities | **47** | **0²** | TDR |
| 3rd-party transfer | 70.7 MB | 0 MB² | TDR |
| 3rd-party main-thread blocking | 2,063 ms | 0 ms | TDR |

¹ *Mobile LCP of 51s is a Lighthouse scoring artefact — the Cookiebot cookie-consent dialog paints before our hero video finishes loading, and Lighthouse selects it as the largest contentful element. The "real" user-perceived LCP is closer to the desktop figure (9.4s).*

² *TDR's headless frontend strips Shopify's app-embed system entirely, so no third-party app scripts inject. Their desktop audit does detect 10 third-party entities (~99 MB transfer) but they load async and don't block.*

### Desktop

| Metric | **Trendy (new)** | **TDR headless** | Gap |
|-|-|-|-|
| Performance | **61** | **50** | Trendy +11 |
| Accessibility | **91** | 79 | Trendy +12 |
| Best Practices | 75 | **92** | TDR +17 |
| SEO | **92** | 75 | Trendy +17 |
| — | | | |
| FCP | 1.4s | 0.9s | TDR |
| LCP | 9.4s | 3.5s | TDR |
| TBT | 10 ms | 10 ms | ≈ |
| **CLS** | **0.014** | **0.474** | **Trendy (TDR has severe layout shift)** |
| TTI | 15.6s | 5.2s | TDR |

## Read

**Where TDR wins (mobile):** almost entirely architectural. Headless means Shopify's 47 app embeds — Rebuy, Swym, Yotpo, Klaviyo, 5× GTM/GA tags, Facebook Pixel, Attentive, Upzelo, Kiwisizing, Hotjar, Lipscore, Twitter, ShareThis, Cookiebot — simply don't inject. That's the 9× TBT gap and most of the LCP gap. Their page is actually *heavier* in bytes (102 MB vs 73 MB) and has a larger DOM; they share the same Vimeo-heavy homepage we do.

**Where Trendy wins (desktop, a11y, SEO):** accessibility (+18 mobile), SEO (+12 mobile), and desktop CLS by a huge margin — TDR shifts **0.474** of the viewport during hydration, likely a hero-section jump. Desktop perf also goes to us (61 vs 50).

**The ceiling:** theme-code optimisation alone can't close the mobile TBT gap — the biggest lever is a client conversation about which Shopify apps are still pulling their weight. Theme-side wins will get us from 26 → ~45–55 mobile. Matching TDR while keeping the apps enabled is realistic; exceeding it requires app pruning.

## What's in our control (theme code)

Ordered by ROI / effort:

| # | Fix | Est. impact (mobile) | Effort | File(s) |
|-|-|-|-|-|
| 1 | Lazy-load mega-menu brand images (all eager, ~495 KB) | LCP, bytes | 5 min | `sections/header.liquid` |
| 2 | Self-host Google Fonts (remove 891 ms render-block) | FCP, LCP | 20 min | `layout/theme.liquid` + `assets/` |
| 3 | `fetchpriority="high"` on true LCP image; audit other eager images | LCP | 10 min | `layout/theme.liquid`, hero sections |
| 4 | Correct `sizes` attribute on brand/shop-the-look cards (195 KB waste) | bytes | 10 min | `sections/*` |
| 5 | Shoe-finder below-fold images eager → lazy (5 imgs, 1080–3024 w) | bytes | 2 min | `sections/shoe-finder.liquid` |
| 6 | Defer Splide init until section near viewport (5s bootup saved) | TBT | 30 min | `assets/theme.js` + section JS |
| 7 | Video facade for Vimeo (13 embeds auto-play at load → poster + click/scroll) | LCP, bytes, TBT | 60 min | `sections/video-embed.liquid`, hero |
| 8 | Audit DOM size (2,426 nodes) — mega-menu markup often 500+; render on interaction | TBT, memory | 60 min | `sections/header.liquid` |

## What needs a client conversation

These are installed Shopify apps we can't remove from the theme side:

| App | Transfer | Main-thread blocking | Question |
|-|-|-|-|
| Rebuy | 839 KB | 383 ms | Still using Smart Cart / Smart Search? |
| Swym | 700 KB | 341 ms | Wishlist usage data — worth it? |
| Klaviyo | 437 KB | 99 ms | Keep — core email. Can any modules be trimmed? |
| GTM (5 tag IDs) | 1.49 MB | 278 ms | Consolidate GTM-5G4N4PSK + AW-1070167862 + G-LB15K21L0M + G-MCGXXDN4MP + GT-T9WGV4L — all 5 active? |
| Yotpo | 226 KB | 94 ms | Loyalty & reviews — consolidate with Lipscore? |
| Facebook Pixel | 239 KB | 41 ms | Still running ads? |
| **Lipscore** | 98 KB | 0 ms | **Duplicate** — we built custom client, but merchant's app embed is still injecting. Disable app embed? |
| Upzelo | 163 KB | 13 ms | Retention tool — being used? |
| Kiwisizing | 170 KB | 27 ms | Size guide — lazy-load only on PDP? |
| Cookiebot | 153 KB | 78 ms | Required (GDPR). Defer further? |
| Hotjar | 64 KB | 52 ms | Cheap — fine to keep. |
| Attentive | 56 KB | 113 ms | SMS capture — keep. |
| Twitter widgets | 135 KB | 114 ms | Anywhere actually embedding tweets? If not, remove. |
| ShareThis | 70 KB | 0 ms | Share buttons — still used? |
| OrderDeadline | 12 KB | 0 ms | Cut-off timer — keep if used. |

## Re-running

```bash
# Mobile + desktop benchmarks
lighthouse "https://trendy-golf-uk.myshopify.com/?preview_theme_id=188467315074" \
  --output=html --output=json \
  --output-path="_report/lighthouse/home-mobile" \
  --form-factor=mobile --throttling-method=simulate \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new --no-sandbox" --quiet

lighthouse "https://trendy-golf-uk.myshopify.com/?preview_theme_id=188467315074" \
  --output=html --output=json \
  --output-path="_report/lighthouse/home-desktop" \
  --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new --no-sandbox" --quiet
```

## Change log

- **2026-04-19** — Initial benchmark. Mobile perf 26 / desktop 61. Phase 1 theme optimisations pending.
