---
title: customFormula
---

# Function customFormula

> **customFormula**(
  `title`,
  `formula`,
  `context`): [`Attribute`](../../../interfaces/interface.Attribute.md) \| [`Measure`](../../../interfaces/interface.Measure.md)

Creates a calculated measure for a valid custom formula built from [base functions](https://docs.sisense.com/main/SisenseLinux/dashboard-functions-reference.htm).

Use square brackets (`[]`) within the `formula` property to include dimensions or measures.
Each unique dimension or measure included in the `formula` must be defined using a property:value pair in the `context` parameter.

You can nest custom formulas by placing one inside the `formula` parameter of another.

Note: To use [shared formulas](https://docs.sisense.com/main/SisenseLinux/shared-formulas.htm)
from a Fusion Embed instance, you must fetch them first using [useGetSharedFormula](../../../../sdk-ui/fusion-embed/function.useGetSharedFormula.md).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `title` | `string` | Title of the measure to be displayed in legend |
| `formula` | `string` | Formula to be used for the measure |
| `context` | [`CustomFormulaContext`](../../../interfaces/interface.CustomFormulaContext.md) | Formula context as a map of strings to measures or attributes |

## Returns

[`Attribute`](../../../interfaces/interface.Attribute.md) \| [`Measure`](../../../interfaces/interface.Measure.md)

A calculated measure instance

## Example

An example of constructing a custom formulas using dimensions, measures, and nested custom formulas
from the Sample Ecommerce data model.
```ts
// Custom formula
const profitabilityRatio = measureFactory.customFormula(
  'Profitability Ratio',
  '([totalRevenue] - SUM([cost])) / [totalRevenue]',
  {
    totalRevenue: measureFactory.sum(DM.Commerce.Revenue),
    cost: DM.Commerce.Cost,
  },
);

// Nested custom formula
const profitabilityRatioRank = measureFactory.customFormula(
  'Profitability Ratio Rank',
  'RANK([profRatio], "ASC", "1224")',
  {
    profRatio: profitabilityRatio,
  },
);
```
