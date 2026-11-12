# abap2UI5 Insights

Short technical essays about one idea: what happens when the ABAP server sends
the *screen* instead of only the data. What the framework rests on, how it
works under the app, what a working day with it looks like, where it belongs
in the landscape and what running it takes. Why you would use it is covered on
the page for decision makers (linked below).

**→ https://abap2ui5.github.io/insights/**

One of the abap2UI5 family of sites, next to the
[documentation](https://abap2ui5.github.io/docs/), the
[playground](https://abap2ui5.github.io/playground/) and the
[page for decision makers](https://abap2ui5.github.io/why/): its own
repository, build and deployment, nothing shared but the convention
(`CONVENTION.md` in abap2UI5/abap2UI5.github.io). Built with
[Astro](https://astro.build) into static pages without a script.

## Run it

```bash
npm ci
npm run dev       # http://localhost:4321/insights/
npm run check     # build + tests, what CI runs
```

## Where things are

| | |
|---|---|
| `src/content/essays/NN-slug.md` | the essays - one file each, the frontmatter carries title, number (the place in reading order), part, the one-line blurb and the optional meta description |
| `src/lib/parts.ts` | the parts, in one place |
| `src/pages/index.astro` | the index |
| `src/pages/[slug].astro` | an essay, with the other essays of its part and previous/next; also the old addresses in `src/lib/moved.ts` |
| `src/pages/rss.xml.ts` | the feed |
| `src/layouts/Page.astro` | the document around every page: the family's top line, the policy, the foot |
| `src/styles/global.css` | the one stylesheet, the family's tokens copied in |
| `scripts/migrate.mjs` | brought the essays over from abap2UI5/docs; see below |
| `test/site.test.mjs` | what the built site must keep |

## Adding an essay

Create `src/content/essays/43-the-slug.md`:

```md
---
title: "The Title, Without the Number"
number: 43           # the place in reading order, the same as in the file name
part: running        # rests | how | day | where | running | coda
blurb: "one line, lower case, no period - the line in the index"
description: "optional: the meta description, a sentence"
---

The text. Links to a sister essay are `/insights/06-ui5-over-the-wire/`,
links to the manual are absolute (`https://abap2ui5.github.io/docs/...`),
a diagram goes to `public/` and is referenced as `/insights/43-name.svg`.
```

The number is the essay's place in reading order: the index, the feed, the
previous/next links and the part boundaries follow from `number` and `part`.
A new essay anywhere but at the end shifts the numbers - and the slugs - of
the essays after it; `AGENTS.md` lists what moves with them. `npm run check` tells you
if a link points nowhere.

## No script, no inline style

Every page carries a Content-Security-Policy of `script-src 'self';
style-src 'self'`, and `npm test` fails a build that contains a `<script>`
or a `style=""` attribute. Code is therefore highlighted by Prism (classes
the stylesheet colours), not Shiki (a style attribute per token). The ABAP
grammar is Prism's own.

## Migration from the docs

`scripts/migrate.mjs` read `docs/advanced/insights/` of abap2UI5/docs, took
the parts, the reading order and the blurbs from its index, wrote the essays
here with a frontmatter and rewritten links, and copied the SVGs - last run
against abap2UI5/docs at 88ba749 (#398). The essays left the docs in
abap2UI5/docs#399, so there is nothing to run it against any more: this
repository is their source, and the script stays for the record. The docs keep
a redirect stub for every old address; `AGENTS.md` says what that means for
renaming an essay.

## License

MIT, see [LICENSE](LICENSE). Inter is under the SIL Open Font License
([public/fonts/NOTICE.md](public/fonts/NOTICE.md)).
