---
title: "From ITS to abap2UI5"
number: 30
part: where
blurb: "twenty-seven years in one line"
description: "Twenty-seven years of SAP user interfaces in one line - ITS, BSP, Web Dynpro, UI5 Freestyle, RAP, abap2UI5 - and which move did not reverse."
---

This is twenty-seven years of SAP user interfaces in six steps. The usual
summary is "everything moved to the browser and stayed there". That is true
for the rendering. It is not true for the definition of the screen, which has
been moving back to ABAP, and abap2UI5 is the latest step of that move.

**ITS, 1996.** Dynpro screens rendered as HTML by the server. Every interaction
a full page from the server. Still in warehouses today, on scanners.

**BSP, 2001.** HTML and JavaScript written inside the ABAP stack, with ABAP
embedded for logic. Server-side rendering again, with real control over the
markup.

**Web Dynpro ABAP, 2006.** Views, context and controllers defined in ABAP. A
component model rather than a page model — and still the server building the
HTML.

**UI5 Freestyle, 2012.** The rendering moves. JavaScript, XML views and UI5
controls run in the browser; the backend delivers data through OData and stops
having an opinion about the screen.

**RAP and Fiori Elements, 2019.** The UI definition returns to ABAP as CDS
annotations, and a runtime in the browser turns them into the app. Fiori
Elements had been generating screens from annotations for some years by then;
2019 is the year RAP reached on-premise systems, after a first release in the
cloud in 2018, and gave it a programming model.

**abap2UI5, 2023.** The backend sends the XML view itself, and a static UI5 app
renders it.

![Twenty-seven years, and the one move that did not reverse.](/insights/30-timeline.svg)

*Twenty-seven years, and the one move that did not reverse.*

Read as a line, the history has two parts. For the first fifteen years ABAP
built the HTML. Then rendering moved to the browser, and it stays there,
because that is where a modern UI belongs. What has been moving back since is
the **definition** of the screen: first as annotations, then as the view
itself.

**In short:** sending the screen from the server
([#6](/insights/06-ui5-over-the-wire/), "UI5 Over-the-Wire") is a returning
idea, not a new one. What it has now, and the old server-rendered world never
had, is a real control library in the browser.
