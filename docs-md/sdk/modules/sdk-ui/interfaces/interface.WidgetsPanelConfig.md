---
title: WidgetsPanelConfig
---

# Interface WidgetsPanelConfig

Widgets panel configuration

## Properties

### actions

> **actions**?: `object`

Configuration for actions available on all widgets in the panel, such as
downloading each widget's data.

#### Type declaration

> ##### `actions.downloadCsv`
>
> **downloadCsv**?: `object`
>
> Configuration for the "Download as CSV" action on all widgets in the panel,
> which adds an item to each widget's header menu that exports the widget's
> underlying data as a CSV file.
>
> ###### Example
>
> Enable CSV download for every widget in a dashboard:
> ```ts
> const dashboardConfig: DashboardConfig = {
> widgetsPanel: {
> actions: {
> downloadCsv: {
> enabled: true,
> },
> },
> },
> };
> ```
>
> > ###### `downloadCsv.enabled`
> >
> > **enabled**?: `boolean`
> >
> > Whether the "Download as CSV" action is enabled for all widgets in the panel.
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
> Configuration for the "Download as Excel" action on all widgets in the panel,
> which adds an item to each widget's header menu that exports the widget's
> underlying data as an Excel (XLSX) file.
>
> ###### Example
>
> Enable Excel download for every widget in a dashboard:
> ```ts
> const dashboardConfig: DashboardConfig = {
> widgetsPanel: {
> actions: {
> downloadExcel: {
> enabled: true,
> },
> },
> },
> };
> ```
>
> > ###### `downloadExcel.enabled`
> >
> > **enabled**?: `boolean`
> >
> > Whether the "Download as Excel" action is enabled for all widgets in the panel.
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

### editMode

> **editMode**?: [`EditModeConfig`](interface.EditModeConfig.md)

Edit mode configuration.

***

### responsive

> **responsive**?: `boolean`

If `true`, adjust layout based on available width of widgets panel.

If not specified, the default value is `false`.
