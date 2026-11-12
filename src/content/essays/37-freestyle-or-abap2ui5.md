---
title: "UI5 Freestyle or abap2UI5?"
number: 37
part: where
blurb: "the four cases where the browser has to be smart"
description: "The technical criteria for choosing UI5 Freestyle or abap2UI5 - the four cases where the browser has to be smart, and the case where the backend already knows everything."
---

Both give full access to the UI5 control library. Neither limits what a screen
can contain. The choice is about two other things: where the state lives
between two clicks, and who writes the code. The comparison of the two as a
whole is on
[When to use it, and when not](https://abap2ui5.github.io/why/#when-to-use-it-and-when-not);
this essay covers the technical side.

| Criterion | UI5 Freestyle | abap2UI5 |
|---|---|---|
| Where the screen is written | a frontend project (XML views, JavaScript) | the ABAP class |
| Where the state is between two clicks | in the browser | on the server, as the saved app instance |
| What a click does | runs JavaScript; calls the server when needed | always one request to the server |
| Offline, drag and drop, live collaboration | possible | not what it is built for |
| Paging and filtering of large tables | the OData service, straight against the database | the app's own `SELECT` |
| What is deployed | a frontend app and an OData service | one ABAP class |
| Who writes it | JavaScript and UI5 developers, often a separate team | ABAP developers |

- **Use UI5 Freestyle** when the browser has to be smart: offline, heavy
  interaction, or a separate frontend team.
- **Use abap2UI5** when the data, the rules and the decisions are already in
  ABAP and the team writes ABAP.
- **Use RAP with Fiori Elements** for the standard list report and object page
  ([#36](/insights/36-rap-or-abap2ui5/)).

![UI5 Freestyle writes the screen in a frontend project, RAP with Fiori Elements as annotations, abap2UI5 in the ABAP class - and each sends something different to the browser.](/insights/36-where-the-screen-is-written.svg)

*The same picture as in [#36](/insights/36-rap-or-abap2ui5/): where the screen is written, what travels, and where the state waits.*

## When UI5 Freestyle Is the Better Choice

Use UI5 Freestyle when the browser has to be smart. There are four such
cases, and each is a consequence of [#7](/insights/07-one-click-one-request/): every
event is a request to the server, and nothing runs between two of them.

- **No offline-first app.** Every event asks the server what happens next, and
  the page itself needs the network to load. What exists is an experimental
  event queue, `cs_event-offline_queue`: the events it names wait in the
  browser while the backend cannot be reached, survive a reload, and are sent
  in order once the network is back — a form that saves later, not an app
  that works without a server. A warehouse app for a device with no signal is
  a different architecture.
- **Real-time and heavily interactive UIs do not fit.** Drag and drop across a
  board, a canvas, live collaboration: anywhere the important state lives in
  the browser between roundtrips. One request per event cannot be tuned into
  that.
- **Pushdown to HANA is indirect.** A typed OData service can put a CDS view in
  front of the database and let the frontend page, filter and fuzzy-search
  straight against it. Here the app selects in ABAP and sends the result, and
  a bound table is capped by the model's size limit
  ([#26](/insights/26-100-rows-four-hours-one-request/)) — paging and
  filtering are the app's `SELECT`.
- **Separate frontend teams gain nothing.** The whole benefit assumes one developer
  holds the screen and the logic together. Where a frontend team ships on its
  own release cycle by design, the OData contract between the two is a
  feature, and giving it up costs more than it saves.

## When abap2UI5 Is the Better Choice

Use abap2UI5 when the backend already knows everything. The data,
the rules and the decisions are in ABAP, the screen shows them and sends
events back, and the team writing it writes ABAP. Then a separate frontend
project is a second place to maintain, a second thing to deploy and a second
release to coordinate — for a screen whose logic never left the server. The
loop is change, activate, refresh
([#16](/insights/16-no-build-no-deploy-no-cache/)). The logic is tested in
ABAP Unit and the view is checked by the linter
([#27](/insights/27-abap-unit-for-a-screen/)).

Picking one does not rule out the other later. The view is a string either
way, the controls are the same controls, and an abap2UI5 app can be embedded
into a Fiori Elements page as a section
([Fiori Elements Integration](https://abap2ui5.github.io/docs/advanced/fiori)).

**In short:** if the important state has to live in the browser, write UI5
Freestyle. If it lives in ABAP anyway, write the screen in ABAP too.
