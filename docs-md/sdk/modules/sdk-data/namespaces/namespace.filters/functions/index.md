---
title: Functions
---

Functions to create date, text, or numeric filters on certain data columns

They are similar to [Dashboard and Widget Filters](https://docs.sisense.com/main/SisenseLinux/build-formulas.htm) in Sisense.

Filters created with these functions can be used in the data options of UI components such as
[Chart](../../../../sdk-ui/interfaces/interface.ChartProps.md), [ChartWidget](../../../../sdk-ui/interfaces/interface.ChartWidgetProps.md),
and [ExecuteQuery](../../../../sdk-ui/interfaces/interface.ExecuteQueryProps.md).

## Example

Example of using the component to query the `Sample ECommerce` data source.
Function `filters.greaterThan` is used to create a filter on `Revenue` to get values
greater than 1000.
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

- [between](function.between.md)
- [betweenNotEqual](function.betweenNotEqual.md)
- [bottomRanking](function.bottomRanking.md)
- [contains](function.contains.md)
- [dateFrom](function.dateFrom.md)
- [dateRange](function.dateRange.md)
- [dateRelative](function.dateRelative.md)
- [dateRelativeFrom](function.dateRelativeFrom.md)
- [dateRelativeTo](function.dateRelativeTo.md)
- [dateTo](function.dateTo.md)
- [doesntContain](function.doesntContain.md)
- [doesntEndWith](function.doesntEndWith.md)
- [doesntEqual](function.doesntEqual.md)
- [doesntStartWith](function.doesntStartWith.md)
- [endsWith](function.endsWith.md)
- [equals](function.equals.md)
- [exclude](function.exclude.md)
- [greaterThan](function.greaterThan.md)
- [greaterThanOrEqual](function.greaterThanOrEqual.md)
- [intersection](function.intersection.md)
- [lessThan](function.lessThan.md)
- [lessThanOrEqual](function.lessThanOrEqual.md)
- [like](function.like.md)
- [measureBetween](function.measureBetween.md)
- [measureBetweenNotEqual](function.measureBetweenNotEqual.md)
- [measureGreaterThanOrEqual](function.measureGreaterThanOrEqual.md)
- [measureLessThanOrEqual](function.measureLessThanOrEqual.md)
- [members](function.members.md)
- [numeric](function.numeric.md)
- [startsWith](function.startsWith.md)
- [thisMonth](function.thisMonth.md)
- [thisQuarter](function.thisQuarter.md)
- [thisYear](function.thisYear.md)
- [today](function.today.md)
- [topRanking](function.topRanking.md)
- [union](function.union.md)
