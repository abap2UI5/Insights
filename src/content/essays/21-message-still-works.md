---
title: "Messages and Errors: MESSAGE Still Works"
number: 21
part: day
blurb: "messages, exceptions, translation"
description: "Toasts, message boxes, sy, BAPIRET2 and exception objects - what carries over from classic messages, what an escaped exception does to the roundtrip, and check_hide_error_details."
---

An ABAP developer has thirty years of habits around messages, and the good news
is that most of them carry over unchanged. What changes is where the message
ends up.

## Toast and Message Box

A toast is for what needs no acknowledgment, a message box for what does:

```abap
    client->message_toast_display( `Saved` ).

    client->message_box_display( text = `Order is locked by another user`
                                 type = `error` ).
```

## The Classic Structures Work Directly

`sy` after a `MESSAGE ... INTO`, a `BAPIRET2` table from a BAPI, an exception
object from a `CATCH`: the framework reads the text, the type and the details
from each of them.

```abap
    MESSAGE ID `NET` TYPE `I` NUMBER `001` INTO DATA(dummy).
    client->message_box_display( sy ).

    client->message_box_display( t_bapiret ).

    TRY.
        DATA(x) = 1 / 0.
      CATCH cx_root INTO DATA(lx).
        client->message_box_display( lx ).
    ENDTRY.
```

So the message class, the T100 text and the translation tools work as before.
A text element or a message class is still how a string gets translated,
because the app is an ABAP class and has no i18n file beside it. Translators
keep their transaction, and nobody exports a properties file.

## An Exception Nobody Catches

This part is different. The framework catches exceptions in one place only:
the HTTP handler. An exception that leaves `main( )` ends up there. The
roundtrip ends with HTTP 500, the database changes of that roundtrip are
rolled back, and the browser shows an *Application Error, please restart*
message with the exception chain behind a *Details* button.

The user cannot continue, because the roundtrip that failed is the one that
would have saved the app's next state. The user restarts from the app's first
screen. If the app keeps its draft id in the URL
([app state](https://abap2ui5.github.io/docs/cookbook/event_navigation/navigation/app_state)),
a reload brings the user back to where they were before the click that
failed.

That is the last resort, and it costs the user the screen. Catch anything
predictable where it happens — a failed conversion, a locked object, a service
that does not answer — and show it as a message box. That costs the user one
click instead of a restart.

## One Setting for Production

Set this in every production system, before a penetration test finds it. The
body of the 500 response contains source positions, RTTI names and system
context: everything a developer wants and more than a browser should get.
`check_hide_error_details`, set in the exit class
([User Exits](https://abap2ui5.github.io/docs/advanced/extensibility/user_exits)),
reduces the body to *Internal Server Error* and changes nothing else.

**In short:** classic messages, `BAPIRET2` and exception objects go straight
into a toast or a message box; catch what you can predict, and hide the error
details in production.
