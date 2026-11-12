---
title: "One App, Many Systems"
number: 35
part: where
blurb: "several S/4 systems behind one app, and the boundary the app draws"
description: "One side-by-side abap2UI5 app on the BTP ABAP Environment serving several S/4 systems - what makes it possible, and the tenant boundary the app has to enforce itself."
---

A side-by-side app ([#34](/insights/34-on-stack-or-side-by-side/))
already runs outside the system it serves. How many systems can it serve?

More than one. The app lives on the SAP BTP ABAP Environment and reaches each
S/4 system through its released APIs, so the connection is configuration rather
than code.

![One abap2UI5 app on the SAP BTP ABAP Environment serves several S/4HANA systems through their released APIs](/insights/use_cases/saas.svg)

*One installation on BTP, several S/4 systems behind it.*

Nothing was added to make this possible. It follows from three things the
earlier essays established:

- The frontend renders whatever arrives
  ([#8](/insights/08-the-frontend-knows-nothing/)), so it does not matter
  which system produced it.
- The app is one class with no artifacts beside it, so there is nothing to
  deploy per system.
- The state between two clicks is the draft — the framework's saved app
  instance, not a RAP draft
  ([#11](/insights/11-a-new-instance-on-every-request/)) — and the request
  names it by its id. So no server holds a session that belongs to one system.

There are two limits. The released APIs of every system have to be reachable,
and every read now includes network latency.

## The boundary the framework does not draw

One app now sees several systems, and nothing in abap2UI5 knows that. The
framework separates by **user** only:

- The draft row carries `sy-uname` and is read back only for that user.
- The instance is created fresh per request
  ([#11](/insights/11-a-new-instance-on-every-request/)).
- The draft table is client-dependent like any other. So `sy-mandt` separates
  the clients of the BTP system, but not the S/4 systems behind it.

Which S/4 system a request is about is therefore a value the app holds. It is
an attribute of the instance, set when the user chose the system or when the
launchpad parameter named it (`client->get( )-t_comp_params`, which is
[user input](https://abap2ui5.github.io/docs/configuration/authorization#startup-parameters-are-user-input)).
That attribute behaves like every other one. It is serialized with the instance, and it travels to the browser if it is bound. `nav_app_call( )` passes it on only if the caller puts it into the sub-app it constructs.

So the check belongs where the remote call is made. Every read and every write
names the system key from the instance, and the app verifies first that *this*
user may address *that* system. The ABAP authorization concept cannot do this
for the app, because it does not know that the systems exist.

**In short:** one installation can serve many systems, and the app itself must
check which user may reach which system.
