---
title: toTableProps
---

# Function toTableProps

> **toTableProps**(`widgetModel`): [`TableProps`](../../../interfaces/interface.TableProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a table.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`TableProps`](../../../interfaces/interface.TableProps.md)

## Example

```html
<csdk-table
 *ngIf="tableProps"
 [dataSet]="tableProps.dataSet"
 [dataOptions]="tableProps.dataOptions"
 [filters]="tableProps.filters"
 [styleOptions]="tableProps.styleOptions"
/>
```

```ts
import { Component } from '@angular/core';
import {
 type TableProps
 WidgetService,
 widgetModelTranslator,
} from '@ethings-os/sdk-ui-angular';

@Component({
 selector: 'app-example',
 templateUrl: './example.component.html',
 styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
 tableProps: TableProps | null = null;

 constructor(private widgetService: WidgetService) {}

 async ngOnInit(): Promise<void> {
   const widgetModel = await widgetService.getWidgetModel({
     dashboardOid: 'your-dashboard-oid',
     widgetOid: 'your-widget-oid'
   });
   this.tableProps = widgetModelTranslator.toTableProps(widgetModel);
 }
}
```

Note: this method is not supported for chart and pivot widgets.
Use [toChartProps](function.toChartProps.md) instead for getting props for the [ChartComponent](../../../charts/class.ChartComponent.md).
Use [toPivotTableProps](function.toPivotTableProps.md) instead for getting props for the [PivotTableComponent](../../../data-grids/class.PivotTableComponent.md).
