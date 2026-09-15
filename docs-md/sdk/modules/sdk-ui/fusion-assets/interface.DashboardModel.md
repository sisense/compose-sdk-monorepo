---
title: DashboardModel
---

# Interface DashboardModel <Badge type="fusionEmbed" text="Fusion Embed" />

Model of Sisense Fusion dashboard defined in the abstractions of Compose SDK.

This is the return type of [`useGetDashboardModel`](function.useGetDashboardModel.md)
— see that hook's documentation for a usage example.

## Properties

### dataSource

> **dataSource**: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Dashboard data source details.

***

### oid

> **oid**: `string`

Unique identifier of the dashboard.

***

### title

> **title**: `string`

Dashboard title.

***

### widgets

> **widgets**: [`WidgetModel`](interface.WidgetModel.md)[]

Dashboard widget models.
