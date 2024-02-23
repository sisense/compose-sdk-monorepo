---
title: PivotTable
---

# Function PivotTable <Badge type="alpha" text="Alpha" />

> **PivotTable**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

Pivot Table with pagination.

See [Pivot Tables](https://docs.sisense.com/main/SisenseLinux/pivot.htm) for more information.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`PivotTableProps`](../interfaces/interface.PivotTableProps.md) | Pivot Table properties |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Pivot Table component

## Example

(1) Example of PivotTable from the `Sample ECommerce` data model:

```ts
<PivotTable
  dataSet={DM.DataSource}
  dataOptions={{
    rows: [
      { column: DM.Category.Category, includeSubTotals: true },
      { column: DM.Commerce.AgeRange, includeSubTotals: true },
      DM.Commerce.Condition,
    ],
    columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
    values: [
      {
        column: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
        dataBars: true,
        totalsCalculation: 'sum',
      },
      {
        column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
        totalsCalculation: 'sum',
      },
    ],
    grandTotals: { title: 'Grand Total', rows: true, columns: true },
  }}
  filters={[filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])]}
  styleOptions={{ width: 1000, height: 600, rowsPerPage: 50 }}
/>
```
