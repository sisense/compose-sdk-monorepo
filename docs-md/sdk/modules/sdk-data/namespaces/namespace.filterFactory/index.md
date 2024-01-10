---
title: filterFactory
---

# Namespace filterFactory

Functions to create date, text, or numeric filters on specified data.

Filters created with these functions can be used to:

+ Filter explicit queries by query components or query functions
+ Filter or highlight queries used by UI components, such as charts
+ Set the filters of filter components

## Example

Example of using React hook `useExecuteQuery` to query the `Sample ECommerce` data source.
Factory function `filterFactory.greaterThan()` is used to create a filter on `Revenue` to get values
greater than 1000.
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

### Namespaces

- [logic](namespaces/namespace.logic/index.md)

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
