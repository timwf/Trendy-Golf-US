/*
 * Journey-aware breadcrumb.
 *
 * On every page entry: if the current page is a stashable surface (brand
 * landing page, collection page, or search results page), overwrite the
 * single nav-stash key in localStorage with this page's metadata.
 *
 * On collection / product pages that render a [data-breadcrumb] nav: read
 * the *previous* stash (if fresh + applicable) and inject it as the middle
 * node. PDP renders the brand stash only when the stashed brand title
 * matches the product's vendor; otherwise the stash is ignored for this
 * render and left in place for the next page (edge case 2 in the scope).
 *
 * Server-side Liquid renders the canonical hierarchy on every load so
 * no-JS clients and SEO crawlers get a working breadcrumb. This script
 * only modifies the middle slot when a fresh, applicable stash exists.
 */
(function () {
  var STASH_KEY = 'tg:nav-stash';
  var FRESH_MS = 30 * 60 * 1000; // 30 minutes

  function readStash() {
    try {
      var raw = localStorage.getItem(STASH_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return null;
      if (typeof obj.ts !== 'number') return null;
      if (typeof obj.kind !== 'string') return null;
      return obj;
    } catch (_) {
      return null;
    }
  }

  function writeStash(obj) {
    try {
      localStorage.setItem(STASH_KEY, JSON.stringify(obj));
    } catch (_) {
      /* private mode / quota — silently no-op */
    }
  }

  function init() {
    /* Read the OLD stash before we overwrite. This is what we apply to
       the breadcrumb (so a shopper landing on collection X via brand Y
       sees Y as the middle node, not X re-pointing at itself). */
    var previousStash = readStash();

    /* Write-on-entry: only stash if this page is a stashable surface. */
    var meta = document.querySelector('[data-breadcrumb-page-meta]');
    if (meta) {
      var kind = meta.getAttribute('data-kind') || '';
      if (kind === 'brand' || kind === 'collection' || kind === 'search') {
        var stash = {
          kind: kind,
          title: meta.getAttribute('data-title') || '',
          url: meta.getAttribute('data-url') || '',
          ts: Date.now()
        };
        if (kind === 'search') {
          stash.query = meta.getAttribute('data-query') || '';
        }
        writeStash(stash);
      }
    }

    /* Apply the previous stash to the breadcrumb (collection / PDP only). */
    if (!previousStash) return;
    if (Date.now() - previousStash.ts > FRESH_MS) return;

    var nav = document.querySelector('[data-breadcrumb]');
    if (!nav) return;
    var breadKind = nav.getAttribute('data-breadcrumb-page-kind');
    if (breadKind !== 'collection' && breadKind !== 'product') return;

    /* Same-page guard: refresh on collection X stashes X then would inject
       X above the X title — skip. */
    try {
      var stashPath = new URL(previousStash.url || '/', window.location.origin).pathname;
      if (stashPath === window.location.pathname) return;
    } catch (_) { /* fall through — bad URL just means we don't gate on it */ }

    /* Edge case 2: brand stash on a mismatched-vendor PDP — ignore (don't
       clear). The stash stays available for the next page in case it matches. */
    if (breadKind === 'product' && previousStash.kind === 'brand') {
      var productVendor = (nav.getAttribute('data-breadcrumb-page-vendor') || '').trim().toLowerCase();
      var brandTitle = (previousStash.title || '').trim().toLowerCase();
      if (!productVendor || !brandTitle || productVendor !== brandTitle) return;
    }

    var slot = nav.querySelector('[data-breadcrumb-middle-slot]');
    if (!slot) return;

    /* Build the visible label. Search-results stash renders the query in
       quotes, or "Search results" when the query is empty (edge case 5). */
    var label;
    if (previousStash.kind === 'search') {
      var q = previousStash.query || '';
      label = q ? '"' + q + '"' : 'Search results';
    } else {
      label = previousStash.title || '';
    }
    if (!label) return;

    /* Build the new middle node + its trailing chevron. Clone the existing
       chevron span so the SVG markup stays in lock-step with the snippet. */
    var newLink = document.createElement('a');
    newLink.href = previousStash.url || '/';
    newLink.className = 'flex-none transition-colors hover:text-taupe-900';
    newLink.textContent = label;

    var chevronTemplate = nav.querySelector('[data-breadcrumb-chevron]');
    var newSep = chevronTemplate ? chevronTemplate.cloneNode(true) : null;
    if (newSep) newSep.removeAttribute('data-breadcrumb-chevron');

    slot.innerHTML = '';
    slot.appendChild(newLink);
    if (newSep) slot.appendChild(newSep);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
