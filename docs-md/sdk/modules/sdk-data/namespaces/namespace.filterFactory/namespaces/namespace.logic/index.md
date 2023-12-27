---
title: logic
---

# Namespace logic

Set of logic operators for filter relation construction

These operators are still in beta.

## Example

```ts
import { filters } from '@sisense/sdk-data';

// define filters
const revenueFilter = filters.greaterThan(DM.Commerce.Revenue, 1000);
const countryFilter = filters.members(DM.Commerce.Country, ['USA', 'Canada']);
const genderFilter = filters.doesntContain(DM.Commerce.Gender, 'Unspecified');
const costFilter = filters.between(DM.Commerce.Cost, 1000, 2000);

// create filter relation of two filters
const orFilerRelations = filterFactory.logic.or(revenueFilter, countryFilter);
// revenueFilter OR countryFilter

// filter relations can have nested filter relations
const mixedFilterRelations = filterFactory.logic.and(genderFilter, orFilerRelations);
// genderFilter AND (revenueFilter OR countryFilter)

// array, specified in filter relations, will be converted to an intersection of filters automatically
const arrayFilterRelations = filterFactory.logic.or([genderFilter, costFilter], mixedFilterRelations);
// (genderFilter AND costFilter) OR (genderFilter AND (revenueFilter OR countryFilter))
```

## Index

### Functions

- [and](functions/function.and.md)
- [or](functions/function.or.md)
