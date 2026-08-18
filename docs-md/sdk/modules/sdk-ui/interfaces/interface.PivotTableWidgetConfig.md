---
title: PivotTableWidgetConfig
---

# Interface PivotTableWidgetConfig

Configuration of a pivot table widget.

## Properties

### actions

> **actions**?: `object`

Configuration for actions available on the widget.

#### Type declaration

> ##### `actions.downloadCsv`
>
> **downloadCsv**?: `object`
>
> Configuration for the "Download as CSV" action, which adds an item to the
> widget's header menu that exports the widget's underlying data as a CSV file.
>
> ###### Example
>
> Enable CSV download for a widget:
> ```ts
> const widgetConfig: ChartWidgetConfig = {
> actions: {
> downloadCsv: {
> enabled: true,
> },
> },
> };
> ```
>
> > ###### `downloadCsv.enabled`
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
> ##### `actions.downloadExcel`
>
> **downloadExcel**?: `object`
>
> Configuration for the "Download as Excel" action, which adds an item to the
> widget's header menu that exports the widget's underlying data as an Excel (XLSX) file.
>
> ###### Example
>
> Enable Excel download for a widget:
> ```ts
> const widgetConfig: ChartWidgetConfig = {
> actions: {
> downloadExcel: {
> enabled: true,
> },
> },
> };
> ```
>
> > ###### `downloadExcel.enabled`
> >
> > **enabled**?: `boolean`
> >
> > Whether the "Download as Excel" action is enabled for the widget.
> >
> > Note: the widget's `id` is required for Excel export to work, as it is
> > used to build the export request. Without it, the export fails.
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

### header

> **header**?: [`WidgetHeaderConfig`](interface.WidgetHeaderConfig.md)

Configuration for the widget header, such as the items available in its menu.

***

### narrative

> **narrative**?: [`WidgetNarrativeConfig`](../type-aliases/type-alias.WidgetNarrativeConfig.md)

Configuration for widget narrative.
