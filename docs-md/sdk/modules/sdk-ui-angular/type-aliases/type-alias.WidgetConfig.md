---
title: WidgetConfig
---

# Type alias WidgetConfig

> **WidgetConfig**: `object`

Configuration of the widget.

## Type declaration

### `actions`

**actions**?: `object`

Configuration for actions available on the widget, such as
downloading the widget's data.

> #### `actions.downloadCsv`
>
> **downloadCsv**?: `object`
>
> Configuration for the "Download as CSV" action, which adds an item to the
> widget's header menu that exports the widget's underlying data as a CSV file.
>
> ##### Example
>
> Enable CSV download for a widget:
> ```ts
> const widgetConfig: WidgetConfig = {
> actions: {
> downloadCsv: {
> enabled: true,
> },
> },
> };
> ```
>
> > ##### `downloadCsv.enabled`
> >
> > **enabled**?: `boolean`
> >
> > Whether the "Download as CSV" action is enabled for the widget.
> >
> > ###### Default
> >
> > ```ts
> > false
> > ```
> >
> >
>
>

***

### `narrative`

**narrative**?: [`WidgetNarrativeConfig`](type-alias.WidgetNarrativeConfig.md)

Configuration for widget narrative.
