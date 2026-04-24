# US Store Migration — Plan

## Overview

Trendy Golf operates two Shopify stores:

- **UK store:** `trendy-golf-uk` (current build — this repo)
- **US store:** `trendygolfusa` (this migration)

The Drawing Room agency built two staging sites:

- UK: `trendygolfuk.tdrstaging.co.uk` (source for the UK build)
- US: `trendygolfus.tdrstaging.co.uk` (source for the US build)

The US store needs its own theme repo, built from the same codebase as the UK theme but with US-specific content ported across. The structural work (sections, snippets, layout, CSS) is shared — the differences are in content: JSON templates, page content, blog articles, brand pages, and any US-specific policies or features.

---

## Architecture

### Repo Strategy

Create a new repo (e.g. `trendy-golf-us`) as a **copy** of the UK theme repo at a stable point.

- `_do-not-use/` will contain the **US live theme** (pulled from `trendygolfusa`) instead of the UK live theme — used as reference for article template mapping and content porting
- `_reference/` will contain US-specific scraped data from the US staging site
- Connect the new repo to the `trendygolfusa` Shopify store via Shopify GitHub integration

### Shared vs Different

| Layer | Shared (from UK build) | US-specific (needs work) |
|---|---|---|
| Sections / Snippets | All section Liquid + CSS | — |
| Layout | `theme.liquid`, `password.liquid` | — |
| Config | `settings_schema.json` | `settings_data.json` (store-specific content, colours, fonts if different) |
| Templates — structural | `product.json`, `collection.json`, `cart.json`, etc. | — |
| Templates — content | — | Homepage, page templates (flagship stores, etc.), article templates, brand pages |
| Locales | Shared structure | Currency references, US-specific copy |
| Assets | Shared JS/CSS | Any US-specific images |
| Third-party integrations | Lip score, Swym, etc. (hoping identical) | Verify — may need different API keys / account config |

---

## Workstreams

### 1. Repo Setup

- [x] Create new repo `trendy-golf-us` (or agreed name)
- [x] Copy UK theme codebase at a stable commit
- [x] Pull US live theme from `trendygolfusa` into `_do-not-use/`
- [x] Connect repo to `trendygolfusa` via Shopify GitHub integration
- [x] Verify theme appears in Shopify admin and can be previewed

### 2. US Staging Site Audit

Scrape / audit `trendygolfus.tdrstaging.co.uk` to catalogue:

- [ ] Homepage — hero content, featured collections, any US-specific sections
- [ ] Page templates — which pages exist and what content they have
- [ ] Flagship stores — US store locations, different from UK
- [ ] Blog articles — how many, which use custom templates, content differences vs UK
- [ ] Brand pages — which brands have landings on the US site, any US-only or US-absent brands
- [ ] Navigation — header/footer link differences
- [ ] Policies — shipping, returns, legal (US-specific)

### 3. Blog / Article Migration

See **`docs/us-article-migration.md`** for the full US plan — 70 custom templates, per-template section tally, build order, and the two new sections that need building (`media-text`, `featured-collections`). UK reference at `docs/article-migration.md`.

Current state: all 50 UK custom article templates removed from `templates/`; `article.json` default retained.

### 4. Brand Page Migration

See **`docs/us-brand-migration.md`** for the full US plan — 9 templates total (1 A-Z listing + 8 bespoke brand landings: apc, g-fore, head, jlindeberg, manors, nike, puma, ralph-lauren), scraped from US staging into `_reference/scraped/brands/`. All required sections already exist; scope is overwriting 9 of the 10 UK-forked templates in place + deleting 1 (`page.brand-adidas-golf-origina.json`, no US landing). UK reference at `docs/brand-migration.md` (conceptual pattern only).

### 5. Page Template Content Updates

Pages that will likely need US-specific content:

- [ ] **Homepage** — different hero, collections, promotions
- [ ] **Flagship stores** — US store locations (different from UK)
- [ ] **Help centre / FAQ** — US shipping, returns, contact info
- [ ] **About / Company pages** — if any US-specific copy
- [ ] **Custom pages** — any US-only or US-absent pages

### 6. Config & Settings

- [ ] `settings_data.json` — update store-level settings (logo, social links, announcement bar, etc.)
- [ ] Navigation menus — header/footer links may differ
- [ ] Currency / locale settings

### 7. Third-Party Integration Verification

Verify these work with the US store's accounts (may need different API keys):

- [ ] Lip score (reviews)
- [ ] Swym (wishlists)
- [ ] Klaviyo / email (if integrated)
- [ ] Payment providers
- [ ] Any other third-party scripts

---

## Build Order

### Phase 1 — Foundation
1. Create repo + pull US live theme
2. Connect to Shopify store
3. Verify base theme renders correctly on US store preview

### Phase 2 — Audit
4. Scrape/audit US staging site
5. Catalogue all content differences vs UK
6. Identify scope of article + brand migration

### Phase 3 — Content Migration
7. Article template migration (following UK pattern)
8. Brand page migration (following UK pattern)
9. Homepage content
10. Flagship stores + other page templates

### Phase 4 — Polish & Verify
11. Third-party integrations
12. Navigation / menus
13. Settings / config
14. Full QA pass against US staging site

---

## Reference

- **UK theme repo:** this repo (`Trendy scrape`)
- **UK store admin:** https://admin.shopify.com/store/trendy-golf-uk
- **US store admin:** https://admin.shopify.com/store/trendygolfusa
- **US staging site:** https://trendygolfus.tdrstaging.co.uk/
- **UK article migration:** `docs/article-migration.md`
- **UK brand migration:** `docs/brand-migration.md`

---

## Open Questions

- [ ] **Repo name** — `trendy-golf-us` or something else?
- [ ] **Branch strategy** — does the US repo need to track UK changes, or is it a one-time fork that diverges?
- [ ] **Article overlap** — do UK and US share the same blog articles, or are they distinct sets?
- [ ] **Brand overlap** — same question for brand landings
- [ ] **Third-party accounts** — are Lip score, Swym, etc. the same accounts or separate US accounts with different API keys?
- [ ] **Timeline** — when does the US store need to go live relative to UK?
