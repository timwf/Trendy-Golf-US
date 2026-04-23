# Trendy Golf US Theme

US Shopify theme for `trendygolfusa`, forked from the UK theme repo (`trendy-golf-uk`). The structural code (sections, snippets, layout, CSS, JS) is shared — the work in this repo is porting US-specific content into JSON templates.

## Shopify Store

- **Store:** `trendygolfusa`
- **US staging site:** https://trendygolfus.tdrstaging.co.uk/
- **UK staging site:** https://trendygolfuk.tdrstaging.co.uk/ (reference only)

## Migration Docs

- `docs/us-store-migration.md` — master plan for the US build
- `docs/article-migration.md` — article template migration pattern (from UK build, same approach applies)
- `docs/brand-migration.md` — brand landing page migration pattern (from UK build, same approach applies)

## Folder Conventions

- `_do-not-use/` — snapshot of the US live theme from `trendygolfusa`. Reference only for analysing section structure and content. Never build on top of this.
- `_reference/` — scraped data from staging sites. Source of truth for content porting.
- `sections/` and `snippets/` — shared with UK build. All sections needed for migration are already built.

## How Migration Works

Content lives in JSON template files (`templates/*.json`). Each template assembles reusable sections with content baked into section settings. The job is:

1. Identify which templates exist on the US live theme
2. Map their sections to our equivalents (see section mapping tables in the migration docs)
3. Port content (text, image URLs, product handles, collection handles) into our JSON templates

## Watch Out For

- `shopify://files/` URIs reference store-specific uploaded assets — UK store files won't resolve on the US store. Clear or replace with US equivalents.
- `shopify://pages/` and `shopify://collections/` URIs may point to resources that don't exist on the US store yet.
- Product and collection handles may differ between UK and US stores — verify before porting.
