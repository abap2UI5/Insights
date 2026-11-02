// What the built site must keep, read off dist/ after `npm run build`.
// node:test, no browser: the pages are static HTML, so the properties worth
// holding are in the files - the addresses, the policy, no script and no
// inline style, every essay present, every local reference resolvable.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const DIST = path.join(import.meta.dirname, "..", "dist");
const BASE = "/insights/";
const ESSAYS = path.join(import.meta.dirname, "..", "src", "content", "essays");

const walk = (dir) =>
  fs.readdirSync(dir).flatMap((e) => {
    const p = path.join(dir, e);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
const pages = walk(DIST).filter((f) => f.endsWith(".html"));
const read = (f) => fs.readFileSync(f, "utf8");
const home = read(path.join(DIST, "index.html"));

const slugs = fs.readdirSync(ESSAYS).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
const numbers = slugs.map((s) => Number(s.slice(0, 2)));

/* The addresses other sites point at. abap2UI5/docs keeps a redirect stub
 * for every essay's old address under /docs/advanced/insights/, each naming
 * the essay here by its slug, and LinkedIn posts carry them. A renamed file
 * is a dead link somewhere this repository cannot see - rename one only
 * together with its stub in docs/public/advanced/insights/ over there, and
 * keep the old slug in src/lib/moved.ts. */
const ADDRESSES = [
  "01-the-cost-of-a-screen",
  "02-somewhere-on-the-way-to-ui5",
  "03-one-class-no-programming-model",
  "04-no-annotation-in-between",
  "05-a-classrun-for-the-browser",
  "06-ui5-over-the-wire",
  "07-one-click-one-request",
  "08-the-frontend-knows-nothing",
  "09-one-handler-for-every-app",
  "10-only-the-changed-part",
  "11-a-new-instance-on-every-request",
  "12-swapping-the-view-at-runtime",
  "13-where-the-selection-screen-went",
  "14-four-verbs-every-control",
  "15-where-your-own-javascript-goes",
  "16-no-build-no-deploy-no-cache",
  "17-what-the-client-can-do",
  "18-call-screen-leave-screen",
  "20-where-f4-went",
  "21-message-still-works",
  "23-the-lock-is-gone-by-the-next-click",
  "25-who-may-start-which-app",
  "26-100-rows-four-hours-one-request",
  "27-abap-unit-for-a-screen",
  "28-when-one-class-is-not-enough",
  "29-a-tile-like-any-other",
  "30-from-its-to-abap2ui5",
  "31-one-codebase-702-to-abap-cloud",
  "32-cloud-ready-is-a-property-of-your-app",
  "33-when-the-api-is-not-released",
  "34-on-stack-or-side-by-side",
  "35-one-app-many-systems",
  "36-rap-or-abap2ui5",
  "37-freestyle-or-abap2ui5",
  "38-what-the-client-can-send",
  "40-how-many-users",
  "41-upgrading-the-framework",
  "42-written-for-agents",
];

test("every address the docs' redirect stubs point at is still an essay here", () => {
  for (const slug of ADDRESSES) assert.ok(fs.existsSync(path.join(DIST, slug, "index.html")), `${BASE}${slug}/ - abap2UI5/docs redirects there`);
});

test("the number is the place in reading order: 1 to N, no gap, as the file name says", () => {
  const sorted = [...numbers].sort((x, y) => x - y);
  assert.deepEqual(sorted, sorted.map((_, i) => i + 1), "numbers run 1..N without a gap");
  for (const slug of slugs) {
    const fm = fs.readFileSync(path.join(ESSAYS, `${slug}.md`), "utf8").match(/^number: (\d+)$/m);
    assert.equal(Number(fm[1]), Number(slug.slice(0, 2)), `${slug}: frontmatter number`);
  }
});

test("an address of the earlier numbering sends the reader on to the same essay", () => {
  const moved = fs.readFileSync(path.join(import.meta.dirname, "..", "src", "lib", "moved.ts"), "utf8");
  const pairs = [...moved.matchAll(/"(\d\d-[a-z0-9-]+)": "(\d\d-[a-z0-9-]+)"/g)];
  assert.ok(pairs.length > 0);
  for (const [, old, slug] of pairs) {
    assert.ok(!slugs.includes(old), `${old} is an essay again - drop it from moved.ts`);
    assert.ok(slugs.includes(slug), `${old} -> ${slug}, which is not an essay`);
    const html = read(path.join(DIST, old, "index.html"));
    assert.match(html, new RegExp(`http-equiv="refresh" content="0; url=${BASE}${slug}/"`), old);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://abap2ui5\\.github\\.io${BASE}${slug}/">`), old);
  }
});

test("every essay in src/content/essays has a page at its own slug", () => {
  assert.ok(slugs.length >= 30, `${slugs.length} essays`);
  for (const slug of slugs) assert.ok(fs.existsSync(path.join(DIST, slug, "index.html")), `${BASE}${slug}/`);
});

test("no page runs a script or carries an inline style, and the policy says so", () => {
  for (const file of pages) {
    const html = read(file);
    const page = path.relative(DIST, file);
    assert.equal([...html.matchAll(/<script\b/gi)].length, 0, `${page}: a <script>`);
    assert.doesNotMatch(html, /\son[a-z]+=/i, `${page}: an inline event handler`);
    assert.doesNotMatch(html, /\sstyle="/i, `${page}: an inline style the policy would refuse`);
    const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
    assert.ok(csp, `${page}: a Content-Security-Policy meta`);
    assert.match(csp[1], /script-src 'self'(;|$)/);
    assert.match(csp[1], /style-src 'self'(;|$)/);
  }
});

test("everything a page loads or links locally is in dist/, under the base", () => {
  for (const file of pages) {
    const html = read(file);
    const page = path.relative(DIST, file);
    const refs = [...html.matchAll(/\s(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)].map((m) => m[1]).filter((u) => u.startsWith("/"));
    for (const ref of refs) {
      assert.ok(ref.startsWith(BASE), `${page}: ${ref} is outside ${BASE}`);
      const target = path.join(DIST, ref.slice(BASE.length) || "index.html");
      const resolved = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, "index.html") : target;
      assert.ok(fs.existsSync(resolved), `${page}: ${ref} is not in dist/`);
    }
    for (const m of html.matchAll(/\s(?:src)="(https?:[^"]+)"/g)) assert.fail(`${page} loads ${m[1]}`);
  }
});

test("ABAP is highlighted: Prism tokens, not plain text", () => {
  const essay = read(path.join(DIST, "02-somewhere-on-the-way-to-ui5", "index.html"));
  assert.match(essay, /class="language-abap"/);
  assert.match(essay, /<span class="token keyword">/);
});

test("the family's top line: the brand leads home, the breadcrumb marks the page", () => {
  for (const file of pages) {
    const html = read(file);
    assert.match(html, /<a class="brand" href="https:\/\/abap2ui5\.github\.io\/">/, path.relative(DIST, file));
    assert.match(html, /aria-current="page"/, path.relative(DIST, file));
  }
});

test("the index lists every essay and every part", () => {
  assert.equal((home.match(/class="group"/g) || []).length, 6, "six parts, one group each");
  for (const n of numbers) assert.match(home, new RegExp(`<span class="for">#${n}</span>`), `#${n}`);
});

test("no VitePress attribute syntax leaks into a page", () => {
  for (const file of pages) assert.doesNotMatch(read(file), /\{\s*(target|width)=/, path.relative(DIST, file));
});

test("an image that states its size states the size of its SVG", () => {
  // width/height on <img> set the rendered size: a stale pair scales the
  // diagram, and its 13px labels with it, up past the text around it
  for (const file of pages) {
    for (const [, src, w, h] of read(file).matchAll(/<img src="\/insights\/([^"]+\.svg)"[^>]*? width="(\d+)" height="(\d+)"/g)) {
      const svg = read(path.join(DIST, src));
      const [, vw, vh] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      assert.deepEqual([w, h], [vw, vh], `${path.relative(DIST, file)}: ${src}`);
    }
  }
});

test("the links to the manual are absolute and name no page of this site", () => {
  for (const file of pages) {
    const html = read(file);
    assert.doesNotMatch(html, /href="\/(advanced|cookbook|configuration|get_started|resources|tutorials)\//, `${path.relative(DIST, file)}: a docs link left relative`);
  }
});

test("the canonical address is the published one, and the feed is there", () => {
  assert.match(home, /<link rel="canonical" href="https:\/\/abap2ui5\.github\.io\/insights\/">/);
  const rss = read(path.join(DIST, "rss.xml"));
  assert.equal((rss.match(/<item>/g) || []).length, slugs.length);
});

test("the search feed: every essay once, at its own address, for the family's index", () => {
  const feed = JSON.parse(read(path.join(DIST, "search.json")));
  assert.equal(feed.site, "Insights");
  assert.equal(feed.url, "https://abap2ui5.github.io/insights/");
  assert.equal(feed.entries.length, slugs.length, "one entry per essay");
  for (const e of feed.entries) {
    assert.match(e.title, /^#\d+ \S/, "the number and the title");
    assert.ok(e.text, `${e.title}: a line of text`);
    assert.ok(Array.isArray(e.headings), `${e.title}: headings`);
    const slug = e.url.replace("https://abap2ui5.github.io/insights/", "").replace(/\/$/, "");
    assert.ok(slugs.includes(slug), `${e.url} is an essay`);
    const html = read(path.join(DIST, slug, "index.html"));
    for (const [, anchor] of e.headings) assert.match(html, new RegExp(`id="${anchor}"`), `${e.url}#${anchor}`);
  }
});

test("every diagram follows the reader's colour scheme and is well-formed XML", () => {
  const svgs = walk(DIST).filter((f) => f.endsWith(".svg"));
  assert.ok(svgs.length > 10);
  for (const file of svgs) {
    const svg = read(file);
    const name = path.relative(DIST, file);
    assert.match(svg, /<style data-dark="">@media \(prefers-color-scheme:dark\)/, `${name}: no dark variant`);
    // XML has no attribute without a value - the one slip that turns a diagram into a broken image
    for (const [tag] of svg.matchAll(/<[a-zA-Z][^>]*>/g)) {
      const bare = tag.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
      assert.doesNotMatch(bare, /\s[\w:-]+(?=[\s/>])/, `${name}: an attribute without a value in ${tag.slice(0, 60)}`);
    }
  }
});
