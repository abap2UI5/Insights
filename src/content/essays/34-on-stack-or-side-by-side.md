---
title: "On-Stack or Side-by-Side"
number: 34
part: where
blurb: "two places to run, one class"
description: "Two places to run the same app class - inside the SAP system, or on the BTP ABAP Environment against released remote APIs - and the lifecycle each one inherits."
---

There are two places to run an abap2UI5 app: inside the SAP system (on-stack)
or on a separate system beside it (side-by-side). The class is the same class
either way. The choice is about lifecycles, not about code.

| | On-stack | Side-by-side |
|---|---|---|
| Where the app runs | inside the S/4 system | on the SAP BTP ABAP Environment |
| How it reads data | directly, with a local call | remotely: released OData, RFC or SOAP services |
| Systems to operate | one | two |
| Release and upgrade cycle | that of the S/4 system | its own |
| Deployment | the transport you already use | on the BTP system, independent of S/4 |

- **Choose on-stack** when the app needs direct, fast access to the data and
  the S/4 system's release cycle is not a problem. This is the usual case.
- **Choose side-by-side** when the S/4 system's change windows are the
  constraint, or when the core is to stay free of custom UI.

**On-stack** means the app runs inside the SAP system. It reads the data
directly, there is no remote call and no second system to operate, and
deployment is the transport you already use. Built on released APIs it runs
unchanged on S/4HANA Public Cloud, Private Cloud and on-premise. What it
inherits is that system's lifecycle: its release, its upgrade window, its
maintenance slots, its change freeze in December.

![abap2UI5 and the apps run inside S/4HANA and use released APIs only](/insights/use_cases/on_stack_level_a.svg)

*On-stack: the framework and the apps run inside the S/4 system.*

**Side-by-side** means the app runs on the SAP BTP ABAP Environment and calls
the S/4 system remotely — released OData, RFC or SOAP services. Everything on
the BTP side is clean core Level A by construction (the levels are in
[#33](/insights/33-when-the-api-is-not-released/)), and it works
against every S/4 edition, S/4HANA Public Cloud included.

![The apps run on the SAP BTP ABAP Environment and call released remote APIs of S/4HANA](/insights/use_cases/side_by_side_level_a.svg)

*Side-by-side: the apps run on BTP and call the S/4 system remotely.*

The separation is the benefit. A side-by-side app is released, upgraded and
restarted on its own schedule, and the S/4 system does not have to agree.
Where a release cycle is the actual constraint — a locked system, a long
change window, a team that cannot get a transport through this quarter — that
is worth more than the direct access on-stack gives.

It has three costs. A remote call is slower than a local read. The released
remote APIs offer less than a local `SELECT` can reach. And there is a second
system to run, monitor and pay for. When the released remote APIs do not cover the case, a service on the S/4
side closes the gap and is graded on its own — the BTP side stays Level A:

![The apps on SAP BTP stay Level A and call a service on S/4HANA that wraps classic APIs in Standard ABAP](/insights/use_cases/side_by_side_custom_service.svg)

*A custom service on the S/4 side covers what the released APIs do not.*

**In short:** neither choice touches the app class. The same code renders in
both places; only how it reads the data changes.
