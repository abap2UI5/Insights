---
title: "RAP or abap2UI5?"
number: 36
part: where
blurb: "behavior against screen, and EML from an abap2UI5 app"
description: "The technical criteria for choosing RAP with Fiori Elements or abap2UI5 for a given screen - behavior against screen, EML from an abap2UI5 app, a runtime-typed model, the minimum release."
---

Most systems end up with both, and the question is "which one for this
screen", not "which framework". The criteria below are the technical ones;
the comparison of the two as products, with their costs and their reach, is on
[When to use it, and when not](https://abap2ui5.github.io/why/#when-to-use-it-and-when-not).

![UI5 Freestyle writes the screen in a frontend project, RAP with Fiori Elements as annotations, abap2UI5 in the ABAP class - and each sends something different to the browser.](/insights/36-where-the-screen-is-written.svg)

*Where the screen is written, what travels, and where the state waits between two clicks.*

## The Comparison at a Glance

| Criterion | RAP + Fiori Elements | UI5 Freestyle | abap2UI5 |
|---|---|---|---|
| Where the screen is written | CDS annotations | a frontend project (XML views, JavaScript) | the ABAP class |
| Where the logic lives | the behavior of the business object, in ABAP | split: JavaScript in the browser, a service in ABAP | methods of the ABAP class |
| When the data model is fixed | design time, in CDS | design time, in the OData service | runtime: any internal table |
| Controls you can use | what the annotations describe, plus extension points | every UI5 control | every UI5 control |
| Minimum release | a release that has RAP | a release with OData and a UI5 repository | NetWeaver 7.02 |
| Works offline, state in the browser | with extra tooling | yes, with effort | no |
| Who writes it | ABAP developers with CDS and RAP skills | JavaScript and UI5 developers | ABAP developers |

- **Use RAP with Fiori Elements** when the screen is a standard list report or
  object page, or when more than one consumer needs the behavior of the
  business object.
- **Use UI5 Freestyle** when the browser has to hold state or work offline
  ([#37](/insights/37-freestyle-or-abap2ui5/)).
- **Use abap2UI5** when the screen has one consumer, needs controls or a
  layout the annotations do not offer, has a model known only at runtime, or
  runs on a release without RAP.

The rest of this essay explains the RAP column, one criterion at a time.

## The Criteria in Detail

**Behavior or screen.** RAP models the behavior of a business object —
validations, determinations, authorizations, draft handling — in a place that
is not a UI, and every consumer of the object gets it. ("Draft" here is the RAP
draft; see *Drafts* below.) Fiori Elements then
generates the screen from annotations. abap2UI5 models nothing: the class
builds a view and reacts to events, and whatever it reads or writes is an
ordinary ABAP statement in a method
([#3](/insights/03-one-class-no-programming-model/)). So the first
question is where the logic has to live. A transactional object with more than
one consumer — a second UI, an API, a batch job — needs the behavior outside
the screen, and RAP is where SAP put it. A screen with one consumer and the
logic of that screen alone has nothing to put there.

**The two work together.** An abap2UI5 app calls a RAP business object through
EML (the ABAP statements for RAP business objects) like any other consumer. `MODIFY ENTITIES`, `COMMIT ENTITIES`, the `FAILED`
and `REPORTED` structures — the validations run, the draft works, the
authorization control applies, and the business object does not notice that
the caller is a screen. When Fiori Elements cannot produce the screen you
need, keep the business object and put a different UI in front of it.

**Where the model is decided.** A RAP service fixes the entity type at design
time, in CDS, and the frontend discovers it from the metadata. An abap2UI5
view binds internal tables, and an internal table may have a type that exists
only at runtime ([#2](/insights/02-somewhere-on-the-way-to-ui5/)). A
screen whose columns are created at runtime (with RTTI, the runtime type
services), or whose layout branches on the data
([#12](/insights/12-swapping-the-view-at-runtime/)), has no
annotation to write.

**Where the vocabulary ends.** Fiori Elements renders what the annotation
vocabulary describes — list report, object page, their facets and actions —
and everything outside it is an extension point. abap2UI5 names any control
in the UI5 library ([#4](/insights/04-no-annotation-in-between/)),
and writes the layout by hand in return. A list report over a stable model is
cheapest generated; a wizard, a tree, a custom control is cheapest written.

**The minimum release.** RAP needs a release that has it. abap2UI5 runs from
NetWeaver 7.02 up ([#31](/insights/31-one-codebase-702-to-abap-cloud/)),
and the same class runs on every release in between, which decides the
question on a system that has no RAP at all.

**Drafts.** RAP keeps a draft of the business object, in its draft table, for
as long as the draft lives. abap2UI5 keeps a draft of the app instance, in
`z2ui5_t_01`, for four hours by default
([#26](/insights/26-100-rows-four-hours-one-request/)). The two are different
things with the same name. An abap2UI5 screen over a RAP object uses both, and
the one that holds the business data is RAP's.

**In short:** model the behavior once, in RAP, if more than one consumer will
use it. Build the screen with whichever of the two reaches the controls and
the data it needs with the least code.
