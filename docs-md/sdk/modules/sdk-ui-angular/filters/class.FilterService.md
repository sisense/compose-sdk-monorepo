---
title: FilterService
---

# Class FilterService

Service for working with filter.

## Constructors

### constructor

> **new FilterService**(`sisenseContextService`): [`FilterService`](class.FilterService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |

#### Returns

[`FilterService`](class.FilterService.md)

## Methods

### getFilterMembers

> **getFilterMembers**(`params`): `Promise`\< [`GetFilterMembersData`](../interfaces/interface.GetFilterMembersData.md) \>

Retrieves members of the provided filter.

Those members can be used to display a list of members in a third-party filter component such as Material UI Select.

## Example

Retrieve selected members from a Filter on Country of the Sample ECommerce data model.

```ts
try {
  const data = await filterService.getFilterMembers({
    filter: filterFactory.members(DM.Country.Country, ['United States', 'Canada'])
  });

  const { selectedMembers, allMembers, excludeMembers, enableMultiSelection } = data;
  console.log('selectedMembers', selectedMembers);
} catch (error) {
  console.error('Error:', error);
}
```

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetFilterMembersParams`](../interfaces/interface.GetFilterMembersParams.md) | Parameters for retrieving filter members |

#### Returns

`Promise`\< [`GetFilterMembersData`](../interfaces/interface.GetFilterMembersData.md) \>

Promise that resolves to the filter members data
