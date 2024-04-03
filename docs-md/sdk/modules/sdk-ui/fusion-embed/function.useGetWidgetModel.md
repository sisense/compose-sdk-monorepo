---
title: useGetWidgetModel
---

# Function useGetWidgetModel <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetWidgetModel**(...`args`): [`WidgetModelState`](../type-aliases/type-alias.WidgetModelState.md)

React hook that retrieves an existing widget model from the Sisense instance.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`GetWidgetModelParams`](../interfaces/interface.GetWidgetModelParams.md)] |

## Returns

[`WidgetModelState`](../type-aliases/type-alias.WidgetModelState.md)

Widget load state that contains the status of the execution, the result widget model, or the error if one has occurred

## Example

An example of retrieving an existing widget model from the Sisense instance:
```ts
 const { widget, isLoading, isError } = useGetWidgetModel({
   dashboardOid: '6448665edac1920034bce7a8',
   widgetOid: '6448665edac1920034bce7a8',
 });
 if (isLoading) {
   return <div>Loading...</div>;
 }
 if (isError) {
   return <div>Error</div>;
 }
 if (widget) {
   return (
     <Chart {...widget.getChartProps()} />
   );
 }
 return null;
```
