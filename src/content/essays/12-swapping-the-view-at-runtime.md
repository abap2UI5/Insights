---
title: "Swapping the View at Runtime"
number: 12
part: how
blurb: "a different control, chosen in an IF"
description: "A different control chosen in an IF - what follows when the view is a string the app produces per request rather than an artifact fixed at design time."
---

The view is a string the app produced for this request. Which raises an
obvious question: what stops the next request from producing a different
one?

Nothing does, and that is intended.

```abap
  METHOD z2ui5_if_app~main.

    me->client = client.

    IF client->check_on_navigated( ).
      view_display( ).
    ELSEIF client->check_on_event( `TOGGLE` ).
      as_list = xsdbool( as_list = abap_false ).
      view_display( ).      " the structure changes, so this event sends a view
    ENDIF.

  ENDMETHOD.

  METHOD view_display.

    DATA(page) = z2ui5_cl_ui5_view_builder=>factory(
        )->ele( n = `View` ns = `mvc`
            )->a( n = `xmlns`     v = `sap.m`
            )->a( n = `xmlns:mvc` v = `sap.ui.core.mvc`

            )->ele( `Page`
                )->a( n = `title` v = `Products`

                )->tag( `Switch`
                    )->a( n = `state`  v = client->_bind( as_list )
                    )->a( n = `change` v = client->_event( `TOGGLE` ) ).

    IF as_list = abap_true.
      render_list( page ).
    ELSE.
      render_table( page ).
    ENDIF.

    client->view_display( page->stringify( ) ).

  ENDMETHOD.
```

![Same data, same class — the control is chosen in an IF.](/insights/12-view-swap.svg)

*Same data, same class — the control is chosen in an IF.*

Same data, same class. One click and the table is a list: a different
control, chosen in ABAP, in an `IF`, as you would write it in a report. It is
not a table with hidden columns, and not a second app behind a navigation
step.

The code is ordinary ABAP; what follows from it is the interesting part.
A screen assembled at design time can vary only where somebody anticipated
variation and left a switch. A screen assembled per request varies wherever the
code branches, which is everywhere. Role-dependent layouts, a field that only
exists for one plant, a table that turns into a chart when the data is small
enough — none of these need a mechanism, because they are just code.

[#2](/insights/02-somewhere-on-the-way-to-ui5/) showed the same freedom for
the model: a structure described at runtime, not declared up front. Here it
applies to the view. Together they mean that both the data and the screen are
decided while the request runs, so what a screen can adapt to is no longer
fixed on the day it was designed.

**In short:** the view is built per request, so any `IF` in the app can choose
a different screen.
