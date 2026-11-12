---
title: "The Cost of a Screen: A Whole App in One Class"
number: 1
part: rests
blurb: "a whole application as one class, and what has to exist beside it"
description: "The smallest complete abap2UI5 app - one class, one interface, one URL parameter - and what has to exist beside it in the system, which is nothing."
---

What does a screen cost in artifacts? For a UI5 app on an ABAP stack the
answer is usually a list: a data model, a service, a binding, an annotation
model, a frontend artifact, a deployment. Each of those objects is named,
transported and reviewed, and each belongs to exactly one application. The
list does not shrink when the logic behind the screen is thirty lines.

Here is what the list looks like for abap2UI5. A job monitor, not an excerpt
but the whole application:

```abap
CLASS zcl_sample_job_monitor DEFINITION PUBLIC.

  PUBLIC SECTION.
    INTERFACES z2ui5_if_app.

    TYPES:
      BEGIN OF ty_s_run,
        job    TYPE string,
        finish TYPE string,
        state  TYPE string,
      END OF ty_s_run.

    DATA runs TYPE STANDARD TABLE OF ty_s_run WITH EMPTY KEY.

  PROTECTED SECTION.
    DATA client TYPE REF TO z2ui5_if_client.
    METHODS view_display.
    METHODS model_init.

  PRIVATE SECTION.
ENDCLASS.


CLASS zcl_sample_job_monitor IMPLEMENTATION.

  METHOD z2ui5_if_app~main.

    me->client = client.
    IF client->check_on_init( ).
      model_init( ).           " once - on the very first call
      view_display( ).
    ELSEIF client->check_on_navigated( ).
      view_display( ).         " back from another app: show the view again
    ENDIF.

  ENDMETHOD.

  METHOD view_display.

    DATA(view) = z2ui5_cl_ui5_view_builder=>factory(
        )->ele( n = `View` ns = `mvc`
            )->a( n = `xmlns`     v = `sap.m`
            )->a( n = `xmlns:mvc` v = `sap.ui.core.mvc`

            )->ele( `Page`
                )->a( n = `title` v = `Last night`

                )->ele( `Table`
                    )->a( n = `items` v = client->_bind( runs )

                    )->ele( `columns`
                        )->ele( `Column`
                            )->tag( `Text`
                                )->a( n = `text` v = `Job`
                        )->end(
                        )->ele( `Column`
                            )->tag( `Text`
                                )->a( n = `text` v = `Finished`
                        )->end(
                        )->ele( `Column`
                            )->tag( `Text`
                                )->a( n = `text` v = `State`
                        )->end(
                    )->end(

                    )->ele( `items`
                        )->ele( `ColumnListItem`
                            )->ele( `cells`
                                )->tag( `Text`
                                    )->a( n = `text` v = `{JOB}`
                                )->tag( `Text`
                                    )->a( n = `text` v = `{FINISH}`
                                )->tag( `ObjectStatus`
                                    )->a( n = `text`  v = `{STATE}`
                                    )->a( n = `state` v = `{STATE}` ).

    client->view_display( view->stringify( ) ).

  ENDMETHOD.

  METHOD model_init.
    runs = VALUE #( ( job = `ZFI_POSTING`  finish = `03:14`  state = `Success` )
                    ( job = `ZMM_REORG`    finish = `03:41`  state = `Warning` )
                    ( job = `ZSD_INVOICES` finish = `04:02`  state = `Error` ) ).
  ENDMETHOD.

ENDCLASS.
```

Activate it, call the ICF endpoint with `?app_start=zcl_sample_job_monitor`,
and it is on screen, laid out by the UI5 controls it names, on a phone as well
as on a desktop.

The view is written with four methods, and they are all there is: `ele` opens
a UI5 control and moves into it, `tag` adds a control without moving into it,
`a` sets a property on the control just added, and `end` moves back up one
level — [#14](/insights/14-four-verbs-every-control/). `{JOB}` is a UI5 binding
path: the column `JOB` of the table the control is bound to.

Three things in the class carry the whole mechanism, and the rest of the
series takes them apart one at a time. `z2ui5_if_app` is the one interface
the framework asks for, with one method — [#3](/insights/03-one-class-no-programming-model/).
`check_on_init( )` is true once, on the first call: the data is read and the
view is built. `check_on_navigated( )` is true when the user comes back from
another app, and the view is shown again —
[#7](/insights/07-one-click-one-request/). `_bind( runs )` hands the
attribute to the view by reference; what the table shows is the internal
table, and what comes back from the browser lands in the same attribute —
[#13](/insights/13-where-the-selection-screen-went/).

Replace `model_init( )` with the `SELECT` that reads your job log and the
class is finished. Nothing is published beside it: no service, no annotation,
no frontend artifact, no deployment step. The class travels in a transport
like any other, and deleting it deletes the application.

That is the technical side of the cost. A small requirement often cannot pay
for a long list of artifacts, and then the screen is never built. What that
means for an organization is on
[What it costs](https://abap2ui5.github.io/why/#what-it-costs).

**In short:** an abap2UI5 app is one class with one interface, and nothing has
to exist beside it.
