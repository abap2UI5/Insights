---
title: "A Tile Like Any Other: The Fiori Launchpad"
number: 29
part: day
blurb: "into the Fiori Launchpad"
description: "An abap2UI5 app in the Fiori Launchpad - the one shell BSP installed system-wide, the target mapping per app, what the app can read inside, and the blank tile after an import."
---

An app that is reached by pasting a URL is a demo. It becomes an application
when it has a tile. In the Fiori launchpad an abap2UI5 app looks like the RAP
and freestyle tiles beside it: same launchpad shell, same theme, same back
button.

**What is installed once.** The launchpad loads a UI5 app from the system's UI5
repository, so the abap2UI5 frontend — the one generic UI5 app that renders
every abap2UI5 app ([#8](/insights/08-the-frontend-knows-nothing/)) — has to
exist there as a UI5 app. The `standard` branch of the
[frontend repository](https://github.com/abap2UI5/frontend) ships it through
abapGit, as app `z2ui5`; which branch fits which installation is in
[#41](/insights/41-upgrading-the-framework/). That is one deployment for the
whole system: every abap2UI5 tile you create points at the same frontend app.

**What is configured per app.** A target mapping, with the app class as the
parameter:

| | |
|---|---|
| Semantic Object | `Z2UI5_CL_MY_APP` |
| Action | `display` |
| URL | `/sap/bc/ui5_ui5/sap/z2ui5` |
| Parameter | `app_start` / `Z2UI5_CL_MY_APP` |

A tile, a catalog, a role — the Fiori administration the system already does,
with nothing abap2UI5-specific in it except that last parameter.

**What the app can do inside.** It knows where it is:

```abap
    IF client->get( )-check_launchpad_active = abap_true.
      client->follow_up_action( val   = client->cs_event-set_title_launchpad
                                t_arg = VALUE #( ( `Job Monitor` ) ) ).
    ENDIF.
```

Startup parameters from the target mapping arrive in
`client->get( )-t_comp_params`, and navigation to another *Fiori* app goes
through the launchpad's own cross-app navigation, so the launchpad's back
button keeps working.

**What to do when the tile is blank.** It happens once, after an abapGit
import, and the cause is the UI5 app index, not the app. Run
`/UI5/APP_INDEX_CALCULATE`, clear the HTTP cache in `SMICM`, and reload the
page without the browser cache.
The [launchpad page](https://abap2ui5.github.io/docs/configuration/launchpad) walks through it with
screenshots.

On Public Cloud the launchpad is SAP Build Work Zone, and the setup is different:
the [ABAP Cloud pages](https://abap2ui5.github.io/docs/configuration/btp) describe it.

**In short:** install the frontend app once, add one target mapping per app,
and the app is a tile like any other.
