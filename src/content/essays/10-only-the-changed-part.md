---
title: "Only the Changed Part"
number: 10
part: how
blurb: "the view stays, the model updates"
description: "Why the view is not sent on every click - an event changes the model alone, UI5 data binding updates the bound controls, and focus, scroll and half-typed input survive."
---

If the backend sends the view on every request —
[#6](/insights/06-ui5-over-the-wire/) — does the screen rebuild itself
on every click?

It would, and the user would notice at once. A rebuilt view is a new set of
controls: the cursor leaves the field, a half-typed entry is gone, the table
scrolls back to the top. Nobody wants to type a customer name three times.

So the view is not sent every time. Sending it is a decision the app makes:

```abap
  METHOD z2ui5_if_app~main.

    me->client = client.

    IF client->check_on_navigated( ).
      view_display( ).      " first display, and every return from a sub-app
    ELSEIF client->check_on_event( `COUNT` ).
      count = count + 1.    " changes the model - and nothing else happens
      " no view_display( ) here: the response carries the model alone
    ENDIF.

  ENDMETHOD.
```

`count` is a public attribute bound to a `Text` in the view. Every press of
the button runs `main( )`, and `main( )` changes a number and returns.
When the app does not call its `view_display( )`, the response carries the
model alone. The browser keeps the view it already shows, and UI5 handles the
changed model as it always does: data binding updates the controls bound to
what changed, and touches nothing else.

![What a response carries decides what survives on the screen.](/insights/10-partial-update.svg)

*What a response carries decides what survives on the screen.*

The DOM is not rebuilt. Focus stays in the field. The scroll position holds.
The value the user is halfway through typing survives, because the input
control was never replaced — only its bound value was.

The Over-the-Wire frameworks outside SAP do the same with HTML fragments. UI5
does it with a mechanism it has always had: a model changed, and the binding
updates the control. No diffing algorithm, virtual DOM or reconciler is
involved.

**In short:** an event normally changes only the model; the app sends the view
again only when the structure of the screen changes.
