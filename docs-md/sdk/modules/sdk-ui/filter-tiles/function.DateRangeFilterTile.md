---
title: DateRangeFilterTile
---

# Function DateRangeFilterTile

> **DateRangeFilterTile**(`props`, `deprecatedLegacyContext`?): `null` \| `ReactElement`\< `any`, `any` \>

Date Range Filter Tile component for filtering data by date range.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`DateRangeFilterTileProps`](../interfaces/interface.DateRangeFilterTileProps.md) | Date Range Filter Tile Props |
| `deprecatedLegacyContext`? | `any` | ::: warning Deprecated<br /><br />:::<br /><br />**See**<br /><br />[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Date Range Filter Tile component

## Example

React example of configuring the date min max values and handling onChange event.
```ts
const [dateRangeFilter, setDateRangeFilter] = useState<Filter>(
  filterFactory.dateRange(DM.Commerce.Date.Years),
);

return (
  <DateRangeFilterTile
    title="Date Range"
    attribute={DM.Commerce.Date.Years}
    filter={dateRangeFilter}
    onChange={(filter: Filter) => {
      setDateRangeFilter(filter);
    }}
  />
);
```

<img src="../../../img/date-filter-example-1.png" width="800px" />
