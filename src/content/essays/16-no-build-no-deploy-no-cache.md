---
title: "No Build, No Deploy, No Cache"
number: 16
part: how
blurb: "change, activate, refresh — and where a BSP still enters"
description: "What is missing from change, activate, refresh - no frontend build, no deployment path, no cache to invalidate - because the initial page and the frontend modules are answered from ABAP source."
---

The loop is: change the class, activate, refresh the browser.

This article is about what is *missing* from that sentence, starting with the
first page. Somebody has to deliver the initial HTML. In the SAP world that normally means a BSP application. It is a frontend artifact that is built somewhere, deployed to the ABAP stack and transported on its own path. When it changes, it has to be removed from its own caches.

abap2UI5 needs no BSP when it is started through its own ICF service, which is
the normal installation. The initial GET is answered from ABAP source code:
the page and the frontend modules it needs are strings in generated classes,
and serving them is a method call. A BSP is involved in two cases only, and
both apply once per system, not per app:

- The Fiori launchpad loads the frontend from the UI5 repository, so a
  launchpad installation has one BSP for the whole system
  ([#29](/insights/29-a-tile-like-any-other/)).
- A custom control of your own lives in a BSP of its own
  ([#15](/insights/15-where-your-own-javascript-goes/)).

![How the frontend gets to the browser: four steps with a BSP, or a method that returns a string.](/insights/16-initial-request.svg)

*How the frontend gets to the browser: four steps with a BSP, or a method that returns a string.*

The result is a project that consists only of ABAP, and everything below
follows from it.

## No Build

Pull the repository with abapGit, activate, call the ICF service. There is no
npm install, no bundler, no dist folder and no separate deployment path that
has to succeed before the app exists. A patch release of some indirect
dependency cannot break anything.

## No Deployment

The app is a class. Activating it is the deployment, and the standard
transport system moves it to production like any other ABAP object. The
backend and the frontend can never be on different versions, which is the
cause of many Fiori incidents.

## No Cache to Invalidate

The UI is built on every request
([#6](/insights/06-ui5-over-the-wire/)), so no build output can be out of
date. Nobody runs a cache transaction and nobody asks a colleague to
hard-refresh. If a change does not appear, it was not activated.

## No IDE Agreement

It is ABAP. ADT, SE80 or a VS Code setup is a personal preference and not a
project decision, and nobody installs a frontend toolchain to fix a label.

## No Context Switch to Debug

A breakpoint in the method that builds the view stops there. The browser
developer tools stay closed, because the logic that produced the screen runs
in the backend.

Every file that reaches the browser is in the repository, where it can be
read and compared, and it is transported by the system that already governs
everything else. What that is worth to a review is on
[What you keep](https://abap2ui5.github.io/why/#what-you-keep).

**In short:** change the class, activate, refresh — there is no frontend
build, no deployment and no cache in between.
