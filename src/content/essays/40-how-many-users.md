---
title: "How Many Users: Sizing an Installation"
number: 40
part: running
blurb: "work processes, draft rows, no server affinity, what the monitor measures"
description: "Sizing an abap2UI5 installation - one dialog work process per roundtrip, what a draft row holds, how z2ui5_t_01 grows and cleans itself, no server affinity, what a stateful session changes, what the roundtrip monitor measures."
---

*Read first: [#7](/insights/07-one-click-one-request/) for the roundtrip, [#11](/insights/11-a-new-instance-on-every-request/) for the draft.*

How many users can an abap2UI5 installation carry? The answer is a formula
with the installation's own numbers in it. This essay is that formula, for the
architect or Basis administrator who sizes the system.

Two things are sized: dialog work processes and one database table. The draft
in this essay is the framework's saved copy of the app instance, not a RAP
draft.

## Work Processes

**One roundtrip, one dialog work process.** A click is one POST
([#7](/insights/07-one-click-one-request/)). A free dialog work
process picks it up, reads the draft, runs `main( )`, builds the response,
writes the new draft and is released. Nothing is held between two clicks. So
the number of work processes an installation needs depends on *concurrent
roundtrips*, not on logged-on users. A hundred users who click every thirty
seconds and whose roundtrips take 300 ms occupy one work process on average.
The number that matters is the duration of a roundtrip, and the monitor below
measures it.

## The Draft Table

**One draft row per roundtrip.** After each request the framework serializes
the app instance into one row of `z2ui5_t_01`
([#11](/insights/11-a-new-instance-on-every-request/)). The row holds the
whole instance as one string column: every attribute, public or not, bound or
not. A roundtrip writes a new row with a new id and leaves the old one, so the
table holds one row per click until the rows expire. The size of a row is the
size of the instance. This is why a catalog kept in an attribute is read from
and written to the draft table on every click
([#26](/insights/26-100-rows-four-hours-one-request/)).

The model that travels to the browser is a different, smaller thing: only the
public attributes the view binds. An attribute in the protected section is in
the draft and not in the model; a bound one is in both
([Performance](https://abap2ui5.github.io/docs/configuration/performance)).

**How the table grows.** Rows expire after `draft_exp_time_in_hours`, four
hours by default, and the framework deletes the expired rows on every first
start of an app — one `DELETE` on the table's timestamp and a `COMMIT WORK`,
whichever user starts whichever app. So the table never holds more than the
last four hours of clicks:

```text
rows   ≈ users × clicks per user per hour × 4 h
bytes  ≈ rows × size of a serialized instance
```

Two hundred users at sixty clicks an hour are 48,000 rows, and at 20 kB per
instance a gigabyte. The same users with instances of 2 kB are a tenth of
that. The table has no secondary index, deliberately: every click would pay
for the index on every write, so the cleanup and the counts scan the table
instead. That is one more reason to keep the instance small. A lower expiry in
the exit class (`z2ui5_if_ui5_exit`) makes the table smaller; the price is that a user who returns
after a long break starts fresh.

## Several Application Servers

**No server affinity.** The draft is in the database, the id is in the browser,
and nothing is in a work process between two clicks. Any application server
can answer any roundtrip. So a load balancer needs no sticky sessions, a
rolling restart interrupts nobody, and the capacity is the sum of the servers.

## The Exception: Stateful Sessions

**What a stateful session changes.** `client->set_session_stateful( )` keeps
one work process for this user for the rest of the app, so that a classic
enqueue or an open RFC connection survives between clicks
([#23](/insights/23-the-lock-is-gone-by-the-next-click/)). It is the right
tool for a one-to-one migration of a dialog flow, and for a resource that is
expensive to rebuild on every request.

From that call on the formula is the one of SAP GUI: one work process per
*active user*. It is held while the user thinks, and released only when the
app switches back with `set_session_stateful( abap_false )` or the session
times out, so the app has to release it on every exit path. A few dozen idle
stateful sessions can block a system that has only a few dialog work
processes. Stateful mode is therefore for a few internal, low-traffic apps,
and it is not available on public cloud
([Statefulness](https://abap2ui5.github.io/docs/cookbook/expert_more/statefulness)).

The draft is still written on every `nav_app_call( )` and `nav_app_leave( )`
and when the URL carries the app, so the table formula above still applies.

## What Travels to the Browser

**The size limit of a binding.** A UI5 JSON model exposes at most 100 rows of
a bound table unless the app raises the limit with `cs_event-set_size_limit`
([#26](/insights/26-100-rows-four-hours-one-request/)). Rows beyond
the limit are still in the model, in the draft and in the response. The limit
decides what is shown, not what is sent.

## Measure, Do Not Estimate

From 1.147.0 the framework calls `z2ui5_if_ui5_monitor` after every roundtrip,
once an installation implements it and switches it on in the exit class
([Monitoring](https://abap2ui5.github.io/docs/configuration/monitoring)). Per
roundtrip it reports:

- the app, the event and the user;
- three durations: reading the request and the draft, the app's `main( )`,
  and building the response and saving the draft;
- the sizes of the request, the response and the model, in characters;
- how long the previous roundtrip took, as the browser measured it.

These are the terms of the formulas above, measured on the installation: the
roundtrip duration for the number of work processes, the model size for what
the browser carries, the draft phase for what the table costs. The Admin
Cockpit add-on turns them into p95 times per app (the time that 95 percent of
the roundtrips stay under).

**In short:** work processes follow concurrent roundtrips, the draft table
follows clicks per four hours times instance size, and the monitor gives you
both numbers.
