---
title: "One Codebase, 7.02 to ABAP Cloud"
number: 31
part: where
blurb: "why the release barely matters"
description: "Why abap2UI5 runs from NetWeaver 7.02 to ABAP Cloud from one codebase - the three utility classes that absorb the release differences, the generated 702 branch, and UI5 from the bootstrap."
---

abap2UI5 runs from NetWeaver 7.02 to ABAP Cloud from one codebase. This essay
says why that is possible and what it means for an app.

Most SAP landscapes are currently two landscapes: something old that runs the
business, and something new that is being built beside it. Anything written
for one side is usually written again for the other.

abap2UI5 asks very little of the release it runs on. This follows from what
the framework does: it produces two strings and moves them over HTTP. There is no CDS artifact, no RAP object,
no OData service in the middle, so there is almost nothing a given release has
to support.

A few things do differ between releases: GUID creation, base64 and code page
conversion, finding the classes that implement an interface, the HTTP request
and response objects, and a handful more. They sit in three utility classes in
one package. These classes use dynamic calls, so the same code line satisfies
both language versions: ABAP Cloud and Standard ABAP.

Older releases are handled by generation. New ABAP syntax is written normally in the main
repository, and abaplint generates the low-syntax branch automatically, down to
7.02. Hand-downporting would produce a second codebase that drifts and that
nobody can debug; a generated one cannot drift, because it is regenerated.

And the frontend does not age with the backend. By default UI5 is loaded from
a CDN, so the UI5 version is a configuration decision and does not depend on
the SAP release. A control released this year works on a system from 2010.
The other sources of UI5, and when to use them, are in
[#39](/insights/39-where-ui5-comes-from/).

![Where UI5 comes from decides whether its version follows the SAP release.](/insights/31-bootstrap.svg)

*Where UI5 comes from decides whether its version follows the SAP release.*

**In short:** the framework needs almost nothing from the release, so an app
is portable in both directions. An app written on ABAP Cloud
runs on the older system. An app written on 7.02 runs on BTP ABAP Environment.
The screen built for the system being replaced moves to the new one, as long
as the app itself reads only what the new system still has
([#32](/insights/32-cloud-ready-is-a-property-of-your-app/)).
