---
title: "Why AI Agents Handle abap2UI5 Apps Well"
number: 42
part: coda
blurb: "why one class in one language suits an agent"
description: "Why a one-class, one-language app is the shape an AI coding agent handles best, and where the setup - the published page map, the linter, the MCP server, the sample catalogs - is documented."
---

This series kept returning to one property: an app is one class, and the class
is text. Nobody designed this for AI coding agents in 2023, but it suits them
well. Compare what an agent has to do in each case:

- **A Fiori Elements app.** The agent has to keep a CDS view, its annotations,
  a behavior definition, a service binding and a generated frontend
  consistent with each other. It can verify none of it without a system.
- **A UI5 freestyle app.** The agent holds an ABAP backend and a JavaScript
  frontend at the same time, and has to keep the contract between them
  correct.
- **An abap2UI5 app.** The agent writes one file in one language — the shape
  of [#5](/insights/05-a-classrun-for-the-browser/) — and what it writes is
  what runs.

Three things around the framework turn this into a working setup. None of
them is a feature of the framework itself:

- **A published [`llms.txt`](https://abap2ui5.github.io/docs/llms.txt).** The
  agent works from what abap2UI5 is today, not from training data in which
  the view builder still has a method per control.
- **The [linter](https://abap2ui5.github.io/docs/advanced/linter).** It
  reconstructs the UI5 view from the ABAP that builds it and reports what UI5
  does not have. So an agent can check its own work without a system.
- **The sample catalogs.** One complete, tested app per pattern.

The setup itself — the AI Studio in the browser, the paragraph to paste into a
prompt, the MCP server, the agent skills — is on
[Developing with AI](https://abap2ui5.github.io/docs/get_started/ai). An app
that an agent *operates*, as opposed to writes, is on
[Agent-Operable Apps](https://abap2ui5.github.io/docs/advanced/agents).

**In short:** one file, one language, and a linter that needs no system. That
is why an agent can write an abap2UI5 app and check it on its own.
