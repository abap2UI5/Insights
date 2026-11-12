---
title: "When the API Is Not Released"
number: 33
part: where
blurb: "the clean core levels, and the wrapper"
description: "SAP's four clean core levels, where abap2UI5 sits (Level A), where an app lands by what it calls, and the wrapper that gives an unreleased API a name and a boundary."
---

SAP grades an extension, and since August 2025 it does so on four **clean core
levels**:

| Level | Language version | What the extension uses | Clean core |
|---|---|---|---|
| **A** | ABAP for Cloud Development | released APIs only | yes, and upgrade-stable |
| **B** | Standard ABAP | classic APIs and the frameworks SAP recommends for them: BAdIs, user exits, ALV, SAP GUI | yes, with less upgrade stability |
| **C** | Standard ABAP | SAP-internal objects, neither released nor classified | conditionally — re-check before every upgrade |
| **D** | Standard ABAP | modifications, implicit enhancements, objects SAP marks as no API | no |

The levels replaced the three-tier model. Nothing written under the tiers has
to be migrated:

| Old tier | New level |
|---|---|
| Tier 1 | Level A |
| Tier 2 (wrappers) | no level of its own: the wrappers still exist, and an app that calls one stays Level A |
| Tier 3 | Level B, C or D, depending on what the code uses |

The ABAP Test Cockpit and the Cloudification Repository Viewer say which level
an object lands on, so the level can be measured.

abap2UI5 is Level A. It is written in ABAP for Cloud Development and calls
released APIs only.

As [#32](/insights/32-cloud-ready-is-a-property-of-your-app/) said, that says
nothing about your app. The level of an app is decided by what the app calls.
A screen built on a released API is Level A, whether it renders through
abap2UI5 or anything else.

## When the API You Need Is Not Released

This is the case that comes up in every project. The answer is a wrapper: a
class in Standard ABAP that calls the classic API and is itself released for
ABAP for Cloud Development. It is graded on its own — B,
as long as it stays with classic APIs — and the app calling it stays A.

![The app stays in ABAP for Cloud Development and reaches a classic API through a wrapper written in Standard ABAP](/insights/use_cases/on_stack_wrapper.svg)

*The app calls the wrapper, and the wrapper calls the classic API.*

The value of the wrapper is that the part of the system which is not
upgrade-stable now has a name, a size and a boundary. When SAP changes the
classic API, there is one class to re-check, and no search through every app
that ever touched it. The wrapper does not make the dependency clean; it makes
it findable.

## When the App Itself Is Standard ABAP

On S/4HANA Private Cloud and on-premise the app itself may also be Standard
ABAP. On releases that do not know ABAP for Cloud Development yet, that is the
only option. The framework stays Level A either way. Moving an app up a level
later therefore means changing what it calls; how it renders stays the same:

![Apps written in Standard ABAP call classic APIs or SAP-internal objects, while abap2UI5 itself stays Level A](/insights/use_cases/on_stack_level_b.svg)

*Each app has the level of what it calls; the framework is Level A in every case.*

**In short:** the framework is Level A, an app has the level of what it calls,
and a wrapper keeps an unreleased API in one named place.

*The levels are SAP's, from the
[Clean Core Extensibility white paper](https://community.sap.com/t5/technology-blog-posts-by-sap/why-clean-core-matters-get-some-insights-into-our-brand-new-extensibility/ba-p/14163750)
of August 2025; the
[ABAP Extensibility Guide](https://community.sap.com/t5/technology-blog-posts-by-sap/abap-extensibility-guide-clean-core-for-sap-s-4hana-cloud-august-2025/ba-p/14175399)
carries the technical rules behind each one, and
[Clean Core maturity and the new extensibility levels](https://community.sap.com/t5/technology-blog-posts-by-sap/clean-core-maturity-and-the-new-extensibility-levels/ba-p/14293974)
covers grading code that already exists.*
