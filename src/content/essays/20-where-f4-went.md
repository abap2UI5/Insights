---
title: "Value Help: Where F4 Went"
number: 20
part: day
blurb: "value help in three sizes"
description: "Value help in three sizes - suggestion items filtered in the browser, a selection popup of the same class, a reusable value-help app on the stack - and what the DDIC link cost."
---

`PARAMETERS pa_arbgb TYPE t100-arbgb` got a value help for free, because the
DDIC knew the search help and the screen knew the DDIC. Press F4, get a list,
never write a line for it.

On the way to the browser that link broke: an `Input` in a UI5 view does not
know the type behind it. It is a field that holds text.

abap2UI5 does not bring the automatic value help back; that would need the
DDIC in the browser. It offers the three forms a value help usually takes,
each in a few lines, from the smallest to the largest.

## 1. Suggestions While Typing

The candidates are an internal table bound to the input. UI5 filters it in
the browser, and no roundtrip is needed after the first display:

```abap
    )->ele( `Input`
        )->a( n = `value`           v = client->_bind( country )
        )->a( n = `suggestionItems` v = client->_bind( t_countries )
        )->a( n = `showSuggestion`  b = abap_true
        )->ele( `suggestionItems`
            )->tag( n = `ListItem` ns = `core`
                )->a( n = `text`           v = `{CODE}`
                )->a( n = `additionalText` v = `{NAME}` ).
```

For a country list, a plant list, a status list — anything that fits in a
`SELECT` and does not change while the user types — this is the whole feature.

## 2. A Selection Popup

The input shows the value-help icon and raises an event when it is pressed. The handler runs the `SELECT`, fills a table, and opens a
popup with a list in it. The row the user picks is an event with an argument,
and the handler writes it into the bound attribute:

```abap
    )->tag( `Input`
        )->a( n = `value`            v = client->_bind( carrid )
        )->a( n = `valueHelpRequest` v = client->_event( `F4` )
        )->a( n = `showValueHelp`    b = abap_true ).
```

There is no sub-app and no navigation. The popup is a second view of the same
class, so the chosen row is simply an attribute.

## 3. A Reusable Value Help

When ten screens need the same F4, it becomes a class: a `z2ui5_if_app` that
displays a popup, is called with `nav_app_call( )`, and is read through
`get_app_prev( )` after it leaves. That is the stack from
[#18](/insights/18-call-screen-leave-screen/). It is written once, and the
search help it offers is whatever `SELECT` it runs.

## What It Costs

The automatic part is gone. The screen no longer knows the type behind the
field, so the developer names the candidates. In return the candidates can be
anything an ABAP `SELECT` can produce: a join, a CDS view with parameters, a
subset per user, or a table whose structure is only known at runtime, as in
[#2](/insights/02-somewhere-on-the-way-to-ui5/).

**In short:** value help is written by hand in one of three sizes —
suggestions, a popup in the same class, a reusable popup class.
