---
title: "A New Instance on Every Request"
number: 11
part: how
blurb: "serialized state, and what that asks of the class"
description: "Every request is a fresh instance of the app class - how z2ui5_t_01 carries the serialized instance forward, which attributes survive, and why a large attribute costs every click."
---

Every request lands on a fresh instance of the app class. No session holds the
previous one, and the next request may not even reach the same application
server.

Which raises a fair question: how does anything the user typed three clicks ago
still exist?

`z2ui5_if_app` inherits `if_serializable_object`, and that one line is the
answer. After each request the framework serializes the app instance into
`z2ui5_t_01` — one generic table for every app, not a typed draft table per
data model — and reads it back on the next one. The framework
calls this saved copy of the instance the *draft*. It is not a RAP draft: it
holds no business data model, only the serialized app object. The browser gets
a draft id, and sends the draft id back. The state itself never leaves the
server.

![Every request is a new instance; z2ui5_t_01 is what carries the last one forward.](/insights/11-draft.svg)

*Every request is a new instance; z2ui5_t_01 is what carries the last one forward.*

The whole instance survives, whatever the visibility of an attribute. People
often get this wrong: `PUBLIC` does not keep a value alive. `PUBLIC` is what
`_bind( )` needs to reach an attribute, because the framework resolves a bound
attribute by name from outside the class. The two sections have two different
jobs:

```abap
  PUBLIC SECTION.
    " bound to the view - the framework reads and writes these by name
    DATA customer TYPE string.
    DATA items    TYPE ty_t_item.

  PROTECTED SECTION.
    " never bound - but serialized all the same
    DATA client   TYPE REF TO z2ui5_if_client.
    DATA t_cache  TYPE ty_t_catalog.
```

What the serializer cannot write does *not* survive: a local variable, an open
cursor, an acquired lock, a reference to a class that is not serializable. The
`client` reference above is set again on every call, which is why
`me->client = client` is the first line of every `main( )`.

One consequence surprises even experienced ABAP developers, because in a
dialog program the habit was free: every attribute is written to the database
after every click. A catalog that is read once and kept in an attribute "as a
cache" is therefore written and read back on every click, whether the
attribute is public or protected, and it makes every click slower for as long
as the app runs. No keyword fixes that. Read anything large again per request,
and keep the instance as small as the screen needs.

The rule pays off. The app feels stateful — PBO, PAI, cancel, back — while
every request is independent. Any application server can answer any click. No
session has to stay on one server, be drained before a restart, or be
replicated between nodes. Your Basis colleagues will not have to think about
this app during a rolling restart.

**In short:** the app is stateful for the user and stateless for the system,
and the price is keeping the instance small.
