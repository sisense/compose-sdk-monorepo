---
title: toPivotTableProps
---

# Function toPivotTableProps

> **toPivotTableProps**(`widgetModel`): [`PivotTableProps`](../../../interfaces/interface.PivotTableProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a pivot table.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`PivotTableProps`](../../../interfaces/interface.PivotTableProps.md)

## Example

```html
<csdk-pivot-table
 *ngIf="pivotTableProps"
 [dataSet]="pivotTableProps.dataSet"
 [dataOptions]="pivotTableProps.dataOptions"
 [filters]="pivotTableProps.filters"
 [styleOptions]="pivotTableProps.styleOptions"
/>
```

```ts
import { Component } from '@angular/core';
import {
 type PivotTableProps
 WidgetService,
 widgetModelTranslator,
} from '@sisense/sdk-ui-angular';

@Component({
 selector: 'app-example',
 templateUrl: './example.component.html',
 styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
 pivotTableProps: PivotTableProps | null = null;

 constructor(private widgetService: WidgetService) {}

 async ngOnInit(): Promise<void> {
   const widgetModel = await widgetService.getWidgetModel({
     dashboardOid: 'your-dashboard-oid',
     widgetOid: 'your-widget-oid'
   });
   this.pivotTableProps = widgetModelTranslator.toPivotTableProps(widgetModel);
 }
}
```

Note: this method is not supported for chart or table widgets.
Use [toChartProps](function.toChartProps.md) instead for getting props for the [ChartComponent](../../../charts/class.ChartComponent.md).
Use [toTableProps](function.toTableProps.md) instead for getting props for the [TableComponent](../../../data-grids/class.TableComponent.md).
