---
title: "Data Binding: Where the Selection Screen Went"
number: 13
part: how
blurb: "the variable and the field are one declaration again"
description: "What PARAMETERS did that the browser lost - the variable and the field as one declaration - and how _bind( ) puts them back together."
---

Long before anyone said "full-stack" in a job ad, ABAP had this:

```abap
REPORT zre_app_input.
  PARAMETERS pa_arbgb TYPE t100-arbgb DEFAULT `MDG_TR`.
START-OF-SELECTION.
  MESSAGE |Input: { pa_arbgb }| TYPE `I`.
```

Four lines, and every layer is present. A screen exists. It has a labeled,
typed input field with a default and value help. It validates. It handles the
event. Nobody wrote a frontend, because declaring the variable *was* writing
the frontend.

A generation of developers built business software on that, and most of them
never thought of it as remarkable.

You name the data, the system draws the screen: that made ABAP productive for
thirty years, and it disappeared on the way to the browser. The variable and the field it appears in became two artifacts in
two places, maintained by two people, kept in step by a service in between.

abap2UI5 puts them back together with `_bind`:

![PARAMETERS: one declaration is the variable and the field. OData: variable and field are two artifacts with a service between. _bind: the field is the variable again.](/insights/13-parameters-bind.svg)

*PARAMETERS: one declaration is the variable and the field. OData: variable and field are two artifacts with a service between. _bind: the field is the variable again.*

```abap
    )->tag( `Input`
        )->a( n = `value` v = client->_bind( pa_arbgb )
```

`pa_arbgb` is a public attribute of the app class, and `_bind( )` receives the
ABAP variable itself, by reference — not a field name in a string. The
framework builds the model around it, sends it to the browser, takes the
user's input back and writes it into the same variable. What the developer maintains
is a variable, in a class, next to the code that reads it.

![The attribute is bound, appears as a path in the view and the model, the Input shows it, and what the user types travels back into the attribute before main( ) runs.](/insights/13-bound-value.svg)

*One attribute, there and back. The picture uses an attribute `quantity` as its example; `pa_arbgb` above travels the same way.*

One half of `PARAMETERS` does not come back: the layout is written by hand
here, because the screen is UI5 and UI5 offers far more than a selection
screen did. The other half does: the data lives in one place, and no service
sits between the field and the variable.

For a report that already exists, the hand-written layout has a shortcut.
The tool report2UI5 converts a classic report's user interface into a class that renders through abap2UI5: the selection screen, the event blocks, the `WRITE` list, the ALV, the messages. It leaves the report's logic as it was
([Report Migration](https://abap2ui5.github.io/docs/advanced/report_migration)).

**In short:** `_bind( )` makes a public attribute and a field on the screen
one thing again, in both directions.
