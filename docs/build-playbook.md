# Build Playbook

> Repeatable process for building each theme component. Codifies the scope-audit-build-validate cycle with parallel styling and functionality review rounds.

---

## Overview

Every component (section, snippet, template) follows the same four phases:

```
Phase 0 — Scope & Decisions
Phase 1 — Three Audit Rounds (parallel agents)
Phase 2 — Build
Phase 3 — Validate
```

Each phase completes before the next begins. No building until the spec has been through all three audit rounds.

---

## Phase 0 — Scope & Decisions

**Goal:** Create the spec doc and resolve all decisions before any code is written.

### 0A — Audit References

1. **Scraped HTML first** — always check `_reference/scraped/html/` before React source. The scraped HTML is the rendered truth. React/TSX requires mental compilation that consistently misses details.
2. **Repo source second** — `_reference/repo/` for states the scraper didn't capture (populated data, conditional rendering, JS logic).
3. **Scraped data** — `_reference/scraped/data/stream/` for data structures and API responses.
4. **Scraped JS** — `_reference/scraped/assets/js/` for interaction patterns (minified, use as cross-reference only).

### 0B — Create Spec Doc

Write `docs/{component-name}.md` following the established format:

- **Reference block** — list all source files consulted
- **Files to create/update** — table of theme files
- **Source HTML structure** — exact markup with every Tailwind class from scraped HTML
- **Key Tailwind classes table** — element-to-classes mapping for quick reference
- **Data attributes table** — JS hook targets
- **JS architecture** — class/module structure, events, API calls
- **Deferred items** — anything out of scope for this phase

### 0C — Section Settings & Schema

Identify what the merchant needs to configure in the theme editor:

- Content settings (text, images, links, collections)
- Style options (if any — keep minimal)
- Block types (repeatable items)
- `default` vs `presets` — statically rendered sections use `default`, editor-addable sections use `presets`

### 0D — Flag Decisions

Before proceeding, identify and resolve:

- **Client questions** — anything requiring external info (API keys, third-party accounts, brand decisions)
- **Build decisions** — technical choices with trade-offs (e.g., Section Rendering API vs JS rendering, curated collection vs recommendations API)
- **Deferred scope** — what's explicitly out of scope and which phase it belongs to

Only flag as client questions when external info is genuinely needed. Everything derivable from the source repo should be built as-is.

---

## Phase 1 — Three Audit Rounds

**Goal:** Catch every discrepancy between the spec and the source before building. Three rounds with diminishing returns — round 1 catches the bulk, round 2 catches things the fixes introduced, round 3 is the final consistency check.

### How Each Round Works

Two agents run **in parallel** every round:

#### Styling & Markup Agent

Checks the spec against source files for visual accuracy:

- Every Tailwind class — character by character against scraped HTML and repo source
- HTML structure — element nesting, wrappers, containers
- Responsive breakpoints — mobile vs desktop classes
- Icon names and sizes
- Text content — exact strings, character for character
- Conditional rendering — what shows/hides and when
- Internal consistency — do the HTML examples, the Key Tailwind Classes table, and the Button Styles table all agree?

**Rule:** Scraped HTML is ground truth. If scraped HTML and repo source disagree, scraped HTML wins (it's what was actually rendered).

#### Functionality & Shopify Agent

Validates the spec against Shopify docs and source logic:

- **Always hit Shopify MCP** — no assumptions about Liquid properties, API responses, or filter syntax. Use `search_docs_chunks`, `learn_shopify_api`, `validate_theme` on every round.
- Liquid object properties — verify every `cart.*`, `line_item.*`, `product.*` property exists
- Liquid syntax — filters, tags, conditionals, loops
- AJAX API — endpoints, request/response formats, error codes
- Section schema — valid setting types, block structure
- Edge cases — discounts, gift cards, properties, selling plans, errors, empty states
- Accessibility — ARIA attributes, focus management, keyboard navigation
- Locale/currency — multi-language URLs, money formatting

### Round-by-Round Focus

| Round | Styling Focus | Functionality Focus |
|-------|--------------|-------------------|
| **1** | Completeness — are all elements and classes captured? | Correctness — are APIs, Liquid properties, and logic right? |
| **2** | Accuracy — did round 1 fixes introduce new issues? Anything glossed over? | Gaps — edge cases, error handling, accessibility missed in round 1? |
| **3** | Consistency — do all sections of the spec agree with each other? | Final verification — targeted MCP checks on anything still uncertain |

### After Each Round

- Review both agents' findings
- Apply all fixes to the spec doc
- Proceed to the next round on the updated doc

### When to Stop Early

If round 2 or 3 returns "No issues found" from both agents, stop. Don't run empty rounds. In practice, round 3 usually catches 2-3 minor things — if it catches zero, the spec is solid.

---

## Phase 2 — Build

**Goal:** Implement the component. Styling accuracy is the top priority.

### Build Order

```
1. Markup & classes first    → get it visually identical to source
2. JS second                 → wire up interactivity without changing structure
3. Section schema last       → add editor settings
```

### Rules

- **Styling always wins.** If a functionality requirement conflicts with the markup or class structure, find a way to implement the functionality without changing the visual output. Never add wrapper divs, extra classes, or structural changes that aren't in the source.
- **JS hooks on existing elements.** Use `data-*` attributes on elements that already exist in the markup. Don't add wrappers or containers for JS targeting.
- **No extra UI.** Don't add elements not in the source site — no loading skeletons, no toast notifications, no empty-state illustrations unless they're in the reference.
- **CSS must be identical.** Every class must match the scraped HTML. Compare against `_reference/scraped/html/` during build, not just the spec.

### Section Rendering API Pattern

For components with AJAX updates (cart, filters, etc.):

1. Build the full Liquid template with server-side rendering
2. Use the Section Rendering API (`sections` parameter) on AJAX endpoints to get re-rendered HTML
3. Swap the relevant DOM nodes in JS
4. This eliminates the need to maintain two rendering paths (Liquid + JS)

---

## Phase 3 — Validate

**Goal:** Confirm the build matches the spec and the source.

### 3A — Theme Validation

- Run `validate_theme` via Shopify MCP on every new/modified file
- Fix any errors or warnings

### 3B — Visual Comparison

- Compare rendered output against scraped HTML
- Check desktop and mobile breakpoints
- Verify hover states, transitions, animations

### 3C — Functional Testing

- Test all interactive states (open/close, add/remove, error states)
- Test edge cases identified in Phase 1 audits
- Verify AJAX operations and Section Rendering API responses

### 3D — Build Notes

Update the spec doc's "Build Notes" section with:

- Files created/modified
- Decisions made during build
- Any deviations from spec (with reasoning)
- Open items or follow-ups

---

## Checklist Template

Copy this into the spec doc for each component:

```
### Build Checklist

Phase 0:
- [ ] Scraped HTML audited
- [ ] Repo source audited
- [ ] Spec doc created
- [ ] Section settings identified
- [ ] Client questions flagged (if any)
- [ ] Deferred items documented

Phase 1:
- [ ] Audit round 1 — styling
- [ ] Audit round 1 — functionality
- [ ] Fixes applied
- [ ] Audit round 2 — styling
- [ ] Audit round 2 — functionality
- [ ] Fixes applied
- [ ] Audit round 3 — styling
- [ ] Audit round 3 — functionality
- [ ] Fixes applied (if needed)

Phase 2:
- [ ] Markup & classes built
- [ ] JS wired up
- [ ] Section schema added

Phase 3:
- [ ] validate_theme passed
- [ ] Visual comparison done
- [ ] Functional testing done
- [ ] Build notes written
```
