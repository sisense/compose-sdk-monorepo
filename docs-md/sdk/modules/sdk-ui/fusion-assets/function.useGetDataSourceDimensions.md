---
title: useGetDataSourceDimensions
---

# Function useGetDataSourceDimensions <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetDataSourceDimensions**(`params`): [`DataSourceDimensionsState`](../type-aliases/type-alias.DataSourceDimensionsState.md)

Gets the dimensions of a data source.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetDataSourceDimensionsParams`](../interfaces/interface.GetDataSourceDimensionsParams.md) | The parameters for getting the dimensions |

## Returns

[`DataSourceDimensionsState`](../type-aliases/type-alias.DataSourceDimensionsState.md)

The dimensions state

## Example

```ts
import { useGetDataSourceDimensions } from '@sisense/sdk-ui';

const CodeExample = () => {
  const { dimensions, isLoading, isError } = useGetDataSourceDimensions({
    dataSource: 'Sample ECommerce',
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <ul>
      {dimensions?.map((dimension) => (
        <li key={dimension.name}>
          {dimension.name}
          <ul>
            {dimension.attributes.map((attribute) => (
              <li key={attribute.name}>{attribute.name}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default CodeExample;
```
