---
title: "UI5 Over-the-Wire: The Server Sends the View"
number: 6
part: how
blurb: "every request answered with two strings"
description: "The one idea under abap2UI5: the backend answers every request with two strings, a UI5 XML view and its JSON model, and the browser renders them - UI5 Over-the-Wire."
---

A UI5 freestyle app is a single-page application. The view is deployed with the
app in the frontend, the backend delivers data through OData, and the browser
puts the two together and renders the HTML. Everybody knows this split; most
SAP frontends alive today are built on it.

But there is a detail inside it that is easy to miss. UI5 does not render
from JavaScript objects assembled by hand — it renders from an **XML view**,
bound to its data. The view is a document. And documents, unlike compiled
applications, can travel.

So: what if the backend sent the view as well?

That is the whole idea of the framework, and everything else in this series
follows from it. abap2UI5 answers every request with two strings. An XML view:

```xml
<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc">
  <Page title="abap2UI5 - Hello World">
    <Input value="{/NAME}"/>
    <Button press=".eB(['BUTTON_POST'])" text="post"/>
  </Page>
</mvc:View>
```

and the model that fills it:

```json
{ "MODEL": { "NAME": "test" } }
```

![The browser sends an event, the backend answers with a view and its model, the browser renders both.](/insights/06-two-strings.svg)

*The browser sends an event, the backend answers with a view and its model, the browser renders both.*

Two details of the example: `MODEL` is only the key of the envelope. Its
content becomes the JSON model, which is why the view binds `{/NAME}` and not
`{/MODEL/NAME}`. And `.eB( … )` is the one event function of the frontend: it
sends the event name, here `BUTTON_POST`, to the backend.

abap2UI5 invented no protocol for this. The XML is UI5's own view format, the
JSON is an ordinary UI5 JSON model, and the frontend does what it has always
done: build HTML from a view and its data. What changes is who owns the view.
It used to be an artifact deployed beside the app. Now it is a string an ABAP
class produced for this request, and the next request may produce a different
one.

Outside SAP the pattern is called **HTML Over-the-Wire**: the server renders,
the browser inserts the result, and no JSON API sits in between. htmx, Hotwire, Phoenix LiveView, Livewire and
Unpoly are built on it. The arguments for it sound much like an ABAP developer
describing a dialog step.

The page is still not reloaded on every click, which is the first objection
people raise. ITS Mobile and SAP GUI for HTML answered every interaction with
a whole document. Over-the-Wire replaces parts and keeps the page. UI5 cannot
take HTML from the server, because it renders in the browser by design, so
what travels is the layer directly above: a view, not a page.

**In short:** the backend sends the view together with the data, and the
frontend only renders what it receives.
