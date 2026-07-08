---
title: DashboardConfig
---

# Interface DashboardConfig

Dashboard configuration

## Properties

### filtersPanel

> **filtersPanel**?: [`DashboardFiltersPanelConfig`](interface.DashboardFiltersPanelConfig.md)

Configuration for the filters panel

***

### header

> **header**?: [`DashboardHeaderConfig`](interface.DashboardHeaderConfig.md)

Configuration for the dashboard header.

***

### tabbers

> **tabbers**?: [`TabbersConfig`](../type-aliases/type-alias.TabbersConfig.md)

Configuration for tabber widgets in the dashboard

***

### toolbar

> **toolbar**?: `object`

Configuration for the toolbar.

::: warning Deprecated
Use the `header` configuration section instead (`header.visible`).
:::

#### Type declaration

> ##### `toolbar.visible`
>
> **visible**: `boolean`
>
> Determines whether the toolbar is visible.
>
> If not specified, the default value is `true`.
>
> ::: warning Deprecated
> Use `header.visible` instead.
> :::
>
>

***

### widgetsPanel

> **widgetsPanel**?: [`WidgetsPanelConfig`](interface.WidgetsPanelConfig.md)

Configuration for the widgets panel
