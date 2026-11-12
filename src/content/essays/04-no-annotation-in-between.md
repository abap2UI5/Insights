---
title: "Every UI5 Control, No Annotation in Between"
number: 4
part: rests
blurb: "the vocabulary is the UI5 control library, all of it"
description: "Why the vocabulary of an abap2UI5 view is the UI5 control library itself - every control, at the UI5 version the bootstrap names - shown with a sap.m.Wizard."
---

In a metadata-driven UI such as Fiori Elements, a screen is described rather
than written. The description has a vocabulary — the UI annotations: line
items, selection fields, facets, identification — and a generator turns it
into UI5 at runtime. Whatever the vocabulary covers is built in an afternoon,
and that is impressive. Whatever it does not cover becomes an extension point,
a custom control, or a discussion about whether the screen really needs it.

Every ABAP developer who has built a Fiori Elements app knows the moment: the
requirement is small, the vocabulary has no word for it, and the estimate
triples.

abap2UI5 has no vocabulary of its own. What it sends to the browser is a UI5
XML view, so the vocabulary is the UI5 control library itself: every control,
at the UI5 version the
[bootstrap](https://abap2ui5.github.io/docs/configuration/setup/ui5_bootstrapping)
names. That version is a configuration decision of the installation, not a
property of the SAP release
([#31](/insights/31-one-codebase-702-to-abap-cloud/)).

Which is why a control nobody generates is not a special case. Take a
three-step wizard, a control that is right there in `sap.m` and almost never
turns up in a generated app:

```abap
CLASS zcl_sample_onboarding DEFINITION PUBLIC.

  PUBLIC SECTION.
    INTERFACES z2ui5_if_app.

    DATA name  TYPE string.
    DATA email TYPE string.
    DATA plant TYPE string.

  PROTECTED SECTION.
    DATA client TYPE REF TO z2ui5_if_client.
    METHODS view_display.

  PRIVATE SECTION.
ENDCLASS.


CLASS zcl_sample_onboarding IMPLEMENTATION.

  METHOD z2ui5_if_app~main.

    me->client = client.

    IF client->check_on_navigated( ).
      view_display( ).
    ELSEIF client->check_on_event( `COMPLETE` ).
      client->message_toast_display( |{ name } assigned to { plant }| ).
    ENDIF.

  ENDMETHOD.

  METHOD view_display.

    DATA(view) = z2ui5_cl_ui5_view_builder=>factory(
        )->ele( n = `View` ns = `mvc`
            )->a( n = `xmlns`     v = `sap.m`
            )->a( n = `xmlns:mvc` v = `sap.ui.core.mvc`

            )->ele( `Page`
                )->a( n = `title` v = `Onboarding`

                )->ele( `Wizard`
                    )->a( n = `finishButtonText` v = `Create`
                    )->a( n = `complete`         v = client->_event( `COMPLETE` )

                    )->ele( `steps`
                        )->ele( `WizardStep`
                            )->a( n = `title` v = `Person`

                            )->tag( `Input`
                                )->a( n = `value`       v = client->_bind( name )
                                )->a( n = `placeholder` v = `Full name`

                        )->end(
                        )->ele( `WizardStep`
                            )->a( n = `title` v = `Contact`

                            )->tag( `Input`
                                )->a( n = `value` v = client->_bind( email )
                                )->a( n = `type`  v = `Email`

                        )->end(
                        )->ele( `WizardStep`
                            )->a( n = `title` v = `Assignment`

                            )->tag( `Input`
                                )->a( n = `value`       v = client->_bind( plant )
                                )->a( n = `placeholder` v = `Plant` ).

    client->view_display( view->stringify( ) ).

  ENDMETHOD.

ENDCLASS.
```

Every name in that chain is a UI5 name. `Wizard`, `steps`, `WizardStep`,
`finishButtonText`, `complete` — not one of them is invented by abap2UI5, and
not one is translated on the way. The chain builds XML, the browser gets that
XML, and the reference for the view is the UI5 SDK. There is no second place to
look and no mapping to learn, which also means the SDK's own sample page is a
usable spec for your ABAP class.

Two things follow from that.

First, anything the SDK documents is reachable the day the frontend serves it. A
control added in a newer UI5 release needs no framework release behind it,
because nothing inside abap2UI5 enumerates controls. Nobody has to wait for a
wrapper, and nobody has to write one.

Second, what a developer learns while building these screens is UI5. A
freestyle app needs the same knowledge, and so does an extension to a
generated app. It stays useful whichever ABAP-side framework it was learned
through.

There is a price, and it is not small: nothing writes the layout for you. A
list report that a few annotations would have described is here a table built
control by control. [#36](/insights/36-rap-or-abap2ui5/) (later in the series)
is about when the generated list report is the better choice.

**In short:** an abap2UI5 view is plain UI5 XML, so every UI5 control is
available without a wrapper, and the layout is yours to write.
