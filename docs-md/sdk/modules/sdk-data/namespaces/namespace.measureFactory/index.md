---
title: measureFactory
---

# Namespace measureFactory

Functions to create measures that aggregate, summarize, and accumulate data,
plus show changes in data over time.

They are similar to [Formulas](https://docs.sisense.com/main/SisenseLinux/build-formulas.htm) in Sisense.

Measures created with these functions can be used in the data options of UI components such as
[Chart](../../../sdk-ui/interfaces/interface.ChartProps.md), [ChartWidget](../../../sdk-ui/interfaces/interface.ChartWidgetProps.md),
and [ExecuteQuery](../../../sdk-ui/interfaces/interface.ExecuteQueryProps.md).

## Example

Example of using React hook useExecuteQuery to query the `Sample ECommerce` data source.
Factory function `measureFactory.sum()` is used to create a measure that sums the `Revenue` column.
```ts
  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [measureFactory.sum(DM.Commerce.Revenue)],
    filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (data) {
    return <div>{`Total Rows: ${data.rows.length}`}</div>;
  }
  return null;
```

## Index

### Functions

- [add](functions/function.add.md)
- [aggregate](functions/function.aggregate.md)
- [average](functions/function.average.md)
- [constant](functions/function.constant.md)
- [contribution](functions/function.contribution.md)
- [count](functions/function.count.md)
- [countDistinct](functions/function.countDistinct.md)
- [customFormula](functions/function.customFormula.md)
- [diffPastMonth](functions/function.diffPastMonth.md)
- [diffPastQuarter](functions/function.diffPastQuarter.md)
- [diffPastWeek](functions/function.diffPastWeek.md)
- [diffPastYear](functions/function.diffPastYear.md)
- [difference](functions/function.difference.md)
- [divide](functions/function.divide.md)
- [forecast](functions/function.forecast.md)
- [growth](functions/function.growth.md)
- [growthPastMonth](functions/function.growthPastMonth.md)
- [growthPastQuarter](functions/function.growthPastQuarter.md)
- [growthPastWeek](functions/function.growthPastWeek.md)
- [growthPastYear](functions/function.growthPastYear.md)
- [growthRate](functions/function.growthRate.md)
- [max](functions/function.max.md)
- [measuredValue](functions/function.measuredValue.md)
- [median](functions/function.median.md)
- [min](functions/function.min.md)
- [monthToDateSum](functions/function.monthToDateSum.md)
- [multiply](functions/function.multiply.md)
- [pastDay](functions/function.pastDay.md)
- [pastMonth](functions/function.pastMonth.md)
- [pastQuarter](functions/function.pastQuarter.md)
- [pastWeek](functions/function.pastWeek.md)
- [pastYear](functions/function.pastYear.md)
- [quarterToDateSum](functions/function.quarterToDateSum.md)
- [rank](functions/function.rank.md)
- [runningSum](functions/function.runningSum.md)
- [subtract](functions/function.subtract.md)
- [sum](functions/function.sum.md)
- [trend](functions/function.trend.md)
- [weekToDateSum](functions/function.weekToDateSum.md)
- [yearToDateSum](functions/function.yearToDateSum.md)
