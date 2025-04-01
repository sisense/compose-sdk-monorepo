---
title: toChartWidgetProps
---

# Function toChartWidgetProps

> **toChartWidgetProps**(`widgetModel`): [`ChartWidgetProps`](../../../interfaces/interface.ChartWidgetProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a chart widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`ChartWidgetProps`](../../../interfaces/interface.ChartWidgetProps.md)

## Example

```html
<csdk-chart-widget
 *ngIf="chartWidgetProps"
 [chartType]="chartWidgetProps.chartType"
 [dataSource]="chartWidgetProps.dataSource"
 [dataOptions]="chartWidgetProps.dataOptions"
 [filters]="chartWidgetProps.filters"
 [highlights]="chartWidgetProps.highlights"
 [styleOptions]="chartWidgetProps.styleOptions"
/>
```

```ts
import { Component } from '@angular/core';
import {
 type ChartWidgetProps
 WidgetService,
 widgetModelTranslator,
} from '@sisense/sdk-ui-angular';

@Component({
 selector: 'app-example',
 templateUrl: './example.component.html',
 styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
 chartWidgetProps: ChartWidgetProps | null = null;

 constructor(private widgetService: WidgetService) {}

 async ngOnInit(): Promise<void> {
   const widgetModel = await widgetService.getWidgetModel({
     dashboardOid: 'your-dashboard-oid',
     widgetOid: 'your-widget-oid'
   });
   this.chartWidgetProps = widgetModelTranslator.toChartWidgetProps(widgetModel);
 }
}
```

Note: this method is not supported for pivot widgets.
