---
title: DashboardComponent
---

# Class DashboardComponent <Badge type="beta" text="Beta" />

An Angular component used for easily rendering a dashboard created in Sisense Fusion.

**Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.

## Example

```html
<csdk-dashboard
 *ngIf="dashboard"
 [title]="dashboard.title"
 [layoutOptions]="dashboard.layoutOptions"
 [widgets]="dashboard.widgets"
 [filters]="dashboard.filters"
 [defaultDataSource]="dashboard.defaultDataSource"
 [widgetsOptions]="dashboard.widgetsOptions"
/>
```

```ts
import { Component } from '@angular/core';
import {
  type DashboardProps,
  DashboardService,
  dashboardModelTranslator,
} from '@sisense/sdk-ui-angular';

@Component({
 selector: 'app-dashboard',
 templateUrl: './dashboard.component.html',
 styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {

 dashboard: DashboardProps | null = null;

 constructor(private dashboardService: DashboardService) {}

 async ngOnInit(): Promise<void> {
   const dashboardModel = await this.dashboardService.getDashboardModel('your-dashboard-oid', { includeWidgets: true, includeFilters: true });
   this.dashboard = dashboardModelTranslator.toDashboardProps(dashboardModel);
 }
```

To learn more about this and related dashboard components,
see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new DashboardComponent**(`sisenseContextService`, `themeService`): [`DashboardComponent`](class.DashboardComponent.md)

Constructor for the `Dashboard` component.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) | Theme service |

#### Returns

[`DashboardComponent`](class.DashboardComponent.md)

## Properties

### Constructor

#### sisenseContextService

> **sisenseContextService**: [`SisenseContextService`](../contexts/class.SisenseContextService.md)

Sisense context service

***

#### themeService

> **themeService**: [`ThemeService`](../contexts/class.ThemeService.md)

Theme service

### Other

#### defaultDataSource

> **defaultDataSource**: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md) \| `undefined`

The default data source to use for the dashboard

***

#### filters

> **filters**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| `undefined`

The dashboard filters to be applied to each of the widgets based on the widget filter options

***

#### layoutOptions

> **layoutOptions**: [`DashboardLayoutOptions`](../interfaces/interface.DashboardLayoutOptions.md) \| `undefined`

Dashboard layout options

***

#### styleOptions

> **styleOptions**: [`DashboardStyleOptions`](../../sdk-ui/type-aliases/type-alias.DashboardStyleOptions.md) \| `undefined`

The style options for the dashboard

***

#### title

> **title**: `string` \| `undefined`

The title of the dashboard

***

#### widgets

> **widgets**: [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md)[]

The widgets to render in the dashboard

***

#### widgetsOptions

> **widgetsOptions**: [`WidgetsOptions`](../type-aliases/type-alias.WidgetsOptions.md) \| `undefined`

The options for each of the widgets
