// abap2UI5 Insights - the essays as a site of their own, published by
// GitHub Pages at https://abap2ui5.github.io/insights/
// (.github/workflows/pages.yml). One of the abap2UI5 family of sites: its own
// repository, its own build, nothing shared but the convention
// (CONVENTION.md in abap2UI5/abap2UI5.github.io).
//
// Static output only: no client component, no island, no script at all; the
// policy is `script-src 'self'` and `style-src 'self'` (src/layouts/Page.astro),
// and test/site.test.mjs fails a build with any script or inline style. That is
// why code is highlighted by Prism and not Shiki: Prism marks tokens with
// classes the stylesheet colours, Shiki writes a style attribute on every span.
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://abap2ui5.github.io",
  base: "/insights/",
  trailingSlash: "ignore",
  build: {
    format: "directory",
    assets: "assets",
    // one stylesheet file, cached, rather than a <style> per page
    inlineStylesheets: "never",
  },
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: "prism" },
});
