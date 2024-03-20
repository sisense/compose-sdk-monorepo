---
title: DrilldownBreadcrumbsComponent
---

# Class DrilldownBreadcrumbsComponent

Drilldown Breadcrumbs Component

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new DrilldownBreadcrumbsComponent**(`sisenseContextService`, `themeService`): [`DrilldownBreadcrumbsComponent`](class.DrilldownBreadcrumbsComponent.md)

Constructor for the `DrilldownBreadcrumbsComponent`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) | Theme service |

#### Returns

[`DrilldownBreadcrumbsComponent`](class.DrilldownBreadcrumbsComponent.md)

## Properties

### Widget

#### currentDimension

> **currentDimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Currently selected drilldown dimension

***

#### drilldownSelectionsClear

> **drilldownSelectionsClear**: `EventEmitter`\< `ArgumentsAsObject`\< () => `void`, [] \> \>

Callback function that is evaluated when the close (X) button is clicked

***

#### drilldownSelectionsSlice

> **drilldownSelectionsSlice**: `EventEmitter`\< `number` \>

Callback function that is evaluated when a breadcrumb is clicked

***

#### filtersDisplayValues

> **filtersDisplayValues**: `string`[][]

List of drilldown filters formatted to be displayed as breadcrumbs

### Constructor

#### sisenseContextService

> **sisenseContextService**: [`SisenseContextService`](../contexts/class.SisenseContextService.md)

Sisense context service

***

#### themeService

> **themeService**: [`ThemeService`](../contexts/class.ThemeService.md)

Theme service
