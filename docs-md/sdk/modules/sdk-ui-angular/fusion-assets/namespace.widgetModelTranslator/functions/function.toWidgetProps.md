---
title: toWidgetProps
---

# Function toWidgetProps

> **toWidgetProps**(`widgetModel`): [`WidgetProps`](../../../type-aliases/type-alias.WidgetProps.md)

Translates [WidgetModel](../../interface.WidgetModel.md) to [WidgetProps](../../../type-aliases/type-alias.WidgetProps.md).

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`WidgetProps`](../../../type-aliases/type-alias.WidgetProps.md)

## Example

```html
<csdk-widget
  *ngIf="widgetProps"
  [id]="widgetProps.id"
  [widgetType]="widgetProps.widgetType"
  [chartType]="widgetProps.chartType"
  [dataSource]="widgetProps.dataSource"
  [dataOptions]="widgetProps.dataOptions"
  [filters]="widgetProps.filters"
  [highlights]="widgetProps.highlights"
  [styleOptions]="widgetProps.styleOptions"
  [title]="widgetProps.title"
  [description]="widgetProps.description"
/>
```

```ts
import { Component } from '@angular/core';
import {
  type WidgetProps,
  WidgetService,
  widgetModelTranslator,
} from '@sisense/sdk-ui-angular';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  widgetProps: WidgetProps | null = null;

  constructor(private widgetService: WidgetService) {}

  async ngOnInit(): Promise<void> {
    const widgetModel = await widgetService.getWidgetModel({
      dashboardOid: 'your-dashboard-oid',
      widgetOid: 'your-widget-oid'
    });
    this.widgetProps = widgetModelTranslator.toWidgetProps(widgetModel);
  }
}
```
