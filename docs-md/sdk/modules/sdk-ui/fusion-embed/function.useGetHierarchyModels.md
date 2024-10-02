---
title: useGetHierarchyModels
---

# Function useGetHierarchyModels <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetHierarchyModels**(...`args`): [`HierarchyModelsState`](../type-aliases/type-alias.HierarchyModelsState.md)

React hook that retrieves existing hierarchy models from a Fusion Embed instance.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`GetHierarchiesParams`](../interfaces/interface.GetHierarchiesParams.md)] |

## Returns

[`HierarchyModelsState`](../type-aliases/type-alias.HierarchyModelsState.md)

Load state that contains the status of the execution, the result hierarchy models, or the error if one has occurred

## Example

Retrieve the hierarchy models and render their counts.
```ts
 const { hierarchies, isLoading, isError } = useGetHierarchyModels({
   dataSource: DM.DataSource,
   dimension: DM.Commerce.AgeRange,
 });

 if (isLoading) {
   return <div>Loading...</div>;
 }
 if (isError) {
   return <div>Error</div>;
 }
 if (hierarchies) {
   return <div>{`Total Hierarchies: ${hierarchies.length}`}</div>;
 }
 return null;
```
