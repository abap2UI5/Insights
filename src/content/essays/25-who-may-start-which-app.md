---
title: "Who May Start Which App"
number: 25
part: day
blurb: "one ICF node, authorization, CSRF, the CSP"
description: "One ICF node serves every app and the URL names the class - where authentication, authorization, the CSRF check and the Content Security Policy each sit."
---

One ICF node serves every abap2UI5 app in the system, and the URL names the
class: `?app_start=zcl_sample_job_monitor`. A Basis colleague asks the right
question at once: so anybody who can reach the node can start any class?

Yes, unless the app checks. Access is decided in two familiar places, and the
framework adds the protection a web application needs.

## Who Decides What

| Layer | Decides | Where |
|---|---|---|
| ICF node | who can log on and reach abap2UI5 at all | `SICF`, as for any service |
| App class | who may use this app and see its data | `AUTHORITY-CHECK` in `main( )` |
| Framework | that a request is genuine and the page loads only what it should | CSRF check and CSP, on by default |

**Authentication is the ICF node's.** Logon procedure, SSO, certificate,
visibility — the node is configured like the node of any other UI5 app, and
abap2UI5 adds nothing to it and takes nothing away.

**Authorization is the app's, the way a report checks before it selects.** An
app is one class, `main( )` is its entry, and the branch that shows the first
view is where an ordinary `AUTHORITY-CHECK` goes — before anything is selected
and before anything is displayed. When it fails, the user gets a message
instead of a view. `check_on_navigated( )` is also true on the very first call
([#7](/insights/07-one-click-one-request/)), so this one branch covers the start
of the app and every return to it:

```abap
  METHOD z2ui5_if_app~main.

    IF client->check_on_navigated( ).

      AUTHORITY-CHECK OBJECT 'Z_APP_AUTH'
                      ID 'APP' FIELD 'ZCL_SAMPLE_JOB_MONITOR'.
      IF sy-subrc <> 0.
        client->message_box_display( text  = `You are not authorized to use this app.`
                                     type  = `error`
                                     title = `Not authorized` ).
        RETURN.
      ENDIF.

      " build and display the view as usual

    ENDIF.

  ENDMETHOD.
```

One authorization object with one field, the app class as the value, roles as
usual in PFCG. Nothing here is new, and that is the point. The check sits in
the class it protects, so a transport carries the app and its guard together,
and nothing on the node has to know which classes exist.

It also holds on the way into an app that the URL never names. A `nav_app_call( )` from another app arrives as an ordinary roundtrip with no `app_start` on it, and the check in `main( )` is the one that runs for it. A
guard on the node alone would miss that call. The complete example,
with the refusal branch and what it should say, is on
[Authorization](https://abap2ui5.github.io/docs/configuration/authorization).

## What the Framework Adds

The framework brings the part a web application needs and a report never did:

- **A CSRF check on every POST, on by default.** CSRF (cross-site request
  forgery) is another website sending a request in the name of a logged-on
  user; the check refuses a POST that does not come from the app's own page.
- **A Content Security Policy (CSP) on the first page, strict by default.** A
  CSP tells the browser which scripts and sources a page may load. The default
  allows no `'unsafe-eval'` and no `'unsafe-inline'` for scripts. An
  installation on UI5 1.71 to 1.82 may have to loosen it in the exit class
  (`z2ui5_if_ui5_exit`) for a popup that names a module it has not loaded
  ([Security](https://abap2ui5.github.io/docs/configuration/security#older-releases-switching-unsafe-eval-on)).
- **Error details can be switched off for production**, as
  [#21](/insights/21-message-still-works/) described.
- **The business logic never leaves the server.** The browser gets a view and
  the data bound to it. There is no client-side rule to read out of a bundle,
  because there is no bundle.

**In short:** the node decides who gets in, the app decides who may use it,
and the framework protects the request and the page.

What the browser can send the other way — the class name, a draft id, the
event name, every bound value — and what the framework checks on each is
[#38](/insights/38-what-the-client-can-send/).
