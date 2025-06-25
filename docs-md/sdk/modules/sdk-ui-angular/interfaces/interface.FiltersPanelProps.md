---
title: FiltersPanelProps
---

# Interface FiltersPanelProps

Props of the [FiltersPanelComponent](../filter-tiles/class.FiltersPanelComponent.md).

## Properties

### config

> **config**?: [`FiltersPanelConfig`](interface.FiltersPanelConfig.md)

The configuration for the filters panel

***

### defaultDataSource

> **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Default data source used for filter tiles

***

### filters

> **filters**: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Array of filters to display

***

### filtersChange

> **filtersChange**?: (`event`) => `void`

Callback to handle changes in filters

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `event` | [`FiltersPanelChangeEvent`](../type-aliases/type-alias.FiltersPanelChangeEvent.md) |

#### Returns

`void`
