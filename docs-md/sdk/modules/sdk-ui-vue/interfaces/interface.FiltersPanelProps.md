---
title: FiltersPanelProps
---

# Interface FiltersPanelProps

Props of the [`FiltersPanel`](../filter-tiles/class.FiltersPanel.md) component.

## Properties

### config

> **config**?: [`FiltersPanelConfig`](../../sdk-ui/interfaces/interface.FiltersPanelConfig.md)

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

### onFiltersChange

> **onFiltersChange**: (`filters`) => `void`

Callback to handle changes in filters

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filters` | [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] |

#### Returns

`void`
