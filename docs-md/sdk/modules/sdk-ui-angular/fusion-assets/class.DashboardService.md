---
title: DashboardService
---

# Class DashboardService <Badge type="fusionEmbed" text="Fusion Embed" />

Service for working with Sisense Fusion dashboards.

**Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.

## Constructors

### constructor

> **new DashboardService**(`sisenseContextService`): [`DashboardService`](class.DashboardService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |

#### Returns

[`DashboardService`](class.DashboardService.md)

## Methods

### createComposedDashboard

> **createComposedDashboard**<`D`>(`initialDashboard`, `options` = `{}`): `object`

Сomposes dashboard or separate dashboard elements into a coordinated dashboard
with cross filtering, and change detection.

#### Type parameters

| Parameter |
| :------ |
| `D` *extends* [`ComposableDashboardProps`](../interfaces/interface.ComposableDashboardProps.md) \| [`DashboardProps`](../interfaces/interface.DashboardProps.md) |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `initialDashboard` | `D` | Initial dashboard |
| `options` | [`UseComposedDashboardOptions`](../../sdk-ui/type-aliases/type-alias.UseComposedDashboardOptions.md) | Configuration options |

#### Returns

Reactive composed dashboard object and API methods for interacting with it

##### `dashboard$`

**dashboard$**: `BehaviorSubject`\< `D` \>

##### `setFilters`

**setFilters**: (`filters`) => `Promise`\< `void` \>

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `filters` | [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] |

###### Returns

`Promise`\< `void` \>

##### `setWidgetsLayout`

**setWidgetsLayout**: (`newLayout`) => `Promise`\< `void` \>

###### Parameters

| Parameter | Type |
| :------ | :------ |
| `newLayout` | [`WidgetsPanelColumnLayout`](../interfaces/interface.WidgetsPanelColumnLayout.md) |

###### Returns

`Promise`\< `void` \>

#### Example

An example of using the `createComposedDashboard` to construct a composed dashboard and render it:
```html
 <!--Component HTML template in example.component.html-->
 <div *ngIf="dashboard$ | async as dashboard">
   <csdk-filter-tile
     *ngFor="let filter of getDashboardFilters(dashboard); trackBy: trackByIndex"
     [filter]="filter"
   />
   <csdk-widget
     *ngFor="let widget of dashboard.widgets; trackBy: trackByIndex"
     [id]="widget.id"
     [widgetType]="widget.widgetType"
     [chartType]="widget.chartType"
     [pluginType]="widget.pluginType"
     [dataSource]="widget.dataSource"
     [dataOptions]="widget.dataOptions"
     [filters]="widget.filters"
     [highlights]="widget.highlights"
     [styleOptions]="widget.styleOptions"
     [drilldownOptions]="widget.drilldownOptions"
     [title]="widget.title"
     [description]="widget.description"
     [beforeMenuOpen]="widget.beforeMenuOpen"
     (dataPointClick)="widget.dataPointClick?.($event)"
     (dataPointContextMenu)="widget.dataPointContextMenu?.($event)"
     (dataPointsSelect)="widget.dataPointsSelect?.($event)"
   />
 </div>
```

```ts
 // Component behavior in example.component.ts
 import { Component } from '@angular/core';
 import { BehaviorSubject } from 'rxjs';
 import { DashboardService, type DashboardProps } from '@sisense/sdk-ui-angular';

 @Component({
   selector: 'example',
   templateUrl: './example.component.html',
   styleUrls: ['./example.component.scss'],
 })
 export class ExampleComponent {
   dashboard$: BehaviorSubject<DashboardProps> | undefined;

   constructor(private dashboardService: DashboardService) {}

   ngOnInit() {
     const initialDashboard: DashboardProps = { ... };
     const composedDashboard = this.dashboardService.createComposedDashboard(initialDashboard);
     this.dashboard$ = composedDashboard.dashboard$;
   }

   trackByIndex = (index: number) => index;

   getDashboardFilters = ({ filters }: DashboardProps) => Array.isArray(filters) ? filters : [];
 }
```

***

### getDashboardModel

> **getDashboardModel**(`dashboardOid`, `options`?): `Promise`\< [`DashboardModel`](interface.DashboardModel.md) \>

Retrieves an existing dashboard model from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboardOid` | `string` | Identifier of the dashboard |
| `options`? | [`GetDashboardModelOptions`](../interfaces/interface.GetDashboardModelOptions.md) | Advanced configuration options |

#### Returns

`Promise`\< [`DashboardModel`](interface.DashboardModel.md) \>

Dashboard model

***

### getDashboardModels

> **getDashboardModels**(`options`?): `Promise`\< [`DashboardModel`](interface.DashboardModel.md)[] \>

Retrieves existing dashboard models from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `options`? | [`GetDashboardModelsOptions`](../interfaces/interface.GetDashboardModelsOptions.md) | Advanced configuration options |

#### Returns

`Promise`\< [`DashboardModel`](interface.DashboardModel.md)[] \>

Dashboard models array
