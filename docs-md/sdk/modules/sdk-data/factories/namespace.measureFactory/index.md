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

### Aggregation

- [aggregate](functions/function.aggregate.md)
- [average](functions/function.average.md)
- [count](functions/function.count.md)
- [countDistinct](functions/function.countDistinct.md)
- [max](functions/function.max.md)
- [median](functions/function.median.md)
- [min](functions/function.min.md)
- [sum](functions/function.sum.md)

### Arithmetic

- [add](functions/function.add.md)
- [constant](functions/function.constant.md)
- [divide](functions/function.divide.md)
- [multiply](functions/function.multiply.md)
- [subtract](functions/function.subtract.md)

### Time-based

- [diffPastMonth](functions/function.diffPastMonth.md)
- [diffPastQuarter](functions/function.diffPastQuarter.md)
- [diffPastWeek](functions/function.diffPastWeek.md)
- [diffPastYear](functions/function.diffPastYear.md)
- [difference](functions/function.difference.md)
- [monthToDateSum](functions/function.monthToDateSum.md)
- [pastDay](functions/function.pastDay.md)
- [pastMonth](functions/function.pastMonth.md)
- [pastQuarter](functions/function.pastQuarter.md)
- [pastWeek](functions/function.pastWeek.md)
- [pastYear](functions/function.pastYear.md)
- [quarterToDateSum](functions/function.quarterToDateSum.md)
- [weekToDateSum](functions/function.weekToDateSum.md)
- [yearToDateSum](functions/function.yearToDateSum.md)

### Statistics

- [contribution](functions/function.contribution.md)
- [growth](functions/function.growth.md)
- [growthPastMonth](functions/function.growthPastMonth.md)
- [growthPastQuarter](functions/function.growthPastQuarter.md)
- [growthPastWeek](functions/function.growthPastWeek.md)
- [growthPastYear](functions/function.growthPastYear.md)
- [growthRate](functions/function.growthRate.md)
- [rank](functions/function.rank.md)
- [runningSum](functions/function.runningSum.md)

### Advanced Analytics

- [customFormula](functions/function.customFormula.md)
- [forecast](functions/function.forecast.md)
- [measuredValue](functions/function.measuredValue.md)
- [trend](functions/function.trend.md)
