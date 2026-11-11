---
title: "One Click, One Request"
number: 7
part: how
blurb: "PBO, PAI, and the dispatch in main( )"
description: "The mental model under every abap2UI5 app - one click is one request and one call to main( ) on a fresh instance - and the three questions main( ) dispatches on, in order."
---

The mental model that everything else in the framework rests on fits in one
sentence: **every click is one HTTP request, and every request is one call to
`main( )` on a fresh instance.**

That is the dynpro's PBO (Process Before Output: build the screen) and PAI
(Process After Input: react to the user) under other names. A request arrives carrying the
event and what the user changed. `main( )` runs, decides what happens, and
returns. Whatever it built travels back, the work process is released, and the
next click starts the same way. Nothing runs between two clicks, because
nothing is there to run — no timer, no controller, no half-finished promise
waiting for something.

![One roundtrip: the draft is read, the changes are applied, main( ) runs, the response is built and the draft is written under a new id.](/insights/07-roundtrip.svg)

*One roundtrip, start to end — the five steps every other article in this series zooms into.*

So `main( )` is a dispatcher, and it dispatches on three questions the client
can answer:

```abap
  METHOD z2ui5_if_app~main.

    me->client = client.

    IF client->check_on_init( ).
      data_read( ).            " once - this instance has never run
      view_display( ).
    ELSEIF client->check_on_navigated( ).
      view_display( ).         " back from a sub-app or a popup: hand a view back
    ELSEIF client->check_on_event( `SAVE` ).
      on_save( ).              " the model changed - the view stands
    ENDIF.

  ENDMETHOD.
```

![Three questions, in this order, and what each branch owes the browser.](/insights/07-dispatch.svg)

*Three questions, in this order, and what each branch owes the browser.*

Three things about that shape are worth knowing before you write your first
one, because two of them are the mistakes everybody makes exactly once.

**Init before navigated.** `check_on_init( )` is true exactly once, on the very
first call. Every path to a first call raises `check_on_navigated( )` as well,
so in the `ELSEIF` chain the first match wins and the init branch has to stand
first, or the one-time setup never runs.

**A return owes a view.** Coming back from a sub-app or a value help does not
fire `check_on_init( )` again. It fires `check_on_navigated( )`, and the browser
is still showing whatever the sub-app left. An app that builds its view only
under init leaves the user on that stale screen, and nothing reports it — the
response simply carries no view, and no view is a perfectly valid thing to send.

**An event owes nothing.** The handler changes attributes and returns. Bound
controls update from the model, focus and scroll stay where they were, and
`view_display( )` is called only when the structure of the screen changes.
Article [#10](/insights/10-only-the-changed-part/) is about exactly that.

The one thing that survives between the three is the instance itself,
serialized after every request — [#11](/insights/11-a-new-instance-on-every-request/).
Local variables, an open cursor, a lock: gone with the work process, every
time, no exceptions.

PBO builds, PAI decides, and the dialog step is a POST.
