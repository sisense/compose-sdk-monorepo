---
title: CustomVisualizationProps
---

# Interface CustomVisualizationProps <Badge type="beta" text="Beta" />`<DataOptions, StyleOptions, DataPoint, CustomOptions>`

Defines props passed to a user-defined custom visualization component.

## Example

```ts
import {
  CustomVisualization,
  CustomVisualizationProps,
  CustomVisualizationDataPoint,
  StyledColumn,
  StyledMeasureColumn,
  DataPointEntry,
  GenericDataOptions,
} from '@sisense/sdk-ui';

interface MyDataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
}

interface MyDataPoint extends CustomVisualizationDataPoint {
  entries: {
    category: DataPointEntry[];
    value: DataPointEntry[];
  };
}

type MyChartProps = CustomVisualizationProps<MyDataOptions, {}, MyDataPoint>;

const MyChart: CustomVisualization<MyChartProps> = ({ dataOptions, onDataPointClick }) => {
  return <div>My Chart</div>;
};
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `DataOptions` | [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md) | The shape of data options for this custom visualization. |
| `StyleOptions` | [`CustomVisualizationStyleOptions`](interface.CustomVisualizationStyleOptions.md) | The shape of style options for this custom visualization. |
| `DataPoint` *extends* [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | The shape of data points passed to event handlers. |
| `CustomOptions` | `Record`\< `string`, `unknown` \> | The shape of arbitrary plugin-specific state (not data- or style-related). |

## Properties

### Callbacks

#### onDataPointClick

> **onDataPointClick**?: [`CustomVisualizationDataPointEventHandler`](type-alias.CustomVisualizationDataPointEventHandler.md)\< `DataPoint` \>

Click handler callback for a data point

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`CustomVisualizationDataPointContextMenuHandler`](type-alias.CustomVisualizationDataPointContextMenuHandler.md)\< `DataPoint` \>

Context menu handler callback for a data point

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`CustomVisualizationDataPointsEventHandler`](type-alias.CustomVisualizationDataPointsEventHandler.md)\< `DataPoint` \>

Handler callback for selection of multiple data points

### Other

#### dataOptions

> **dataOptions**: `DataOptions`

Data options defining what data to display

***

#### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source for the custom visualization

***

#### filters

> **filters**?: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters to apply to the data

***

#### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters for interactive highlighting

***

#### styleOptions

> **styleOptions**?: `StyleOptions`

Style options for customizing appearance
