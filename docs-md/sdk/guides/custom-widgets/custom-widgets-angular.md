---
title: Custom Widgets (Angular)
---

# Custom Widgets

> **Note**:
> This guide is for [<img src="../../img/angular-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 2px" /> Angular](../../getting-started/quickstart-angular.md). For other frameworks, see the [<img src="../../img/react-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 3px" /> React](custom-widgets-react.md) and [<img src="../../img/vue-logo.png" height="14px" /> Vue](custom-widgets-vue.md) guides.

This guide explains how to define your own custom widget component and register it in your application code, so that it will be automatically rendered (based on the corresponding widget type) when using the `DashboardById` component. Custom widgets in Compose SDK can be used to replace Fusion plugins when displaying dashboards.

**Note:** It is assumed that the application is [already configured correctly](../../getting-started/quickstart-angular.md) for use with Compose SDK.

## Sample dashboard

The `histogramwidget` plugin is included with Sisense Fusion, so we'll be using it as our example. We'll start by creating a dashboard in Fusion, containing a single `histogramwidget` widget with `Sample ECommerce` as its data source.

![Dashboard in Fusion](../../img/plugins-guide/dashboard-in-fusion.png 'Dashboard in Fusion')

## Displaying the dashboard in your application

To display a dashboard using Compose SDK, we need the `oid` for the relevant dashboard. The simplest way to find this, is to copy the value from the end of the URL when viewing the dashboard in Fusion, e.g. `/app/main/dashboards/{dashboardOid}`.

The dashboard can be easily displayed using the `csdk-dashboard-by-id` component, passing this value into the `dashboardOid` input.

```html
<csdk-dashboard-by-id [dashboardOid]="'66f23d1b202c89002abd64ac'" />
```

Since Compose SDK does not support the `histogramwidget` plugin out of the box, it is expected that Compose SDK will display an error in place of the histogram widget.

![Dashboard in Compose SDK (no registered custom widget)](../../img/plugins-guide/dashboard-in-csdk-unregistered.png 'Dashboard in Compose SDK (no registered custom widget)')

In order to resolve this, we will explore how to define a custom widget component and register it with Compose SDK, so that it knows what to do when it encounters a `histogramwidget` plugin from Fusion.

## Defining a custom widget using Compose SDK

Before registering our custom widget, we first need to define a custom widget component that will replace the Fusion plugin. This component will:
1. Receive the props that Compose SDK will pass to our custom widget when rendering the `csdk-dashboard-by-id` component
2. Run a data query using those props
3. Render a visualization with the results

Purely for the **simplicity** of this guide, we have chosen to define a custom widget component which renders a table of the query results. In reality, you would more likely define an Angular implementation of a histogram chart, or however else you wish to represent the Fusion plugin in your Compose SDK dashboard.

This guide also aims to demonstrate the flexibility of the `registerCustomWidget` interface - as long as you provide a component that matches the shape of [`CustomWidgetComponent`](../../modules/sdk-ui-angular/type-aliases/type-alias.CustomWidgetComponent.md), Compose SDK will render that component as a replacement for the designated Fusion plugin.

A note on the `dataOptions` input that is passed to our component: For those familiar with the Fusion plugin / add-on architecture, `dataOptions` is the Compose SDK equivalent of `panels` on the [WidgetMetadata](https://sisense.dev/guides/customJs/jsApiRef/widgetClass/widget-metadata.html) object.

Compose SDK translates all widget metadata and filters to Compose SDK data structures (e.g. values inside [`dataOptions`](../../modules/sdk-ui-angular/type-aliases/type-alias.ChartDataOptions.md) are of type [`StyledColumn`](../../modules/sdk-ui-angular/interfaces/interface.StyledColumn.md) and [`StyledMeasureColumn`](../../modules/sdk-ui-angular/interfaces/interface.StyledMeasureColumn.md), the same types you'd expect for [`dataOptions`](../../modules/sdk-ui-angular/type-aliases/type-alias.ChartDataOptions.md) into the [`csdk-chart`](../../modules/sdk-ui-angular/charts/class.ChartComponent.md) component).

In the custom widget component, we can use the inputs directly with the `executeCustomWidgetQuery` method from the `QueryService` which runs a data query and applies some formatting on the results (defined by the `StyledColumn` information in `dataOptions`).

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { QueryService } from '@sisense/sdk-ui-angular';
import type {
  CustomWidgetComponentProps,
  QueryResultData
} from '@sisense/sdk-ui-angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-results-table',
  template: `
    <table style="margin: 20px;" *ngIf="data$ | async as data">
      <thead>
        <tr>
          <th *ngFor="let column of data.columns; trackBy: trackByIndex">
            {{ column.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of data.rows; trackBy: trackByIndex">
          <td *ngFor="let cell of row; trackBy: trackByIndex">
            {{ cell.text }}
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class ResultsTableComponent implements OnInit, CustomWidgetComponentProps {
  @Input() title!: string;
  @Input() dataOptions!: any;
  @Input() filters!: any[];

  data$!: Observable<QueryResultData | null>;

  constructor(private queryService: QueryService) {}

  ngOnInit() {
    this.data$ = this.queryService.executeCustomWidgetQuery({
      title: this.title,
      dataOptions: this.dataOptions,
      filters: this.filters
    });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
```
**Note:** Don't forget to declare your custom widget component in your Angular module

If you prefer to work with the raw data without any formatting applied, you can use `extractDimensionsAndMeasures` with `executeQuery` instead.

```typescript
import { extractDimensionsAndMeasures } from '@sisense/sdk-ui-angular';

ngOnInit() {
  const { dimensions, measures } = extractDimensionsAndMeasures(this.dataOptions);
  this.data$ = this.queryService.executeQuery({
    dimensions,
    measures,
    filters: this.filters,
  });
}
```

## Registering the custom widget with Compose SDK

To register the custom widget, we need to inject the `CustomWidgetsService` and call `registerCustomWidget`.

```typescript
import { Component, OnInit } from '@angular/core';
import { CustomWidgetsService } from '@sisense/sdk-ui-angular';
import { ResultsTableComponent } from './results-table.component';

@Component({
  selector: 'app-root',
  template: `
    <csdk-dashboard-by-id [dashboardOid]="'66f4d4dd384428002ae0a21d'" />
  `
})
export class AppComponent implements OnInit {
  constructor(private customWidgetsService: CustomWidgetsService) {}

  ngOnInit() {
    this.customWidgetsService.registerCustomWidget('histogramwidget', ResultsTableComponent);
  }
}
```

If we refresh our application, instead of seeing the error in place of the widget as before, we should now see something like this:

![Dashboard in Compose SDK (registered custom widget)](../../img/plugins-guide/dashboard-in-csdk-registered.png 'Dashboard in Compose SDK (registered custom widget)')

## Summary

Here's what we accomplished:
- Displayed an existing Fusion dashboard in our application by rendering a `csdk-dashboard-by-id` component
- Created an Angular component that uses its inputs to execute a data query and display the results in a table
- Registered that table component as a custom widget to be shown in place of the `histogramwidget` Fusion plugin when it is rendered inside of a `csdk-dashboard-by-id` component

Obviously, we didn't end up with a new histogram component in Angular (yet), but hopefully the simplicity of this guide gives you the tools to you need to make that, or anything else, happen!