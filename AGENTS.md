# AGENTS.md

abap2UI5 Insights: short technical essays about one idea - what happens when
the ABAP server sends the *screen* instead of only the data - published at
https://abap2ui5.github.io/insights/ by GitHub Pages. Written for developers
and architects: the "why it works like this". A standalone site of the
abap2UI5 family - its own repository, build and deployment - and nothing in it
depends on another repository at build time.

The essays lived in the manual (abap2UI5/docs, `docs/advanced/insights/`)
until 2026-10-31. Since then this repository is their source; the manual
keeps a redirect stub for every old address and one sidebar row leading here.

## Layout

| Path | Purpose |
| --- | --- |
| `src/content/essays/NN-slug.md` | One essay per file. Frontmatter: `title` (without the number), `number` (the place in reading order, = `NN`), `part`, `blurb` (the line in the index), optional `description` (meta) |
| `src/lib/parts.ts` | The parts (id, title, lead) |
| `src/lib/moved.ts` | Slugs of an earlier numbering and the essay each now is; each gets a page that refreshes to the new address |
| `src/pages/index.astro` | The index, built as the home page: the title, the axis figure (HTML), then one group per part - the home page's heading, the part's line, its essays as a list - one column at the essay measure |
| `src/pages/[slug].astro` | The route for an essay (`src/components/Essay.astro`: its part, reading time, the other essays of the part, previous/next) and for a moved address (`src/components/Moved.astro`) |
| `src/pages/rss.xml.ts` | The feed, in reading order |
| `src/pages/search.json.ts` | What the family's search finds of this site: one entry per essay (title, line, headings, rarer words). abap2UI5/docs fetches it at build time into the one search index the home page and the playground read; the shape `{ site, url, entries: [{ title, text, headings, terms, url }] }` is the same on every site of the family |
| `src/layouts/Page.astro` | The document: head, the Content-Security-Policy, the family's top line, the foot |
| `src/styles/global.css` | The one stylesheet; the family's tokens copied in; light and dark follow the system |
| `public/` | Font (Inter, self-hosted), logo, icons, the essays' SVGs, `use_cases/` |
| `scripts/migrate.mjs` | The one-off import from abap2UI5/docs, kept for the record (see README) |
| `test/site.test.mjs` | `node:test` over the built `dist/` |
| `.github/workflows/pages.yml` | Build + test on every PR; deploy on main |

## Commands

```bash
npm ci
npm run dev      # dev server, http://localhost:4321/insights/
npm run build    # dist/
npm test         # the tests, against dist/ - build first
npm run check    # build + test, what CI runs
```

## Rules

- **A slug is an address.** `NN-slug.md` is published at `/insights/NN-slug/`,
  and abap2UI5/docs redirects every old address
  (`/docs/advanced/insights/NN-slug`) to exactly that. `ADDRESSES` in
  `test/site.test.mjs` lists them; a build that loses one fails. Rename an essay
  only together with its stub in `docs/public/advanced/insights/` of
  abap2UI5/docs, and add the old address there as a stub of its own.
- **The number is the place.** Readers say "#21", and #21 is the twenty-first
  essay in reading order: numbers run 1 to N without a gap, and the file name
  carries the same number (a test holds both). The index, previous/next and
  the feed follow it. A new essay therefore shifts the essays after it - which
  changes their slugs, so do it as one change across the family: rename the
  files, rewrite the links (`[#N](/insights/NN-slug/)`, link text and target
  together), add every old slug to `src/lib/moved.ts`, update `ADDRESSES`, and repoint the docs' stubs in `docs/public/advanced/insights/` and
  any link in the sister repositories. Renumbering is expensive on purpose:
  add essays in batches, not one at a time.
- **A part is data.** Its id is in the frontmatter, its title and lead in
  `src/lib/parts.ts`. A new part is one entry there plus the id in `PART_IDS`.
- **The case for using it is not made here.** Cost, who runs it, what an
  organization keeps, the decision - that is https://abap2ui5.github.io/why/. An essay links it, it does not repeat it.
- **Links.** A sister essay: `/insights/NN-slug/`. The manual and every other
  site of the family: absolute (`https://abap2ui5.github.io/docs/...`). No
  VitePress syntax - `{target="_self"}` and `:::` containers render as text
  here; a test holds the first. A diagram goes to `public/` and is referenced
  as `/insights/name.svg`.
- **A diagram has a dark variant.** The SVGs share one light palette, and each
  carries a `<style data-dark="">` block that remaps it to the site's dark
  tokens under `prefers-color-scheme: dark` - a `<style>` inside an SVG loaded
  by `<img>` is the image's own document, which the page's policy does not
  reach. A new diagram uses the same palette and gets the same block; a test
  checks every SVG for it, and for the attribute without a value that turns
  an SVG into a broken image. On a phone a diagram keeps its size and scrolls
  sideways rather than shrinking its labels.
- **One vocabulary across the diagrams.** `07-roundtrip.svg` is the reference
  for a roundtrip - load draft, apply changes, `main( )`, respond, save draft -
  and every other diagram of a roundtrip is a cut of it that uses its words:
  *browser* (not "UI5" or "frontend") and *ABAP server*; the request carries
  the *draft id*, the *event* and the *changes*; the response carries the
  *view* when one was displayed and the *model* when it changed; the app is
  an *app instance* and what is kept of it is the *draft*, in `z2ui5_t_01`.
  The filled red box is what the caption is about - in a comparison, the
  abap2UI5 side - and never more than one idea per diagram. A label fits its
  box and the image in a fallback font too: system fonts differ in width, so
  leave room. `36-where-the-screen-is-written.svg` is the one comparison with
  UI5 Freestyle and RAP; #36 and #37 both show it.
- **No script, no inline style.** The policy is `script-src 'self';
  style-src 'self'`: no `<script>`, no `on…=` handler, no `style=""` - the test
  holds every page to it. That is why code is highlighted by Prism (token
  classes the stylesheet colours) and not Shiki (a style attribute per token).
- **Nothing from another origin.** No CDN, no web font service, no analytics.
- **The family's look, copied.** The top line (logo and word leading home, the
  breadcrumb), the colours, Inter and the foot follow `CONVENTION.md` in
  abap2UI5/abap2UI5.github.io, written into `Page.astro` and `global.css` by
  hand; a change to the convention is made there first.
- **No count in prose that goes stale.** The index computes how many essays
  there are; a sentence elsewhere ("thirty-seven essays") is one more place to
  forget. The home page's tile names none for the same reason.
- **Toolchain:** Node 22 (`.nvmrc`, `engines`), astro pinned exactly (7.3.8),
  actions pinned to commits. Deployment needs Settings → Pages → Source:
  "GitHub Actions" once.
