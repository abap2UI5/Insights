---
title: "CALL SCREEN, LEAVE SCREEN"
number: 18
part: day
blurb: "the app stack, sub-apps and popups"
description: "The app stack - nav_app_call( ) pushes an instance, nav_app_leave( ) pops it, get_app_prev( ) hands the caller the sub-app with its typed attributes - and where popups and the launchpad fit."
---

Module pools had a call stack of screens. `CALL SCREEN 200` pushed one,
`LEAVE TO SCREEN 0` popped it, and the screen underneath came back with its
fields intact. It was one of those mechanisms nobody praised because nobody
noticed it working.

abap2UI5 has the same stack. The elements on it are app instances.

**Within one class** there is no stack to speak of. A flag or a step number
decides which view `view_display( )` builds, and the event handlers move it
along. Two views over the same internal table are two branches of one class,
and that is the right shape whenever the screens share their data — no
navigation, no handover, nothing to serialize twice.

**Between classes** the framework keeps the stack:

```abap
    " push: the called app takes the screen, this instance waits underneath
    client->nav_app_call( NEW zcl_sample_detail( order_id = order_id ) ).
```

```abap
    " pop: back to the caller, which is called again with check_on_navigated( )
    client->nav_app_leave( ).
```

![Three states of the stack: the list alone, the detail on top while the list waits as a draft, and the list again after the detail left.](/insights/18-stack.svg)

*Push and pop: the app below does not run while it waits, it is a draft.*

The caller gets `main( )` called again, `check_on_navigated( )` is true, and
its own attributes are still there — the instance was serialized while it
waited. What it has to do is show its view again, because the browser is still
displaying the sub-app's. And it can read what the sub-app left behind:

```abap
    ELSEIF client->check_on_navigated( ).
      TRY.
          DATA(detail) = CAST zcl_sample_detail( client->get_app_prev( ) ).
          message = detail->result.
        CATCH cx_sy_move_cast_error.
          " the first start: get_app_prev( ) is this app itself
      ENDTRY.
      view_display( ).
```

Note what that `CAST` implies: the result is not a string in a parameter table,
it is the sub-app instance itself, with all its typed attributes. Returning a
whole object from a screen is a luxury `CALL SCREEN` never had.

![The caller sets the question and calls the popup class, the popup displays and leaves, the caller runs again and reads the answer from the popup instance.](/insights/18-popup-return.svg)

*The same mechanism for a popup: its answer is an attribute of the instance the caller gets back.*

`nav_app_leave( )` called *with* an app instance is `LEAVE TO TRANSACTION`:
it starts the given app without pushing the current one, so there is nothing to
return to.

**A popup is the same thing in a smaller slot.** `popup_display( )` takes a
fragment instead of a view, `popup_destroy( )` closes it, and everything in
between is ordinary binding — the popup's inputs are attributes of the same
class. For a popup that is used from several apps, make it a class of its own:
an ordinary `z2ui5_if_app` that displays into the popup slot, and ends with
`nav_app_leave( )`. The caller reads the result through `get_app_prev( )`, as
above.

What is *not* on the stack: the Fiori Launchpad. Navigating between *Fiori*
apps goes through the launchpad's cross-app navigation, so that the shell's
history and back button keep working — that is a `cs_event` constant rather
than a `nav_app_call( )`, and
[its own page](https://abap2ui5.github.io/docs/cookbook/event_navigation/navigation/cross_app).
