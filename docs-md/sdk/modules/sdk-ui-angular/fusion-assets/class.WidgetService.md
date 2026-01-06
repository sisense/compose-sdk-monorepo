---
title: WidgetService
---

# Class WidgetService <Badge type="fusionEmbed" text="Fusion Embed" />

Service for working with Sisense Fusion widgets.

## Dashboards

### createJtdWidget

> **createJtdWidget**(`widgetProps`, `jtdConfig`): `object`

Adds Jump To Dashboard (JTD) functionality to widget props.

Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets,
such as clicking on chart data points or using context menus. This method is particularly useful when rendering
Widget components directly (not through a Dashboard component), but you still want JTD navigation functionality.

For widgets that are part of a dashboard, consider using `applyJtdConfig` or `applyJtdConfigs` instead,
as they apply JTD configuration at the dashboard level rather than individual widget level.

Note: dashboard-only 'includeDashboardFilters' is not supported and would just be ignored, since we do not have a dashboard in the current context.

This method enhances the provided widget props with JTD navigation capabilities, including:
- Click and right-click event handlers for navigation
- Hyperlink styling for actionable pivot cells (when applicable)
- JTD icon display in widget headers

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `widgetProps` | [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `null` | Base widget props to enhance with JTD functionality |
| `jtdConfig` | [`JumpToDashboardConfig`](../interfaces/interface.JumpToDashboardConfig.md) \| [`JumpToDashboardConfigForPivot`](../interfaces/interface.JumpToDashboardConfigForPivot.md) | JTD configuration defining navigation targets and behavior |

#### Returns

Object containing:
        - `widget$`: The observable that emits enhanced widget props with JTD handlers.
        - `destroy`: Function to clean up resources. Call this when the component is destroyed.

##### `destroy`

**destroy**: () => `void`

###### Returns

`void`

##### `widget$`

**widget$**: `BehaviorSubject`\< [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `null` \>

#### Example

```TypeScript
import { Component, OnDestroy } from '@angular/core';
import {
  WidgetService,
  widgetModelTranslator,
  type WidgetProps,
} from '@sisense/sdk-ui-angular';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'code-example',
  template: `
    `<csdk-widget
      *ngIf="widgetProps$ && (widgetProps$ | async) as widgetProps"
      [id]="widgetProps.id"
      [widgetType]="widgetProps.widgetType"
      [chartType]="widgetProps.chartType"
      [title]="widgetProps.title"
      [dataSource]="widgetProps.dataSource"
      [dataOptions]="widgetProps.dataOptions"
      [filters]="widgetProps.filters"
      [highlights]="widgetProps.highlights"
      [styleOptions]="widgetProps.styleOptions"
      [beforeMenuOpen]="widgetProps.beforeMenuOpen"
      (dataPointClick)="widgetProps.dataPointClick?.($event)"
      (dataPointContextMenu)="widgetProps.dataPointContextMenu?.($event)"
      (dataPointsSelect)="widgetProps.dataPointsSelect?.($event)"
    />`
  `,
})
export class CodeExample implements OnDestroy {
  constructor(private widgetService: WidgetService) {}

  widgetProps$: BehaviorSubject<WidgetProps | null> | null = null;
  private jtdDestroy: (() => void) | null = null;

  async ngOnInit(): Promise<void> {
    const widget = await this.widgetService.getWidgetModel({
      dashboardOid: '65a82171719e7f004018691c',
      widgetOid: '65a82171719e7f004018691f',
    });

    const baseProps = widget
      ? widgetModelTranslator.toWidgetProps(widget)
      : null;

    if (baseProps) {
      const jtdConfig = {
        targets: [{ id: 'target-dashboard-id', caption: 'Details' }],
        interaction: { triggerMethod: 'rightclick' },
      };
      const jtdResult = this.widgetService.createJtdWidget(
        baseProps,
        jtdConfig,
      );
      this.widgetProps$ = jtdResult.widget$;
      this.jtdDestroy = jtdResult.destroy;
    }
  }

  ngOnDestroy(): void {
    this.jtdDestroy?.();
  }
}
```

## Constructors

### constructor

> **new WidgetService**(`sisenseContextService`, `themeService`): [`WidgetService`](class.WidgetService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) |

#### Returns

[`WidgetService`](class.WidgetService.md)

## Methods

### getWidgetModel

> **getWidgetModel**(`params`): `Promise`\< [`WidgetModel`](interface.WidgetModel.md) \>

Retrieves an existing widget model from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetWidgetModelParams`](../interfaces/interface.GetWidgetModelParams.md) | Parameters to identify the target widget |

#### Returns

`Promise`\< [`WidgetModel`](interface.WidgetModel.md) \>

Widget model
