---
title: DrilldownBreadcrumbs
---

# Class DrilldownBreadcrumbs

`DrilldownBreadcrumbs` component from the `@sisense/sdk-ui-vue` package.
This component provides a way to display and interact with the drilldown path in data visualization components,
allowing users to navigate through different levels of data drilldowns. It includes functionalities to clear selections
or slice through the drilldown selections for a more intuitive data exploration experience.

## Example

Here's how to use the `DrilldownBreadcrumbs` component:
```vue
<template>
  <DrilldownBreadcrumbs
    :clearDrilldownSelections="clearSelections"
    :currentDimension="currentDimension"
    :sliceDrilldownSelections="sliceSelections"
    :filtersDisplayValues="filtersDisplayValues"
  />
</template>

<script>
import { ref } from 'vue';
import DrilldownBreadcrumbs from './DrilldownBreadcrumbs.vue';

export default {
  components: { DrilldownBreadcrumbs },
  setup() {
    const clearSelections = () => {};
    const currentDimension = ref({<current dimension object>});
    const sliceSelections = (index) => { <logic to slice selections up to index> };
    const filtersDisplayValues = ref({<object mapping filter values to display values>});

    return { clearSelections, currentDimension, sliceSelections, filtersDisplayValues };
  }
};
</script>
```

## Properties

### Widget

#### clearDrilldownSelections

> **clearDrilldownSelections**?: () => `void`

Callback function that is evaluated when the close (X) button is clicked

##### Returns

`void`

***

#### sliceDrilldownSelections

> **sliceDrilldownSelections**?: (`i`) => `void`

Callback function that is evaluated when a breadcrumb is clicked

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `i` | `number` |

##### Returns

`void`

### Other

#### currentDimension

> **currentDimension**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Object representing the current dimension in the drilldown path.

***

#### filtersDisplayValues

> **filtersDisplayValues**?: `string`[][]

Object mapping the internal filter values to human-readable display values, enhancing the usability of the breadcrumbs.
