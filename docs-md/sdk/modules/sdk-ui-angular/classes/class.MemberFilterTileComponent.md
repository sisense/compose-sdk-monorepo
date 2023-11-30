---
title: MemberFilterTileComponent
---

# Class MemberFilterTileComponent

Member Filter Tile Component

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new MemberFilterTileComponent**(`sisenseContextService`, `themeService`): [`MemberFilterTileComponent`](class.MemberFilterTileComponent.md)

Constructor for the `MemberFilterTileComponent`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](class.ThemeService.md) | Theme service |

#### Returns

[`MemberFilterTileComponent`](class.MemberFilterTileComponent.md)

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

> **attribute**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Attribute to filter on. A query will run to fetch all this attribute's members

***

#### dataSource

> **dataSource**: `undefined` \| `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### filter

> **filter**: `null` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Source filter object. Caller is responsible for keeping track of filter state

***

#### filterChange

> **filterChange**: `EventEmitter`\< `ArgumentsAsObject`\< (`filter`) => `void`, [`"filter"`] \> \>

Callback indicating when the source member filter object should be updated

***

#### title

> **title**: `string`

Title for the filter tile, which is rendered into the header
