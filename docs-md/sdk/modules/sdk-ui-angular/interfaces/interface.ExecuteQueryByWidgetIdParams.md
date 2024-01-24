---
title: ExecuteQueryByWidgetIdParams
---

# Interface ExecuteQueryByWidgetIdParams

Parameters for data query by widget id execution.

## Extends

- `Omit`\< [`ExecuteQueryByWidgetIdParams`](../../sdk-ui/interfaces/interface.ExecuteQueryByWidgetIdParams.md), `"enabled"` \>

## Properties

### count

> **count**?: `number`

{@inheritDoc ExecuteQueryProps.count}

#### Inherited from

Omit.count

***

### dashboardOid

> **dashboardOid**: `string`

{@inheritDoc ExecuteQueryByWidgetIdProps.dashboardOid}

#### Inherited from

Omit.dashboardOid

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

{@inheritDoc ExecuteQueryByWidgetIdProps.filters}

#### Inherited from

Omit.filters

***

### filtersMergeStrategy

> **filtersMergeStrategy**?: `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

{@inheritDoc ExecuteQueryByWidgetIdProps.filtersMergeStrategy}

#### Inherited from

Omit.filtersMergeStrategy

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

{@inheritDoc ExecuteQueryByWidgetIdProps.highlights}

#### Inherited from

Omit.highlights

***

### includeDashboardFilters

> **includeDashboardFilters**?: `boolean`

{@inheritDoc ExecuteQueryByWidgetIdProps.includeDashboardFilters}

#### Inherited from

Omit.includeDashboardFilters

***

### offset

> **offset**?: `number`

{@inheritDoc ExecuteQueryProps.offset}

#### Inherited from

Omit.offset

***

### onBeforeQuery

> **onBeforeQuery**?: (`jaql`) => `any`

{@inheritDoc ExecuteQueryByWidgetIdProps.onBeforeQuery}

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `jaql` | `any` |

#### Returns

`any`

#### Inherited from

Omit.onBeforeQuery

***

### widgetOid

> **widgetOid**: `string`

{@inheritDoc ExecuteQueryByWidgetIdProps.widgetOid}

#### Inherited from

Omit.widgetOid
