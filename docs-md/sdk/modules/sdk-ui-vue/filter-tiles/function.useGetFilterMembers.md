---
title: useGetFilterMembers
---

# Function useGetFilterMembers

> **useGetFilterMembers**(`params`): `ToRefs`\< [`FilterMembersState`](../type-aliases/type-alias.FilterMembersState.md) \>

A Vue composable function `useGetFilterMembers` that fetches members of a provided filter.

Those members can be used to display a list of members in a third-party filter component.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`GetFilterMembersParams`](../interfaces/interface.GetFilterMembersParams.md) \> | The parameters for fetching filter members, supporting reactive Vue refs.<br />Includes the filter to fetch members for, optional default data source, parent filters, and count. |

## Returns

`ToRefs`\< [`FilterMembersState`](../type-aliases/type-alias.FilterMembersState.md) \>

## Example

How to use `useGetFilterMembers` within a Vue component:
```vue
<script setup>
import { ref } from 'vue';
import { useGetFilterMembers, filterFactory } from '@ethings-os/sdk-ui-vue';
import * as DM from './data-model';

const filter = ref(filterFactory.members(DM.Country.Country, ['United States', 'Canada']));

const { data, isLoading, isError, isSuccess, error, loadMore } = useGetFilterMembers({
  filter,
  // Optional parameters
  defaultDataSource: 'Sample ECommerce',
  parentFilters: [],
});
</script>
```

The composable returns an object with the following reactive properties to manage the filter members state:
- `data`: The filter members data containing selectedMembers, allMembers, excludeMembers, enableMultiSelection, and hasBackgroundFilter.
- `isLoading`: Indicates if the filter members fetching is in progress.
- `isError`: Indicates if an error occurred during filter members fetching.
- `isSuccess`: Indicates if the filter members fetching executed successfully without errors.
- `error`: Contains the error object if an error occurred during the fetching.
- `loadMore`: Function to load more data rows.

This composable facilitates integrating Sisense filter members fetching into Vue applications, enabling developers
to easily manage filter member states and dynamically adjust parameters based on application needs.
