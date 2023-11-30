---
title: DateRangeFilterTileComponent
---

# Class DateRangeFilterTileComponent

Date Range Filter Tile Component

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new DateRangeFilterTileComponent**(`sisenseContextService`, `themeService`): [`DateRangeFilterTileComponent`](class.DateRangeFilterTileComponent.md)

Constructor for the `DateRangeFilterTileComponent`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](class.ThemeService.md) | Theme service |

#### Returns

[`DateRangeFilterTileComponent`](class.DateRangeFilterTileComponent.md)

## Properties

### Constructor

#### sisenseContextService

> **sisenseContextService**: [`SisenseContextService`](class.SisenseContextService.md)

Sisense context service

***

#### themeService

> **themeService**: [`ThemeService`](class.ThemeService.md)

Theme service

### Other

#### attribute

> **attribute**: [`LevelAttribute`](../../sdk-data/interfaces/interface.LevelAttribute.md)

Date level attribute the filter is based on

***

#### dataSource

> **dataSource**: `undefined` \| `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### earliestDate

> **earliestDate**: `undefined` \| `string`

Earliest allowed date for selection.

If not specified, the earliest date of the target date-level attribute will be used.

***

#### filter

> **filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Date range filter.

***

#### filterChange

> **filterChange**: `EventEmitter`\< `ArgumentsAsObject`\< (`filter`) => `void`, [`"filter"`] \> \>

Callback function that is called when the date range filter object should be updated.

***

#### lastDate

> **lastDate**: `undefined` \| `string`

Latest allowed date for selection.

If not specified, the latest date of the target date-level attribute will be used.

***

#### title

> **title**: `string`

Filter tile title
