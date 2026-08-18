---
title: KpiChartEventProps
---

# Interface KpiChartEventProps

Event props for the [KpiChart](../charts/function.KpiChart.md) component.

## Properties

### Callbacks

#### onBeforeRender

> **onBeforeRender**?: [`KpiBeforeRenderHandler`](../type-aliases/type-alias.KpiBeforeRenderHandler.md)

A callback that allows you to customize the computed KPI render options
before the card is rendered. The returned options are used for painting.

***

#### onDataPointClick

> **onDataPointClick**?: [`KpiDataPointEventHandler`](../type-aliases/type-alias.KpiDataPointEventHandler.md)

Click handler callback for the KPI card.

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`KpiDataPointEventHandler`](../type-aliases/type-alias.KpiDataPointEventHandler.md)

Context menu handler callback for the KPI card.

***

#### onDataReady

> **onDataReady**?: (`data`) => [`Data`](../../sdk-data/interfaces/interface.Data.md)

A callback that allows you to modify the retrieved data before the KPI card is
computed from it. Whatever the callback returns is what the card is built from.

This is the data-level hook, applied to the raw query result — use it to rescale,
patch, or filter values. To adjust the already computed card instead, use the
render-level [`onBeforeRender`](interface.KpiChartEventProps.md#onbeforerender).

The data passed in is the query result, so its shape follows how the KPI queried it:

- **One query** — the usual case. The data holds one row per `category` bucket, or a
  single row when no `category` is configured.
- **Two queries** — `valueMode: 'total'` combined with a `category`. A whole-period
  aggregate cannot be derived from the per-bucket rows (summing per-bucket averages,
  for instance, would be wrong), so it is fetched by a second, ungrouped query and
  merged into the same result: one extra row carrying the aggregate, plus an extra
  column marking which rows are buckets and which one is the total. The callback still
  runs once, over the already merged result.

So always spread and map the data you were given rather than rebuilding it from
scratch — preserve any columns and rows you do not intend to change.

##### Example

Present a revenue measure in thousands:
```ts
onDataReady={(data) => ({
  ...data,
  rows: data.rows.map((row) =>
    row.map((cell, index) =>
      data.columns[index].name === 'Revenue' && typeof cell === 'number'
        ? cell / 1000
        : cell,
    ),
  ),
})}
```

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `data` | [`Data`](../../sdk-data/interfaces/interface.Data.md) |

##### Returns

[`Data`](../../sdk-data/interfaces/interface.Data.md)
