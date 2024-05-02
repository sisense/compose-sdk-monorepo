---
title: Functions
---

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
- [measureEquals](function.measureEquals.md)
- [measureGreaterThan](function.measureGreaterThan.md)
- [measureGreaterThanOrEqual](function.measureGreaterThanOrEqual.md)
- [measureLessThan](function.measureLessThan.md)
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

# Namespaces

- [logic](../namespaces/namespace.logic/index.md) <Badge type="beta" text="Beta" />
