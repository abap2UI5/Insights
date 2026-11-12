---
title: "One Handler for Every App"
number: 9
part: how
blurb: "no service per screen, and what the handler leaves to the apps"
description: "Why no abap2UI5 app has a service of its own - one generic HTTP handler moves two strings for every app, and what the framework leaves to the apps to stay that small."
---

Which backend artifacts does a screen need before a request can reach it? For
an OData-backed app the answer is a service: a CDS view or two, a service
definition, a service binding, a behavior definition and its implementation, a
projection — each belonging to exactly one application.

An abap2UI5 app has none of them, and no SEGW project either. Every app in the
system is served by the same generic HTTP handler. Generic means: it does not
know the app, the view or the model. It moves two strings, the view and the
model of [#6](/insights/06-ui5-over-the-wire/).

![A service per screen, against one handler that knows none of them.](/insights/09-one-service.svg)

*A service per screen, against one handler that knows none of them.*

You can see this in the debugger. Set a breakpoint in an app class and look at
the call stack: between the ICF and the app there are only the framework's own
two handler classes, a few frames each. There is no OData runtime, no SADL and
no Gateway. The stack fits on a screenshot.

The handler can be generic because nothing about the data is agreed in
advance. In an OData conversation the metadata comes first and fixes the
shape; data follows within that shape for the rest of the session. Here the
model travels **with** every response, so each response may carry a different
one. No contract is registered, so none can be violated.

## How Much Handler That Is

The communication core of abap2UI5 started as one HTTP handler class, two
interfaces and one database table. The framework has grown since, most visibly by the optional view builder. The part that carries every request is now a dozen small classes in the core package: handler, action, binding, model, events, draft. They sit behind the same two interfaces and the same one table, `z2ui5_t_01`.

It is small because of what it leaves to the apps. The framework does not build
views; apps do. It does not decide program flow; apps do. It does not wrap UI5
controls, so it does not grow when UI5 does. It does not implement a protocol,
because the protocol is a POST with two strings.

The system footprint is the source in the repository: no CDS artifacts, no
RAP objects, no generated code, no build step. What that means for a review
of the dependency is on
[What you keep](https://abap2ui5.github.io/why/#what-you-keep).

This removes artifacts, not effort: the app still decides everything. A screen
is no longer a set of objects to create, name, transport and govern. It is a
class.

**In short:** one generic HTTP handler serves every app, so no app needs a
service of its own.
