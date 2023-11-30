---
title: customFormula
---

# Function customFormula

> **customFormula**(
  `title`,
  `formula`,
  `context`): [`Attribute`](../../../interfaces/interface.Attribute.md) \| [`Measure`](../../../interfaces/interface.Measure.md)

Creates a calculated measure for a [valid custom formula](https://docs.sisense.com/main/SisenseLinux/dashboard-functions-reference.htm).

Use square brackets within the `formula` to include dimensions or measures.
Each unique dimension or measure included in the `formula` must be defined using a property:value pair in the `context` parameter.

You can nest custom formulas by placing one inside the `formula` parameter of another

Note: Shared formula must be fetched prior to use (see [useGetSharedFormula](../../../../sdk-ui/functions/function.useGetSharedFormula.md)).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `title` | `string` | Title of the measure to be displayed in legend |
| `formula` | `string` | Formula to be used for the measure |
| `context` | [`CustomFormulaContext`](../../../interfaces/interface.CustomFormulaContext.md) | Formula context as a map of strings to measures or attributes |

## Returns

[`Attribute`](../../../interfaces/interface.Attribute.md) \| [`Measure`](../../../interfaces/interface.Measure.md)

A calculated measure object that may be used in a chart or a query

## Example

An example of constructing a `customFormula` using dimensions, measures, and nested custom formulas:
```ts
 const profitabilityRatio = measures.customFormula(
  'Profitability Ratio',
  '([totalRevenue] - SUM([cost])) / [totalRevenue]',
  {
    totalRevenue: measures.sum(DM.Commerce.Revenue),
    cost: DM.Commerce.Cost,
  },
);

const profitabilityRatioRank = measures.customFormula(
  'Profitability Ratio Rank',
  'RANK([profRatio], "ASC", "1224")',
  {
    profRatio: profitabilityRatio,
  },
);

return (
  <Chart
    dataSet={DM.DataSource}
    chartType="line"
    dataOptions={{
      category: [DM.Commerce.AgeRange],
      value: [
        profitabilityRatioRank,
        {
          column: measures.sum(DM.Commerce.Revenue, 'Total Revenue'),
          showOnRightAxis: true,
          chartType: 'column',
        },
        {
          column: measures.sum(DM.Commerce.Cost, 'Total Cost'),
          showOnRightAxis: true,
          chartType: 'column',
        },
      ],
    }}
  />
);
```
