---
title: useGetFilterMembers
---

# Function useGetFilterMembers <Badge type="beta" text="Beta" />

> **useGetFilterMembers**(...`args`): [`GetFilterMembersResult`](../type-aliases/type-alias.GetFilterMembersResult.md)

Hook that fetches members of the provided filter

Those members can be used to display a list of members in a third-party filter component such as Material UI Select.

## Example

Retrieve selected members from a Filter on Country of the Sample ECommerce data model.

```ts
const {
  isLoading,
  data: { selectedMembers, allMembers, excludeMembers, enableMultiSelection },
} = useGetFilterMembers({ filter: filterFactory.members(DM.Country.Country, ['United States', 'Canada']) });

if (isLoading) {
  return <div>Loading...</div>;
}
console.log('selectedMembers', selectedMembers);
```

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`GetFilterMembersParams`](../interfaces/interface.GetFilterMembersParams.md)] |

## Returns

[`GetFilterMembersResult`](../type-aliases/type-alias.GetFilterMembersResult.md)

Results that contains the status of the filter query execution, the result data, or the error if any occurred
