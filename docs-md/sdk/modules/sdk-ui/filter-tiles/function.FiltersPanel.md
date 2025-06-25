---
title: FiltersPanel
---

# Function FiltersPanel

> **FiltersPanel**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

Filters panel component that renders a list of filter tiles

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`FiltersPanelProps`](../interfaces/interface.FiltersPanelProps.md) |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

## Example

Here's how to render a filters panel with a set of filters.
```ts
import { useState } from 'react';
import { FiltersPanel } from '@sisense/sdk-ui';
import { filterFactory, type Filter, type FilterRelations } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce-model';

export function Example() {
  const [filters, setFilters] = useState<Filter[]>([
    filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']),
    filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24']),
  ]);

  const handleFiltersChange = (updatedFilters: Filter[] | FilterRelations) => {
    console.log('Filters changed:', updatedFilters);
  };

  return (
    <FiltersPanel
      filters={filters}
      defaultDataSource={DM.DataSource}
      onFiltersChange={handleFiltersChange}
    />
  );
}
```
