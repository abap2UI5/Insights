---
title: "One Frontend for Every App: The Frontend Knows Nothing"
number: 8
part: how
blurb: "one shell for every app, and why it never needs a redeploy"
description: "What the first GET delivers to the browser - a shell that renders a view and a model and knows no app - and why one shell serves every app in the system without a redeploy."
---

The first GET request delivers a UI5 app to the browser. What is inside it?

The app that arrives is a **shell**: a small generic UI5 app that takes a view
and a model from the server, renders them, and sends events back. It contains
no screen: no fields, no table, no buttons, and no code for what they do. It
cannot tell whether it is showing a table, a form or a wizard, and it does not
know which action follows the next click. The network tab of the browser shows
each answer arriving.

Everything it needs arrives per request — the two strings of
[#6](/insights/06-ui5-over-the-wire/). Everything it decides is decided
on the server.

The pattern has a name: a **Hypermedia-Driven Application** (HDA). It sits
between two better-known kinds of web app:

- A **multi-page app** (MPA) fetches a whole document for every interaction.
- A **single-page app** (SPA) holds routes and state in the browser. Changing
  either means building and deploying the frontend again.
- An **HDA** renders what the server sends and knows nothing else. htmx,
  Hotwire and LiveView work this way.

![Three ways to answer a click — multi-page, single-page, hypermedia-driven — and whether a change needs a frontend redeploy.](/insights/08-mpa-spa-hda.svg)

*Three ways to answer a click — multi-page, single-page, hypermedia-driven — and whether a change needs a frontend redeploy.*

This division of work is SAP GUI's. PBO builds the screen, the user acts, PAI
receives the event and decides what happens next. The dialog step became an
AJAX request and the screen became an XML view, but the conversation has the
same form. Anyone who has written a module pool will find the flow obvious.
Anyone who has only written SPAs will find it unusual.

The consequence is what matters here. There is **one** shell, and every app in
the system shares it. The alternative is one deployed frontend per app, each
with its own UI5 version, its own bootstrap and its own set of libraries, each
as old as the last time somebody touched it. Here one artifact is kept
current, and every app is current with it.

Anyone who has searched forty deployed apps for the one still on an old UI5
version knows what that is worth.

**In short:** the frontend is one generic shell that knows no app, so it never
needs a redeploy when an app changes.
