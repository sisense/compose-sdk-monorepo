---
title: Functions
---

Set of logic operators for filter relations construction

These operators are still in beta.

## Example

```ts
import { filters } from '@sisense/sdk-data';

// define filters
const revenueFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
const countryFilter = filterFactory.members(DM.Commerce.Country, ['USA', 'Canada']);
const genderFilter = filterFactory.doesntContain(DM.Commerce.Gender, 'Unspecified');
const costFilter = filterFactory.between(DM.Commerce.Cost, 1000, 2000);

// create filter relations of two filters
const orFilerRelations = filterFactory.logic.or(revenueFilter, countryFilter);
// revenueFilter OR countryFilter

// filter relations can have nested filter relations
const mixedFilterRelations = filterFactory.logic.and(genderFilter, orFilerRelations);
// genderFilter AND (revenueFilter OR countryFilter)

// array, specified in filter relations, will be converted to an intersection of filters automatically
const arrayFilterRelations = filterFactory.logic.or([genderFilter, costFilter], mixedFilterRelations);
// (genderFilter AND costFilter) OR (genderFilter AND (revenueFilter OR countryFilter))
```

# Functions

- [and](function.and.md) <Badge type="beta" text="Beta" />
- [or](function.or.md) <Badge type="beta" text="Beta" />
