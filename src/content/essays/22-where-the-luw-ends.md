---
title: "Where the LUW Ends"
number: 22
part: day
blurb: "a rollback around main( ), and the commit that is yours"
description: "Every roundtrip is one LUW. The framework rolls back before and after main( ) and commits only its own draft - so an UPDATE without the app's own COMMIT WORK is undone, unlike in a dialog step."
---

*Read first: [#7](/insights/07-one-click-one-request/) for the roundtrip, [#11](/insights/11-a-new-instance-on-every-request/) for the draft.*

A dynpro developer carries a model of the LUW around without thinking about
it. Every dialog step ends with an implicit database commit, so an `UPDATE` in
a PAI module is on the database by the next screen. What was registered `IN
UPDATE TASK` waits for `COMMIT WORK`. A `MESSAGE TYPE 'E'` or a short dump rolls
back what the step had done.

In abap2UI5 the roundtrip is the dialog step ([#7](/insights/07-one-click-one-request/)),
so the first guess is that the model carries over unchanged. It does, with one
difference: **nothing the app writes is committed unless the app commits it.**
This is the difference that costs an afternoon.

Here is what happens around `main( )` on every roundtrip, in this order:

1. `ROLLBACK WORK` — the app starts with an empty LUW.
2. `main( )` runs.
3. `ROLLBACK WORK` — whatever the app left uncommitted is undone.
4. The framework writes its draft row to `z2ui5_t_01` and runs `COMMIT WORK AND WAIT`.

The draft is the framework's saved copy of the app instance
([#11](/insights/11-a-new-instance-on-every-request/)). It is not a RAP draft.

![The framework's commit carries its own draft and nothing of the app's.](/insights/22-luw.svg)

*The framework's commit carries its own draft and nothing of the app's.*

The third step is the deliberate one. Without it, the framework's commit in the
fourth step — or the implicit commit at the end of the HTTP request — would
carry along whatever the app happened to leave open. An `UPDATE` would then
land or not, depending on whether the code after it raised, returned early or
forgot the commit. So the rule is simple enough to keep in your head:
**if it was not committed in `main( )`, it did not happen.**

```abap
  METHOD on_save.

    UPDATE zorder SET status = @status WHERE id = @order_id.

    " without this line the UPDATE is rolled back when main( ) returns
    COMMIT WORK.
    client->message_toast_display( `Saved` ).

  ENDMETHOD.
```

The same holds for every other way of writing, each with the commit it has
always needed. `CALL FUNCTION ... IN UPDATE TASK` registers and
`COMMIT WORK` runs the update. A BAPI writes and `BAPI_TRANSACTION_COMMIT`
commits, as in [#3](/insights/03-one-class-no-programming-model/). EML
(the ABAP statements that call a RAP business object) modifies and
`COMMIT ENTITIES` saves. An abap2UI5 app is a consumer outside a RAP
transaction, so the business object's save sequence starts on the app's
command ([#36](/insights/36-rap-or-abap2ui5/)).

**A failed roundtrip is rolled back too.** An exception that leaves `main( )` is caught once, in the framework's handler, and the LUW is rolled back before the HTTP 500 goes out. That is the same outcome a short dump had. The overlay the user sees is the one from [#21](/insights/21-message-still-works/). That
rollback matters: the end of the HTTP request commits implicitly, and without
it a write made just before the raise would land after all.

**Every roundtrip is its own LUW.** Nothing written in one click is still open in the next. Take a change that spans two screens, a header on the first and items on the second. It is either collected in attributes and written in one go, or written per screen with a status that says it is not finished. That is the
same decision a stateless web application makes everywhere, and the same one
[#23](/insights/23-the-lock-is-gone-by-the-next-click/) makes for locks.

**A stateful app keeps its LUW.** After `client->set_session_stateful( )` the
framework stops rolling back around `main( )`, so the LUW stays open across
clicks. The draft is still written and committed when the app navigates, so
uncommitted work is committed at the next `nav_app_call( )` at the latest. The
stateful session is the exception, and
[#40](/insights/40-how-many-users/) says what it costs.

![Stateless: three roundtrips with nothing but a draft row between them. Stateful: the same three roundtrips inside one session that stays with the user.](/insights/22-stateless-stateful.svg)

*What is on the server between two clicks, in both modes.*

The examples with every write path are on
[ABAP SQL](https://abap2ui5.github.io/docs/cookbook/eml_cds_sql/abap_sql) and
[EML](https://abap2ui5.github.io/docs/cookbook/eml_cds_sql/eml).

**In short:** PAI wrote, the dialog step committed. Here the app writes, and the app commits.
