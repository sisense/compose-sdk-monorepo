---
title: Functions
---

Functions to build formulas that aggregate, summarize, and accumulate data,
plus show changes in data over time.

They are similar to [Formulas](https://docs.sisense.com/main/SisenseLinux/build-formulas.htm) in Sisense.

Measures created with these functions can be used in the data options of UI components such as
[Chart](../../../../sdk-ui/interfaces/interface.ChartProps.md), [ChartWidget](../../../../sdk-ui/interfaces/interface.ChartWidgetProps.md),
and [ExecuteQuery](../../../../sdk-ui/interfaces/interface.ExecuteQueryProps.md).

## Example

Example of using the component to query the `Sample ECommerce` data source.
Function `measures.sum` is used to create a measure that sums the `Revenue` column.
```ts
<ExecuteQuery
  dataSource={DM.DataSource}
  dimensions={[DM.Commerce.AgeRange]}
  measures={[measures.sum(DM.Commerce.Revenue)]}
  filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
>
{
  (data) => {
    if (data) {
      console.log(data);
      return <div>{`Total Rows: ${data.rows.length}`}</div>;
    }
  }
}
</ExecuteQuery>
```

# Functions

- [add](function.add.md)
- [aggregate](function.aggregate.md)
- [average](function.average.md)
- [constant](function.constant.md)
- [contribution](function.contribution.md)
- [count](function.count.md)
- [countDistinct](function.countDistinct.md)
- [diffPastMonth](function.diffPastMonth.md)
- [diffPastQuarter](function.diffPastQuarter.md)
- [diffPastWeek](function.diffPastWeek.md)
- [diffPastYear](function.diffPastYear.md)
- [difference](function.difference.md)
- [divide](function.divide.md)
- [forecast](function.forecast.md)
- [growth](function.growth.md)
- [growthPastMonth](function.growthPastMonth.md)
- [growthPastQuarter](function.growthPastQuarter.md)
- [growthPastWeek](function.growthPastWeek.md)
- [growthPastYear](function.growthPastYear.md)
- [growthRate](function.growthRate.md)
- [max](function.max.md)
- [measuredValue](function.measuredValue.md)
- [median](function.median.md)
- [min](function.min.md)
- [monthToDateSum](function.monthToDateSum.md)
- [multiply](function.multiply.md)
- [pastDay](function.pastDay.md)
- [pastMonth](function.pastMonth.md)
- [pastQuarter](function.pastQuarter.md)
- [pastWeek](function.pastWeek.md)
- [pastYear](function.pastYear.md)
- [quarterToDateSum](function.quarterToDateSum.md)
- [rank](function.rank.md)
- [runningSum](function.runningSum.md)
- [subtract](function.subtract.md)
- [sum](function.sum.md)
- [trend](function.trend.md)
- [weekToDateSum](function.weekToDateSum.md)
- [yearToDateSum](function.yearToDateSum.md)
