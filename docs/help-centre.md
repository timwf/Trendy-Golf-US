# Help Centre — Phase 4E

## Overview

The Help Centre page is the customer-service landing page on the source site (`/help-centre`). It combines a page hero, a 4-up icon link grid, a filterable FAQ accordion, and a contact form. The live Shopify store already has a page assigned to the `page.faq` template, so we'll use that template filename for continuity — **zero admin reassignment needed on publish**.

**Template filename:** `templates/page.faq.json`

> ⚠️ `_do-not-use/` is **not** a design/code/content reference for this build. We only take the template **filename** from it. Section names, schema, block types, FAQ copy, and markup are all built fresh from the source site scrape + source repo.

---

## Source Site Reference

**Scraped page data:** `_reference/scraped/data/stream/help-centre-route-routes--.json`
**Scraped HTML:** `_reference/scraped/html/help-centre.html`

**Source repo components:**
- `_reference/repo/app/components/blocks/iconGrid.tsx` — 4-col icon grid
- `_reference/repo/app/components/blocks/faqBlock.tsx` — FAQ accordion with category filter tabs
- `_reference/repo/app/sanity/requests/getFaqs.ts` — FAQs sourced from CMS
- `_reference/repo/app/hooks/useFaqs.ts` — filter + group logic

**Page composition (4 blocks, top to bottom):**

| # | Block type | Purpose | Reuse existing? |
|---|-----------|---------|-----------------|
| 1 | `bannerCarousel` | "Help Centre" page hero (single slide, image + title + copy) | ✅ `sections/hero-carousel.liquid` |
| 2 | `iconGrid` | 4 cards: Delivery / Returns / Careers / Join TGCC | ❌ new section |
| 3 | `faqsBlock` | FAQs grouped by category with filter tabs + accordion | ❌ new section |
| 4 | `form` | Contact form — "We're here if you need more help" | ✅ contact form (4D) |

---

## New Sections Required

### 1. `sections/icon-grid.liquid`

Generic 3/4-column card grid with heroicon + title + description + link. Useful beyond Help Centre (rewards page, etc.).

**Markup (from source repo iconGrid.tsx):**

```
container-wide grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 border-l border-t border-taupe-600 px-0
  > card: border-b border-r border-taupe-600 px-8 py-6 md:p-14
    > row wrapper: flex flex-row gap-6 md:max-w-96 md:flex-col md:gap-0
      > icon: size-8 (heroicon)
      > content: flex flex-col md:flex-1
        > heading h4 (size h5, bold)
        > p (description, whitespace-pre-line)
        > mt-auto button (text style, font-bold)
```

**Icons used on this page:** `truck`, `uturn` (arrow-uturn-left), `users` (user-group), `trophy` — all from Heroicons outline set. Add to [snippets/icon.liquid](snippets/icon.liquid).

**Schema:**
- Section settings: `desktop_columns` (3 or 4)
- Repeatable `column` blocks: `icon` (select from icon set), `title`, `description`, `link`, `link_label`

### 2. `sections/faq-accordion.liquid`

FAQ accordion with optional category filter tabs. Content is managed entirely via **theme editor blocks** — the client adds/edits categories and FAQs in Customize → Help Centre page. No metaobjects, no admin setup.

**Markup (from source repo faqBlock.tsx):**
- Outer: `container-narrow`
- Title: `mb-10 text-center` rich text
- Filter tabs: horizontal pill tabs, active tab highlighted — built from distinct `category` block titles
- Grouped list: each category renders as `<Heading h4 size="h5" semi-bold text-center>` + accordion list
- Each accordion section: `question` (click to expand) + `answer` (rich text)

**Data source — section blocks:**

| Block type | Settings |
|------------|----------|
| `category` | `title` (single line) |
| `faq` | `category_title` (single line — matches a category block's title), `question` (single line), `answer` (rich text) |

Section iterates blocks in order, groups `faq` blocks under the most recent `category` block (or by matching `category_title`). Filter tabs come from distinct category titles. JS toggles visibility client-side on tab click — no page reload needed.

**Schema:**
- Section settings: `title` (rich text), `hide_filters` (checkbox)
- Blocks: `category`, `faq` (max blocks default — 50 should be plenty)

---

## Template JSON

**File:** `templates/page.faq.json`

**Sections:**
1. `hero-carousel` — single slide, "Help Centre" title + intro copy + hero image
2. `icon-grid` — 4 cards (Delivery → /pages/delivery, Returns → /pages/returns-and-exchanges, Careers → /pages/careers, Join TGCC → /pages/rewards)
3. `faq-accordion` — title: "FAQs", filters enabled
4. `contact-form` — title: "We're here if you need more help", contact type

---

## Client Dependencies

| Item | What we need | Why |
|------|--------------|-----|
| FAQ content | 30+ existing Q&As + 4 categories (General, Orders & Shipping, Returns, Rewards Program) | Content exists on live store; client exports or provides in a doc, we populate the template JSON via theme editor (or directly in the file) |
| Hero image | Help Centre hero (desktop + mobile) | Reference in scrape points to Sanity CDN; client to upload to Shopify Files |
| Icon grid images | Optional — the source site uses heroicons, so only needed if they want custom imagery | — |

Logged in [docs/client-questions.md](client-questions.md).

---

## Build Order

1. **[x]** Create [templates/page.faq.json](../templates/page.faq.json) with the `hero-carousel` section only (the one section that already exists) — "Help Centre" slide seeded from source-site copy. Template filename is now in place, so the live store's existing page assignment is preserved on first publish.
2. **[x]** Add `user-group` heroicon to [snippets/icon.liquid](../snippets/icon.liquid) (`truck`, `arrow-uturn-left`, `trophy` already existed).
3. **[x]** Build [sections/icon-grid.liquid](../sections/icon-grid.liquid) + validate with Shopify MCP, then add to [templates/page.faq.json](../templates/page.faq.json) with all 4 source-site cards (Delivery / Returns / Careers / Join TGCC) seeded. Audit pass against scraped HTML — classes and copy parity locked in.
4. **[x]** Build [sections/faq-accordion.liquid](../sections/faq-accordion.liquid) with `category` + `faq` block schema + validate (validates clean via Shopify MCP), then added stub to template. Category/FAQ blocks to be seeded once client delivers content (30+ Q&As across 4 categories — see [client-questions.md](client-questions.md)).
5. **[x]** Build [sections/contact-form.liquid](../sections/contact-form.liquid) (shared with 4D contact page) using Shopify's `{% form 'contact' %}` tag — name/email/phone/order/message fields, optional bg image, inline success state, client-side submit-disabled-until-filled. Added to [templates/page.faq.json](../templates/page.faq.json) with "We're here if you need more help" heading. Validates clean via Shopify MCP.
6. Visual QA against [_reference/scraped/html/help-centre.html](../_reference/scraped/html/help-centre.html)

---

## Validation Checklist

- [ ] Hero carousel renders single slide at correct height
- [ ] Icon grid: 1 col mobile / 2 col md / 4 col xl; taupe-600 borders match source
- [ ] Each icon renders as heroicon outline, `size-8`
- [ ] FAQ tabs filter categories client-side (or via URL param)
- [ ] FAQ accordion expand/collapse single-panel, smooth
- [ ] Contact form submits (Shopify contact form action)
- [ ] Template published — existing `/pages/help-centre` (or equivalent) renders correctly with no admin intervention
- [ ] `validate_theme` passes