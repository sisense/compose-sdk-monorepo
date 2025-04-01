---
title: toChartProps
---

# Function toChartProps

> **toChartProps**(`widgetModel`): [`ChartProps`](../../../interfaces/interface.ChartProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a chart.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`ChartProps`](../../../interfaces/interface.ChartProps.md)

## Example

```html
<csdk-chart
 *ngIf="chartProps"
 [chartType]="chartProps.chartType"
 [dataSet]="chartProps.dataSet"
 [dataOptions]="chartProps.dataOptions"
 [filters]="chartProps.filters"
 [highlights]="chartProps.highlights"
 [styleOptions]="chartProps.styleOptions"
/>
```

```ts
import { Component } from '@angular/core';
import {
 type ChartProps
 WidgetService,
 widgetModelTranslator,
} from '@sisense/sdk-ui-angular';

@Component({
 selector: 'app-example',
 templateUrl: './example.component.html',
 styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
 chartProps: ChartProps | null = null;

 constructor(private widgetService: WidgetService) {}

 async ngOnInit(): Promise<void> {
   const widgetModel = await widgetService.getWidgetModel({
     dashboardOid: 'your-dashboard-oid',
     widgetOid: 'your-widget-oid'
   });
   this.chartProps = widgetModelTranslator.toChartProps(widgetModel);
 }
}
```

Note: this method is not supported for pivot widgets.
Use [toPivotTableProps](function.toPivotTableProps.md) instead for getting props for the [PivotTableComponent](../../../data-grids/class.PivotTableComponent.md).
