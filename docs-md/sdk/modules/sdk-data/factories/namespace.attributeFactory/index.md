---
title: attributeFactory
---

# Namespace attributeFactory

Functions to create calculated attributes — formula-based attributes that produce
categorical/grouping values.

Calculated attributes created with these functions can be used wherever attributes are accepted,
in UI component data options or in the `dimensions` of a query.

## Example

Combine two attributes into a single text dimension from the `Sample ECommerce` data model.
```ts
  const ageAndGender = attributeFactory.customFormula(
    'Age & Gender',
    'Concat([ageRange], " ", [gender])',
    { ageRange: DM.Commerce.AgeRange, gender: DM.Commerce.Gender },
  );
```

## Index

### Factories

- [customFormula](functions/function.customFormula.md)
