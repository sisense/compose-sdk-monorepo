---
title: filters
---

# Namespace filters

Functions to create date, text, or numeric filters on certain data columns

They are similar to [Dashboard and Widget Filters](https://docs.sisense.com/main/SisenseLinux/build-formulas.htm) in Sisense.

Filters created with these functions can be used in the data options of UI components such as
[Chart](../../../sdk-ui/interfaces/interface.ChartProps.md), [ChartWidget](../../../sdk-ui/interfaces/interface.ChartWidgetProps.md),
and [ExecuteQuery](../../../sdk-ui/interfaces/interface.ExecuteQueryProps.md).

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

## Index

### Functions

- [between](functions/function.between.md)
- [betweenNotEqual](functions/function.betweenNotEqual.md)
- [bottomRanking](functions/function.bottomRanking.md)
- [contains](functions/function.contains.md)
- [dateFrom](functions/function.dateFrom.md)
- [dateRange](functions/function.dateRange.md)
- [dateRelative](functions/function.dateRelative.md)
- [dateRelativeFrom](functions/function.dateRelativeFrom.md)
- [dateRelativeTo](functions/function.dateRelativeTo.md)
- [dateTo](functions/function.dateTo.md)
- [doesntContain](functions/function.doesntContain.md)
- [doesntEndWith](functions/function.doesntEndWith.md)
- [doesntEqual](functions/function.doesntEqual.md)
- [doesntStartWith](functions/function.doesntStartWith.md)
- [endsWith](functions/function.endsWith.md)
- [equals](functions/function.equals.md)
- [exclude](functions/function.exclude.md)
- [greaterThan](functions/function.greaterThan.md)
- [greaterThanOrEqual](functions/function.greaterThanOrEqual.md)
- [intersection](functions/function.intersection.md)
- [lessThan](functions/function.lessThan.md)
- [lessThanOrEqual](functions/function.lessThanOrEqual.md)
- [like](functions/function.like.md)
- [measureBetween](functions/function.measureBetween.md)
- [measureBetweenNotEqual](functions/function.measureBetweenNotEqual.md)
- [measureGreaterThanOrEqual](functions/function.measureGreaterThanOrEqual.md)
- [measureLessThanOrEqual](functions/function.measureLessThanOrEqual.md)
- [members](functions/function.members.md)
- [numeric](functions/function.numeric.md)
- [startsWith](functions/function.startsWith.md)
- [thisMonth](functions/function.thisMonth.md)
- [thisQuarter](functions/function.thisQuarter.md)
- [thisYear](functions/function.thisYear.md)
- [today](functions/function.today.md)
- [topRanking](functions/function.topRanking.md)
- [union](functions/function.union.md)
