---
title: toPivotTableWidgetProps
---

# Function toPivotTableWidgetProps

> **toPivotTableWidgetProps**(`widgetModel`): [`PivotTableWidgetProps`](../../../interfaces/interface.PivotTableWidgetProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a pivot table widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`PivotTableWidgetProps`](../../../interfaces/interface.PivotTableWidgetProps.md)

## Example

```html
<csdk-pivot-table-widget
 *ngIf="pivotWidgetProps"
 [dataSet]="pivotWidgetProps.dataSet"
 [dataOptions]="pivotWidgetProps.dataOptions"
 [filters]="pivotWidgetProps.filters"
 [styleOptions]="pivotWidgetProps.styleOptions"
/>
```

```ts
import { Component } from '@angular/core';
import {
 type PivotTableWidgetProps
 WidgetService,
 widgetModelTranslator,
} from '@ethings-os/sdk-ui-angular';

@Component({
 selector: 'app-example',
 templateUrl: './example.component.html',
 styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
 pivotWidgetProps: PivotTableWidgetProps | null = null;

 constructor(private widgetService: WidgetService) {}

 async ngOnInit(): Promise<void> {
   const widgetModel = await widgetService.getWidgetModel({
     dashboardOid: 'your-dashboard-oid',
     widgetOid: 'your-widget-oid'
   });
   this.pivotWidgetProps = widgetModelTranslator.toPivotTableWidgetProps(widgetModel);
 }
}
```

Note: this method is not supported for chart or table widgets.
Use [toChartWidgetProps](function.toChartWidgetProps.md) instead for getting props for the [ChartWidgetComponent](../../../dashboards/class.ChartWidgetComponent.md).
