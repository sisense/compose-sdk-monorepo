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
 [title]="dashboard!.title"
 [layoutOptions]="dashboard!.layoutOptions"
 [widgets]="dashboard!.widgets"
 [filters]="dashboard!.filters"
 [defaultDataSource]="dashboard!.dataSource"
 [widgetsOptions]="dashboard!.widgetsOptions"
/>
```

```ts
import { Component } from '@angular/core';
import { type DashboardProps, DashboardService } from '@sisense/sdk-ui-angular';

@Component({
 selector: 'app-dashboard',
 templateUrl: './dashboard.component.html',
 styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {

 dashboard: DashboardProps | null = null;

 constructor(private dashboardService: DashboardService) {}

 async ngOnInit(): Promise<void> {
   const dashboardModel = await this.dashboardService.getDashboardModel('60f3e3e3e4b0e3e3e4b0e3e3', { includeWidgets: true, includeFilters: true });
   this.dashboardProps = dashboardModelTranslator.toDashboardProps(dashboardModel);
 }
```

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

> **defaultDataSource**: `undefined` \| [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

The default data source to use for the dashboard

***

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

The dashboard filters to be applied to each of the widgets based on the widget filter options

***

#### layoutOptions

> **layoutOptions**: `undefined` \| [`DashboardLayoutOptions`](../interfaces/interface.DashboardLayoutOptions.md)

Dashboard layout options

***

#### styleOptions

> **styleOptions**: `undefined` \| [`DashboardStyleOptions`](../../sdk-ui/type-aliases/type-alias.DashboardStyleOptions.md)

The style options for the dashboard

***

#### title

> **title**: `undefined` \| `string`

The title of the dashboard

***

#### widgets

> **widgets**: [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md)[]

The widgets to render in the dashboard

***

#### widgetsOptions

> **widgetsOptions**: `undefined` \| [`WidgetsOptions`](../type-aliases/type-alias.WidgetsOptions.md)

The options for each of the widgets
