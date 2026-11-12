---
title: "Upgrading the Framework"
number: 41
part: running
blurb: "release tags, the stable contract, the frozen package, pull, pin, roll back"
description: "How abap2UI5 is versioned and upgraded - release tags, what is a stable contract (the public package), what the frozen package means, the deprecations page, pulling a tag with abapGit, the frontend branches, pinning, rolling back, what to re-test."
---

Every installation runs one version of abap2UI5, and sooner or later pulls the
next one. This essay says what a version is, what it promises, and how to
upgrade and roll back.

## What a Version Promises

**What a release is.** A release is a git tag on the framework repository,
`X.Y.Z` on `main` and `X.Y.Z-702` on the generated downport branch
([#31](/insights/31-one-codebase-702-to-abap-cloud/)). `main` moves
with every merge; a tag does not. The [release notes](https://abap2ui5.github.io/docs/resources/changelog)
list every tag with its date. The version an installation runs is the
constant `z2ui5_if_app=>version`.

**What is stable.** The public API is the package `src/02`:
`z2ui5_if_app`, `z2ui5_if_client`, `z2ui5_if_ui5_exit`,
`z2ui5_if_ui5_monitor`, `z2ui5_cl_ui5_http_handler`,
`z2ui5_cl_ui5_view_builder` and the interface for language models. An app that
uses only those compiles on the next release, or finds its change on the
deprecations page. The framework records every name in this package and
checks every change against that record. Everything else — `src/00` and
`src/01`, the handler's internals, the draft service, the generated frontend
classes — is internal and may change between two tags without notice. The
[linter](https://abap2ui5.github.io/docs/advanced/linter) reports an app that
uses anything outside the public package as `non-released-api`. That is the
cheapest way to find such a use before an upgrade does.

**What frozen means.** The package `src/99` holds what the framework
replaced and still ships: the predecessor view builder, the old handler
shim, the superseded exit and types interfaces, the retired utility classes,
the built-in popups. Nothing in the framework calls them, an automated check
refuses any change to them, and an app that still uses one keeps compiling
release after release. Frozen is not the same as stable: frozen code is not
changed, and it is not fixed either.
Every object in it is named, with its successor, on
[Deprecations](https://abap2ui5.github.io/docs/resources/deprecations) — the one page that names them.

**The deprecations page is the upgrade plan.** Its version-status table
names what has a successor, what the successor is, and the release that made
the change. Entries marked *next release* are already on `main` but not yet in
a tag. They tell an installation on the newest tag what the next pull brings. `npx @abap2ui5/linter src --fix` rewrites the mechanical part of the
table over an app package and reports the rest.

## How to Upgrade

The framework is an abapGit repository, so an upgrade is a pull of the next
tag:

1. Read the [release notes](https://abap2ui5.github.io/docs/resources/changelog)
   and the deprecations page for the releases between your tag and the new
   one.
2. Run the linter over your app packages and fix what it reports.
3. In abapGit, switch the framework repository to the new tag and pull. The
   pull activates the changed objects.
4. If the frontend is installed as a UI5 app for the launchpad, pull its
   repository too (see the table below).
5. Pull the add-ons you use. Each is a repository of its own with tags of its
   own.
6. Re-test (see *What to Re-Test* below).

An installation that is started through its ICF node needs nothing besides
step 3 for the frontend: the frontend is embedded in the backend classes
([#16](/insights/16-no-build-no-deploy-no-cache/)), so the same pull brings
the new page and the new modules.

A launchpad installation has one more repository, the frontend as a UI5 app
from [abap2UI5/frontend](https://github.com/abap2UI5/frontend)
([#29](/insights/29-a-tile-like-any-other/)). What to do depends on its
branch:

| Branch of the frontend repository | What it contains | On an upgrade |
|---|---|---|
| `standard` | the frontend itself | pull it together with the framework |
| `standard_v2` | the frontend for UI5 2.x (the "legacy-free" build of UI5) | pull it together with the framework |
| `standard_new` | only a container that loads the frontend from the backend | nothing: the framework pull is enough |

On S/4HANA Public Cloud and the BTP ABAP Environment the branches are called
`cloud`, `cloud_v2` and `cloud_new`, with the same meaning
([Fiori Launchpad](https://abap2ui5.github.io/docs/configuration/launchpad)).

## Pinning and Rolling Back

**Pinning.** A productive system installs a tag, not `main`
([Productive Usage](https://abap2ui5.github.io/docs/configuration/productive_usage)).
`main` may carry an API that no release has, and two pulls of `main` on two
days give two different frameworks.
The release number in the manual's version dropdown and on the deprecations
page is the one the manual is written against.

**Rolling back.** The previous tag is still there, and a pull of it is the
same operation as the upgrade. There is no data to migrate in either
direction. The framework writes one table, `z2ui5_t_01`, and its rows are
drafts — saved app instances, not RAP drafts — that expire within hours
([#40](/insights/40-how-many-users/)). A user whose draft was written by the
other version restarts the app. One limit: an app that already uses an API
the previous tag lacks does not compile on it. The deprecations table says
which release brought what.

## What to Re-Test

These are the things a tag can change for an installed app, in the order in
which they usually fail:

- the **exit class**: `z2ui5_if_ui5_exit` is public API, but a field of its
  configuration structures may get a new default, or a new field beside it.
  Compare your exit's methods with the changelog, the Content Security Policy
  (CSP) in particular
  ([Security](https://abap2ui5.github.io/docs/configuration/security));
- the **app classes** against the deprecations table, with the linter over
  the package;
- **custom controls** in `z2ui5_ccc` and the popups and other add-ons, each
  against its own release;
- the **launchpad tile**: after the frontend UI5 app changes, the UI5 app index
  (`/UI5/APP_INDEX_CALCULATE`) and the HTTP cache in `SMICM`;
- one **roundtrip per app** in a browser, the one check that needs a system.

**In short:** install a tag, read the deprecations page before the next one,
pull, and re-test the exit class first.
