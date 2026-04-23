# US Page Template Migration — Plan

## Overview

Port the non-brand, non-article page templates from the UK fork to US-specific content, using `trendygolfus.tdrstaging.co.uk` as the source of truth. The theme's sections are all already built (identical to UK) — this is a content + asset porting exercise.

### What's already done

- `page.deilvery.json` — delivery page ported
- `page.returns-exchanges.json` — returns / exchanges page ported

### What's out of scope for this doc

- **Brand pages** (`page.brand-*.json`) — tracked separately (see `docs/brand-migration.md` pattern; US-specific plan TBD)
- **Article templates** — tracked in `docs/us-article-migration.md`
- **Homepage** (`templates/index.json`) — already ported
- **Internal pages** (e.g. `page.handover-todos.json`) — not customer-facing

### Source of truth

1. **Content + layout:** `https://trendygolfus.tdrstaging.co.uk/<handle>` — scrape the rendered page (Remix uses clean paths, not `/pages/<handle>`) to see section order, copy, and image usage.
2. **Sanity CMS (for dynamic blocks):** `https://a2qwxh6f.apicdn.sanity.io/v2024-01-01/data/query/staging?query=<groq>` — no auth. Use when HTML renders an empty section container (staging hydrates content client-side from Sanity docs). See scraping notes below.
3. **Live US theme reference (optional):** `_do-not-use/templates/page.*.json` — the production `trendygolfusa` theme. Primary use is **checking the template suffix** (filename = Shopify admin's "Theme template" dropdown value). Section content is usually stale vs. staging.
4. **Current templates:** `templates/page.*.json` — already contain UK content that needs to be replaced in-place with US content.

---

## Scope

### In scope

| # | Template | Staging URL (probable) | Notes |
|---|---|---|---|
| 1 | `page.company-info-page.json` | `/about-us` (staging), `/pages/about-us` (Shopify) | Template suffix `company-info-page` (matches US live theme). Hero + brand story + media grid. Contains links to Manchester + Canary Wharf flagships — currently 404 on staging; mirror staging, don't fix. |
| 2 | `page.contact.json` | `/contact` (staging), `/pages/contact` (Shopify) | Contact info + form; US phone / address. Email `info@trendygolf.com` shared with UK per staging HTML. |
| 3 | `page.faq.json` | `/help-centre` (staging), `/pages/help-centre` (Shopify, handle TBC) | FAQ / help content. **Staging serves UK-content FAQs** (£100, Royal Mail, DPD) from Sanity — the agency hasn't localised US versions yet. Ported as-is per source-of-truth rule; flag for client to rewrite. |
| 4 | `page.rewards.json` | `/rewards` (staging) | Rewards programme — verify US parity with UK (LoyaltyLion or equivalent) |
| 5 | `page.shoe-finder.json` | `/shoe-finder` (staging) | Interactive shoe-finder quiz. **Tag linkage is load-bearing** — quiz answer tags must match real product tags in the results collection, or the filter silently returns 0 results. US staging's Sanity content uses tags (`men`, `spiked`, `flat`, `traditional-leather`, `modern-style`, `dry-course`, `soft-course`) that don't exist on any US products; kept UK JSON's 4-question structure instead because its tags (`Men`, `Women`, `Cleated`, `Spikeless`, `Classic`, `Modern`, `Black`, `White`, `Other`) match the real tags on `/collections/mens-golf-shoes` + `/collections/womens-golf-shoes`. Staging's course-type question dropped (no product tag support). `results_collection` changed from UK's `mens-spikeless-golf-shoes` (0 products on US) to `mens-golf-shoes` (91 products) — see open question about combined mens+womens collection. |
| 6 | `page.tglab.json` | `/tglab` (staging) | TG Lab brand-partner landing. Template suffix `tglab` (no existing template on live US theme — new page). US staging adds a 20th brand logo (Head) vs UK's 19 and uses a different form background image (`10a26d44ebea460f076b27cba0795ec431674ddd`). Intro heading on US staging has a trailing period ("...in golf.") — kept staging's wording. Brand names populated into each logo's `alt_text` for accessibility (Sanity stored them as `title`, which the logo-marquee schema doesn't have). |
| 7 | `page.corporate.json` | `/corporate` (staging) | Corporate / B2B custom-apparel landing. Template suffix `corporate` (no existing template on live US theme — new page). Staging present + content confirmed in Sanity. Added a `content-block` "How it Works" heading section between `content-columns` and `icon-grid` (staging has this; `icon-grid` schema has no section-level heading field). US staging copies the UK copy verbatim including the "Premium Brands Like No Members" typo ("No Other Members") — kept as-is per mirror-staging rule. US + UK share `corporate@trendygolf.com` (internalLink to `/contact` page on staging). |
| 8 | `page.careers_page.json` | `/careers` (staging) | Careers / jobs landing. Template suffix `careers_page` (no existing template on live US theme — new page). Hero shares desktop image hash with UK + adds a US-specific mobile image. Mission body slightly expanded on staging ("Our mission is to create..."). About Us is substantially different — staging has a 5-paragraph founding narrative with Ian + Ben / Jesper Parnevik / J.Lindeberg origin story, replacing the UK's condensed 5-paragraph summary. **Email remains `ukcareers@trendygolf.com` per staging source of truth** — flagged as open question (US staging literally reuses the UK careers inbox). Staging also uses lowercase "TrendyGolf" in the Join body where UK uses all-caps — mirrored staging per source-of-truth rule. Social grid populated from 12 items in the global Sanity `socialGrid` field (US images, not UK). |
| 9 | `page.home-course.json` | `/home-course` (staging) | **New page, US-only** — no UK equivalent. Retail/flagship landing for the US physical location (The Home Course at 344 S Cedros Ave, Solana Beach, CA 92075, inside a premium barbershop). Tim is manually creating the `home-course` template suffix + page in Shopify admin; JSON filename matches. 6 sections: `hero-carousel` / `content-block` intro / `icon-grid` (3-column Visit/Call/Email card with external `link` + `link_label`, rendered as chevron-links) / `logo-marquee` (32 brand logos) / 2× `fifty-fifty` (Space Designed for Golf image-left, Personalized Shopping Experience image-right). Phone `424-290-3101` matches the global US contact. **Data inconsistency flagged on staging:** Email CTA displays `HomeCourse@TrendyGolf.com` but `linkExternal` in Sanity is `mailto:hello@trendygolf.com` — mirrored staging verbatim; client should confirm which email is correct. |

