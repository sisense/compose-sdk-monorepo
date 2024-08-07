---
title: DashboardWidgetComponent
---

# Class DashboardWidgetComponent <Badge type="fusionEmbed" text="Fusion Embed" />

The Dashboard Widget component, which is a thin wrapper on [ChartWidgetComponent](../chart-utilities/class.ChartWidgetComponent.md),
is used to render a widget created in a Sisense Fusion instance.

To learn more about using Sisense Fusion Widgets in Compose SDK, see
[Sisense Fusion Widgets](https://sisense.dev/guides/sdk/guides/charts/guide-fusion-widgets.html).

## Example

```html
<csdk-dashboard-widget
   [widgetOid]="widgetOid"
   [dashboardOid]="dashboardOid"
   [includeDashboardFilters]="true"
/>
```
```ts
import { Component } from '@angular/core';
import { ChartType } from '@sisense/sdk-ui-angular';
import { filterFactory, measureFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
 selector: 'app-widgets',
templateUrl: './widgets.component.html',
styleUrls: ['./widgets.component.scss'],
})
export class WidgetsComponent {
 widgetOid: string = '60f3e3e3e4b0e3e3e4b0e3e3';
 dashboardOid: string = '60f3e3e3e4b0e3e3e4b0e3e3';
```

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new DashboardWidgetComponent**(`sisenseContextService`, `themeService`): [`DashboardWidgetComponent`](class.DashboardWidgetComponent.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) |

#### Returns

[`DashboardWidgetComponent`](class.DashboardWidgetComponent.md)

## Properties

### Data

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

Provided filters will be merged with the existing filters from the widget configuration.

***

#### filtersMergeStrategy

> **filtersMergeStrategy**: `undefined` \| `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

Strategy for merging the existing widget filters (including highlights) with the filters provided via the `filters` and `highlights` props:

- `widgetFirst` - prioritizes the widget filters over the provided filters in case of filter conflicts by certain attributes.
- `codeFirst` - prioritizes the provided filters over the widget filters in case of filter conflicts by certain attributes.
- `codeOnly` - applies only the provided filters and completely ignores the widget filters.

If not specified, the default strategy is `codeFirst`.

***

#### highlights

> **highlights**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

***

#### includeDashboardFilters

> **includeDashboardFilters**: `undefined` \| `boolean`

Boolean flag whether to include dashboard filters in the widget's `filters` and `highlights`

If not specified, the default value is `false`.

### Widget

#### dashboardOid

> **dashboardOid**: `string`

Identifier of the dashboard that contains the widget

***

#### description

> **description**: `undefined` \| `string`

Description of the widget

If not specified, it takes the existing value from the widget configuration.

***

#### highlightSelectionDisabled

> **highlightSelectionDisabled**: `undefined` \| `boolean`

Boolean flag whether selecting data points triggers highlight filter of the selected data

Recommended to turn on when the Chart Widget component is enhanced with data drilldown by the Drilldown Widget component

If not specified, the default value is `false`

***

#### styleOptions

> **styleOptions**: `undefined` \| [`DashboardWidgetStyleOptions`](../interfaces/interface.DashboardWidgetStyleOptions.md)

Style options for the widget including the widget container and the chart or table inside.

***

#### title

> **title**: `undefined` \| `string`

Title of the widget

If not specified, it takes the existing value from the widget configuration.

***

#### widgetOid

> **widgetOid**: `string`

Identifier of the widget
