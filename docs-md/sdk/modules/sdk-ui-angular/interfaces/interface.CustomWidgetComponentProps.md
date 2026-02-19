---
title: CustomWidgetComponentProps
---

# Interface CustomWidgetComponentProps`<DataOptions, StyleOptions, DataPoint>`

Props passed to a user-defined custom widget component.

## Example

```ts
import { Component, Input } from '@angular/core';
import {
  CustomWidgetComponentProps,
  CustomWidgetsService,
  GenericDataOptions,
  AbstractDataPointWithEntries,
  DataPointEntry,
  StyledColumn,
  StyledMeasureColumn,
} from '@sisense/sdk-ui-angular';
import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

interface MyDataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
}

interface MyDataPoint extends AbstractDataPointWithEntries {
  entries: {
    category: DataPointEntry[];
    value: DataPointEntry[];
  };
}

type MyWidgetProps = CustomWidgetComponentProps<MyDataOptions, object, MyDataPoint>;

@Component({
  selector: 'app-my-widget',
  template: `<div>My Custom Widget</div>`,
})
export class MyWidgetComponent implements MyWidgetProps {
  @Input() dataOptions!: MyDataOptions;
  @Input() dataSource?: DataSource;
  @Input() styleOptions?: object;
  @Input() filters?: Filter[] | FilterRelations;
  @Input() highlights?: Filter[];
  @Input() description?: string;
  @Input() onDataPointClick?: (point: MyDataPoint, nativeEvent: MouseEvent) => void;
  @Input() onDataPointContextMenu?: (point: MyDataPoint, nativeEvent: MouseEvent) => void;
  @Input() onDataPointsSelected?: (points: MyDataPoint[], nativeEvent: MouseEvent) => void;
}

// In AppModule or a component, register the custom widget:
constructor(private customWidgets: CustomWidgetsService) {
  this.customWidgets.registerCustomWidget('my-widget', MyWidgetComponent);
}
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `DataOptions` | [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md) | The shape of data options for this custom widget |
| `StyleOptions` | [`CustomWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.CustomWidgetStyleOptions.md) | The shape of style options for this custom widget |
| `DataPoint` *extends* [`AbstractDataPointWithEntries`](../../sdk-ui/type-aliases/type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](../../sdk-ui/type-aliases/type-alias.AbstractDataPointWithEntries.md) | The shape of data points for event handlers |

## Properties

### Callbacks

#### onDataPointClick

> **onDataPointClick**?: [`CustomWidgetDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.CustomWidgetDataPointEventHandler.md)\< `DataPoint` \>

Click handler callback for a data point

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`CustomWidgetDataPointContextMenuHandler`](../../sdk-ui/type-aliases/type-alias.CustomWidgetDataPointContextMenuHandler.md)\< `DataPoint` \>

Context menu handler callback for a data point

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`CustomWidgetDataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.CustomWidgetDataPointsEventHandler.md)\< `DataPoint` \>

Handler callback for selection of multiple data points

### Other

#### dataOptions

> **dataOptions**: `DataOptions`

Data options defining what data to display

***

#### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source for the custom widget

***

#### description

> **description**?: `string`

Description of the widget

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