### Kept in repo, not actively ported

| Template | Decision |
|---|---|
| `page.trendygolf-stores.json` | **Keep as-is.** UK flagships; US has no physical stores. US staging About Us page links to Manchester + Canary Wharf but those URLs 404 on staging — we mirror that behaviour rather than rewrite. Retained in case client later wants them surfaced. |
| `page.trendygolf-canary-wharf.json` | Same — keep as-is, not linked from US nav. |
| `page.trendygolf-manchester.json` | Same — keep as-is, not linked from US nav. |

### May be added during audit

Any `/<handle>` on US staging that doesn't have a matching template in this repo yet (e.g. `/military-discount`, US-specific legal pages). Add to the in-scope list once the staging audit runs.

---

## Workflow (per page)

1. **Find the staging URL.** Staging uses clean URLs (Remix), not Shopify's `/pages/` prefix. About Us is at `/about-us`, FAQ at `/help-centre`, etc. If `/pages/<handle>` 404s, try the bare `/<handle>`.
2. **Check the live US theme for the template suffix.** Open `_do-not-use/templates/page.*.json` — the filename tells you what template suffix the US Shopify admin is expecting. Example: About Us is set to `company-info-page` on `trendygolfusa`, so the file in `templates/` must be `page.company-info-page.json`, not `page.about-us.json`. Rename before porting or the client has to change the template in admin.
3. **Audit on staging.** Note:
   - Section order (top → bottom)
   - Copy for each section (headings, subheadings, body, CTAs)
   - Image usage per section (desktop + mobile — inspect DOM for `<picture>` / `srcset` / media queries)
   - Any links (to collections, other pages) — check the handles resolve on `trendygolfusa`
