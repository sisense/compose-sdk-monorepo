---
title: DataSourceService
---

# Class DataSourceService <Badge type="fusionEmbed" text="Fusion Embed" />

Service for working with data source dimensional model.

## Constructors

### constructor

> **new DataSourceService**(`sisenseContextService`): [`DataSourceService`](class.DataSourceService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |

#### Returns

[`DataSourceService`](class.DataSourceService.md)

## Methods

### getDataSourceDimensions

> **getDataSourceDimensions**(`params`): `Promise`\< \{
  `dimensions`: [`Dimension`](../../sdk-data/interfaces/interface.Dimension.md)[];
 } \>

Gets the dimensions of a data source.

## Example

```ts
try {
  const { dimensions } = await dataSourceService.getDataSourceDimensions({
    dataSource: DM.DataSource,
  });
  console.log('dimensions', dimensions);
} catch (error) {
  console.error('Error:', error);
}
```

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetDataSourceDimensionsParams`](../interfaces/interface.GetDataSourceDimensionsParams.md) | Parameters for getting the dimensions |

#### Returns

`Promise`\< \{
  `dimensions`: [`Dimension`](../../sdk-data/interfaces/interface.Dimension.md)[];
 } \>

Promise that resolves to the data source dimensions
