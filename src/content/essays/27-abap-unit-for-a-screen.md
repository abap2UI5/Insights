---
title: "ABAP Unit for a Screen"
number: 27
part: day
blurb: "testing the class, linting the view"
description: "Testing an abap2UI5 app in ABAP Unit without a client, HTTP or a browser - keep the logic out of client, call the handler methods directly, lint the view."
---

Testing a screen usually means driving a browser or mocking a framework. An
abap2UI5 app needs neither. It is a global class, and a global class has a
*Test Classes* include. This works because of a decision in the app, not in
the framework: **the logic does not touch `client`.**

Here is the test first. Nothing in it is abap2UI5:

```abap
CLASS ltcl_overdue DEFINITION FINAL
  FOR TESTING RISK LEVEL HARMLESS DURATION SHORT.

  PRIVATE SECTION.
    METHODS only_open_and_past_due FOR TESTING.

ENDCLASS.


CLASS ltcl_overdue IMPLEMENTATION.

  METHOD only_open_and_past_due.

    DATA(cut) = NEW zcl_sample_overdue( ).
    cut->key_date = `20260901`.
    cut->data_read( ).

    cut->overdue_calc( ).

    cl_abap_unit_assert=>assert_equals(
        act = lines( cut->t_overdue )
        exp = 1
        msg = `4711 is the only open invoice past the key date` ).

  ENDMETHOD.

ENDCLASS.
```

The test sets attributes, calls a method and reads attributes. It can do that
because of how the class is cut. `main( )` dispatches —
[#7](/insights/07-one-click-one-request/). The methods it dispatches to read
data, decide, and change attributes. Only `view_display( )` and the message
calls need the client, so a test calls the other methods directly:

```abap
CLASS zcl_sample_overdue DEFINITION PUBLIC.

  PUBLIC SECTION.
    INTERFACES z2ui5_if_app.

    TYPES:
      BEGIN OF ty_s_invoice,
        invoice TYPE string,
        due     TYPE d,
        open    TYPE abap_bool,
      END OF ty_s_invoice.
    TYPES ty_t_invoice TYPE STANDARD TABLE OF ty_s_invoice WITH EMPTY KEY.

    DATA t_overdue TYPE ty_t_invoice.
    DATA key_date  TYPE d.

    METHODS data_read.
    METHODS overdue_calc.

  PROTECTED SECTION.
    DATA client     TYPE REF TO z2ui5_if_client.
    DATA t_invoices TYPE ty_t_invoice.
    METHODS view_display.

  PRIVATE SECTION.
ENDCLASS.


CLASS zcl_sample_overdue IMPLEMENTATION.

  METHOD z2ui5_if_app~main.

    me->client = client.

    IF client->check_on_init( ).
      key_date = sy-datum.
      data_read( ).
      overdue_calc( ).
      view_display( ).
    ELSEIF client->check_on_navigated( ).
      view_display( ).
    ELSEIF client->check_on_event( `RECALC` ).
      overdue_calc( ).
    ENDIF.

  ENDMETHOD.

  METHOD data_read.
    " in your system: SELECT FROM the invoice table
    t_invoices = VALUE #( ( invoice = `4711` due = `20260801` open = abap_true )
                          ( invoice = `4712` due = `20260930` open = abap_true )
                          ( invoice = `4713` due = `20260701` open = abap_false ) ).
  ENDMETHOD.

  METHOD overdue_calc.
    t_overdue = VALUE #( FOR inv IN t_invoices
                         WHERE ( open = abap_true AND due < key_date )
                         ( inv ) ).
  ENDMETHOD.

  METHOD view_display.
    " builds the view with the view builder and calls client->view_display( )
  ENDMETHOD.

ENDCLASS.
```

No client, no HTTP, no browser, no test double for a framework. It is the same
test it would be for a class with no screen at all, because up to
`view_display( )` it *is* a class with no screen at all.

Two habits make this work, and both are free if you start with them. Handler
methods take their input from attributes rather than from
`client->get( )`, so a test can set the input. And `data_read( )` is its own
method, so a test can either run the real `SELECT` against test data or fill
the table by hand and test the logic alone. No view binds `t_invoices`, so it
sits in the protected section; a test that fills it by hand is made a friend
of the class with `LOCAL FRIENDS` in the test include.

The view itself has a different kind of check. The [linter](https://abap2ui5.github.io/docs/advanced/linter)
reconstructs the XML the chain builds and checks it against the UI5 metadata:
unknown control, misspelled property, wrong type. It needs no system and runs
in a pipeline in seconds.

**In short:** logic in ABAP Unit, view in the linter, and the roundtrip in a
browser. Keep the client out of the logic, and the logic is testable the way
any ABAP class is.