4. **Map sections.** Cross-reference with the UK JSON already in `templates/` to confirm which Liquid sections are in play. Grep the matching `sections/*.liquid` for field IDs not present in the UK JSON (e.g. `hero-carousel` has a `mobile_image` field the UK doesn't use — staging may). If staging has a section the UK JSON lacks, update the JSON scaffold; if UK has a section staging doesn't (e.g. the `about-stores-heading` content-block), drop it.
5. **Port content into JSON.** Edit the renamed template. Replace UK strings, clear `shopify://files/` AND `shopify://shop_images/` URIs (both are store-scoped — UK store assets won't resolve on US), clear any `shopify://pages/` and `shopify://collections/` URIs that don't exist on US.
6. **Download assets.** Save desktop + mobile variants of every image to the local asset folder (see structure below).
7. **Hand off to Tim.** Upload images via the Shopify customizer. In admin, set the page's Theme template to the matching suffix (step 2).
8. **QA on preview.** View the theme preview on `trendygolfusa`, compare against staging, flag any drift.

---

## Asset Folder Structure

All scraped images land in `~/Downloads/trendy-golf-us-page-assets/`, one folder per page template, with a sub-folder per section. Section sub-folders are numbered by page order so they match top-to-bottom in the customizer.

```
~/Downloads/trendy-golf-us-page-assets/
├── company-info-page/       # folder name = template suffix
│   ├── 01-hero/
│   │   ├── desktop.jpg
│   │   └── mobile.jpg
│   ├── 03-banner-cards/     # numbering matches section position in the JSON,
│   │   ├── canary-wharf.jpg #  so gaps appear when a section has no images
│   │   └── manchester.jpg   #  (02-content-block is text-only, no folder)
│   └── 04-social-grid/
│       ├── 01-jlindeberg.jpg
│       └── ...
├── contact/
│   └── 03-contact-form/
│       └── background.jpg
├── faq/
│   ├── 01-hero/
│   │   ├── desktop.jpg
│   │   └── mobile.jpg
│   └── 04-contact-form/
│       └── background.jpg
└── rewards/
    └── ...
```

### Naming rules

- **Section folder:** `<NN>-<section-type>` where `NN` is the 1-indexed position on the page (`01`, `02`, …) and `<section-type>` matches the section Liquid name (`hero`, `media-grid`, `content-block`, `shop-the-look`, `banner-cards`, etc.).
- **Image file:** `desktop.<ext>` / `mobile.<ext>` when a section has one image. When a section has multiple (e.g. media-grid with two tiles, banner-cards with four cards), append a descriptor: `desktop-left.jpg`, `desktop-card-1.jpg`, etc.
- **Format:** keep the original extension from staging (`.jpg`, `.webp`, `.png`). Don't re-encode.
- **Resolution:** grab the largest `srcset` variant. Shopify will generate responsive variants on upload.

### Where mobile differs from desktop

Only save a separate `mobile.*` file when staging actually serves a different source on mobile. Most heroes do (portrait crop); most content-block images don't. When both breakpoints share the same image, one `desktop.*` is enough.

---

## Per-Page Migration Status

| Template | Audit | Scrape images | Port JSON | Upload to Shopify | QA |
|---|---|---|---|---|---|
| `page.company-info-page.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.contact.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.faq.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.rewards.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.shoe-finder.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.tglab.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.corporate.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.careers_page.json` | ✅ | ✅ | ✅ | ☐ | ☐ |
| `page.home-course.json` | ✅ | ✅ | ✅ | ☐ | ☐ |

---

## Watch Out For

- **`shopify://files/` and `shopify://shop_images/` URIs** — both are store-scoped. UK store assets won't resolve on US. Clear these from the JSON; the assets folder is what replaces them after upload.
- **`shopify://pages/` URIs** — may point to UK-only pages. Verify each target page exists on `trendygolfusa`.
- **`shopify://collections/` URIs** — UK and US collection handles may differ (e.g. `mens-nike` might be `mens-nike-golf` on US). Verify in Shopify admin before porting.
- **Hero carousel heading gotcha** — slides without `heading: ""` render the schema default ("Heading") on the image. Always set `heading: ""` explicitly when the slide has no title.
- **Product handles** — if a page references specific products, confirm those handles exist on `trendygolfusa`.
- **Third-party embeds** — rewards widgets, help-centre search, etc. may need US-specific API keys or account IDs. Flag during audit.
- **Quiz-style templates with tag filters** (`shoe-finder` and similar) — the answer `*_tag` settings are compared against real `product.tags` at render time. **Always verify the quiz tags exist on products in the chosen `results_collection` before signing off** — the JS filter matches case-insensitively (`downcase`) but otherwise literal, so `modern-style` will NOT match a `Modern` tag. Shopify's storefront JSON endpoint is the fastest way to check: `curl -sS https://<store>.com/collections/<handle>/products.json?limit=50 | python3 -c "import json,sys; from collections import Counter; c=Counter(t for p in json.load(sys.stdin)['products'] for t in p['tags']); [print(c[t],t) for t in sorted(c, key=c.get, reverse=True)[:40]]"`.

### Scraping notes (lessons from each port)

- **Staging URLs are Remix-style, not Shopify-style** — bare `/<handle>`, not `/pages/<handle>`. `/pages/about-us` 404s; `/about-us` works.
- **Sanity CDN is the image host** — `https://cdn.sanity.io/images/a2qwxh6f/staging/<hash>-<dims>.<ext>`. Strip `?fm=webp&auto=format` from the end to download the original file. `curl -sS -o <dest>` works fine, no auth needed.
- **WebFetch scrubs email + phone links** — displays `[email protected]` instead of the real address. To recover, curl the raw HTML and grep: `curl -sS "<staging url>" | grep -oE 'mailto:[^"]+' | head -5` (and similarly for `tel:`). Useful when an email/phone is the only way to know whether staging is using a US-specific or shared-with-UK contact.
- **"Empty" sections on staging may be populated in Sanity** — the help-centre FAQ block rendered as empty HTML (no Q&A text in DOM) because content is Sanity-hydrated and the documents live in a separate collection. Don't assume blank = empty. Two checks:
  1. **Remix `.data` endpoint** — append `.data` to any route (`/help-centre.data`). Remix returns the serialized page data blob (numeric-key compressed but grep-able). Look for block type keys like `customFAQs`, `faqsBlock` — they reveal that a section is declared even when HTML is empty.
  2. **Sanity CDN query API** — no auth needed: `curl "https://a2qwxh6f.apicdn.sanity.io/v2024-01-01/data/query/staging?query=<urlencoded groq>"`. First list all `_type` values: `array::unique(*._type)`. Then query the relevant type: e.g. `*[_type == "faq"]{_id, title, "category": categories[0]->prefLabel, content}`. Dereference category refs via `->prefLabel` — categories are `skosConcept` docs, not plain category docs.
- **Sanity Portable Text → HTML** — `content` blocks are arrays of `{_type: "block", style, children: [{text, marks}], markDefs}`. Use a short Python script to walk them: join children text, wrap in `<p>` (or `<h2>`/etc. per `style`), apply `<a href>` for marks that match a `markDef` of `_type: "link"` or `internalLink`. For internalLink refs pointing to known Shopify page handles (e.g. contact), rewrite to `/pages/<handle>` rather than the Sanity ref.
- **Some assets are shared across UK + US staging** — identical Sanity hash means identical source file (hero image, store card photos were all reused on company-info-page). Download to the US folder anyway for a clean hand-off, but know it's not a "new" image.
- **WebFetch drops punctuation in HTML→markdown conversion** — commas, full stops, hyphens go missing inside long paragraphs. When the scraped text matches the UK JSON word-for-word minus punctuation, trust the UK punctuation, not the scrape.
- **WebFetch may miss thin section dividers** — a small `content-block` that only renders an `<h2>` heading ("Stores" on the UK About Us) may not appear in the extracted content. Cross-check the UK JSON's section list against the scrape; if a UK-only section is ambiguous, drop it and note it for QA rather than leaving a mismatched heading.
- **Check section Liquid schemas beyond the UK JSON** — UK templates don't always exercise every field. `hero-carousel` has a `mobile_image` field that the UK about-us didn't use but US staging's hero does. Grep the relevant `sections/*.liquid` for field IDs before assuming the UK JSON covers everything.
- **Mirror staging bugs rather than "fixing"** — staging's About Us links both store cards through `/flagship-stores/...` paths that 404. We keep them as-is on the JSON. If something looks broken on staging, flag it but don't silently repair.
- **Third-party integration IDs live in staging's Remix env blob** — when a third-party (Upzelo, reCAPTCHA, Kiwi Sizing, etc.) needs an ID/key and the client can't locate it in the provider's dashboard, grep the staging HTML / `.data` endpoint for the service name in caps. The rewards port found `UPZELO_APP_ID=upz_app_4e56995676a5` serialised in the client payload, saving a dashboard hunt. Only use values that are safe for client-side exposure (App IDs, public keys) — never copy server secrets into the theme even if staging leaks them.

---

## Open Questions

- [x] ~~Does `trendygolfusa` run the same rewards provider (LoyaltyLion / Smile / etc.) with the same keys, or a separate account?~~ Resolved: US runs Upzelo on a **separate account** from UK. US App ID `upz_app_4e56995676a5` (baked into `config/settings_schema.json` default). Live published theme `JL AGUSTA` still uses Yotpo — the new dev/preview theme `185106301231` cuts over to Upzelo.
- [ ] Does the US site have a `military-discount` page (common on US retail but not UK)? Check staging.
- [ ] Does the US site keep `corporate` and `careers`? US entity may not hire the same way. **Careers update:** staging page exists and has content, BUT the application email is still `ukcareers@trendygolf.com` (literal UK inbox). Confirm with client: is this a deliberate shared inbox, or does the US team need its own email (e.g. `uscareers@` / `careers@`)?
- [x] ~~Does `/shoe-finder` on US reference the same collections the UK version uses?~~ Resolved: no. UK's `mens-spikeless-golf-shoes` has 0 products on US. Ported to `mens-golf-shoes` (91 products). **Still open:** US has no combined mens+womens golf-shoes collection — answering "Womens" on Q1 currently filters to empty. Action: client should create an `all-golf-shoes` smart collection (rule: `tag contains "Golf Shoes"`) so the quiz works for both genders, then update `results_collection` to that handle.
- [ ] Shoe-finder Q4 colour images (Black / White / Other tiles) — UK uses custom `07-shoefinder-q4-*.png` assets that aren't on Sanity CDN. Client should either re-upload them on US Shopify admin or supply fresh US versions. Quiz tag logic works regardless; images are purely decorative.
- [ ] FAQs (help-centre) still contain UK-only references (£100, Royal Mail, DPD). Will the client provide US-localised FAQ copy, or should we generate US equivalents (USD, USPS/UPS, US returns policy)?
