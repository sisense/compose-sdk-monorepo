import {
  type WidgetModel,
  widgetModelTranslator as widgetModelTranslatorPreact,
} from '@ethings-os/sdk-ui-preact';

import {
  ChartProps,
  ChartWidgetProps,
  PivotTableProps,
  PivotTableWidgetProps,
  TableProps,
  type TextWidgetProps,
} from '../components';
import { ExecutePivotQueryParams, ExecuteQueryParams } from '../services';

/**
 * Translates a {@link WidgetModel} to the parameters for executing a query for the widget.
 *
 * @example
 * ```ts
const widgetModel = await widgetService.getWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid'
});
const executeQueryParams = widgetModelTranslator.toExecuteQueryParams(widgetModel);
const queryResult = await queryService.executeQuery(executeQueryParams);
 * ```
 *
 * Note: this method is not supported for getting pivot query.
 * Use {@link toExecutePivotQueryParams} instead for getting query parameters for the pivot widget.
 */
export const toExecuteQueryParams = (widgetModel: WidgetModel): ExecuteQueryParams => {
  return widgetModelTranslatorPreact.toExecuteQueryParams(widgetModel);
};

/**
 * Translates a {@link WidgetModel} to the parameters for executing a query for the pivot widget.
 *
 * @example
 * ```ts
const widgetModel = await widgetService.getWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid'
});
const executePivotQueryParams = widgetModelTranslator.toExecutePivotQueryParams(widgetModel);
const queryResult = await queryService.executePivotQuery(executeQueryParams);
 * ```
 *
 * Note: this method is supported only for getting pivot query.
 * Use {@link toExecuteQueryParams} instead for getting query parameters for non-pivot widgets.
 */
export const toExecutePivotQueryParams = (widgetModel: WidgetModel): ExecutePivotQueryParams => {
  return widgetModelTranslatorPreact.toExecutePivotQueryParams(widgetModel);
};

/**
 * Translates a {@link WidgetModel} to the props for rendering a chart.
 *
 * @example
 * ```html
<csdk-chart
  *ngIf="chartProps"
  [chartType]="chartProps.chartType"
  [dataSet]="chartProps.dataSet"
  [dataOptions]="chartProps.dataOptions"
  [filters]="chartProps.filters"
  [highlights]="chartProps.highlights"
  [styleOptions]="chartProps.styleOptions"
/>
 * ```
 *
 * ```ts
import { Component } from '@angular/core';
import {
  type ChartProps
  WidgetService,
  widgetModelTranslator,
} from '@ethings-os/sdk-ui-angular';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  chartProps: ChartProps | null = null;

  constructor(private widgetService: WidgetService) {}

  async ngOnInit(): Promise<void> {
    const widgetModel = await widgetService.getWidgetModel({
      dashboardOid: 'your-dashboard-oid',
      widgetOid: 'your-widget-oid'
    });
    this.chartProps = widgetModelTranslator.toChartProps(widgetModel);
  }
}
 * ```
 *
 * Note: this method is not supported for pivot widgets.
 * Use {@link toPivotTableProps} instead for getting props for the {@link PivotTableComponent}.
 */
export function toChartProps(widgetModel: WidgetModel): ChartProps {
  return widgetModelTranslatorPreact.toChartProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a table.
 *
 * @example
 * ```html
<csdk-table
  *ngIf="tableProps"
  [dataSet]="tableProps.dataSet"
  [dataOptions]="tableProps.dataOptions"
  [filters]="tableProps.filters"
  [styleOptions]="tableProps.styleOptions"
/>
 * ```
 *
 * ```ts
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
 * ```
 *
 * Note: this method is not supported for chart and pivot widgets.
 * Use {@link toChartProps} instead for getting props for the {@link ChartComponent}.
 * Use {@link toPivotTableProps} instead for getting props for the {@link PivotTableComponent}.
 */
export function toTableProps(widgetModel: WidgetModel): TableProps {
  return widgetModelTranslatorPreact.toTableProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a pivot table.
 *
 * @example
 * ```html
<csdk-pivot-table
  *ngIf="pivotTableProps"
  [dataSet]="pivotTableProps.dataSet"
  [dataOptions]="pivotTableProps.dataOptions"
  [filters]="pivotTableProps.filters"
  [styleOptions]="pivotTableProps.styleOptions"
/>
 * ```
 *
 * ```ts
import { Component } from '@angular/core';
import {
  type PivotTableProps
  WidgetService,
  widgetModelTranslator,
} from '@ethings-os/sdk-ui-angular';

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
 * ```
 *
 * Note: this method is not supported for chart or table widgets.
 * Use {@link toChartProps} instead for getting props for the {@link ChartComponent}.
 * Use {@link toTableProps} instead for getting props for the {@link TableComponent}.
 */
export function toPivotTableProps(widgetModel: WidgetModel): PivotTableProps {
  return widgetModelTranslatorPreact.toPivotTableProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a chart widget.
 *
 * @example
 * ```html
<csdk-chart-widget
  *ngIf="chartWidgetProps"
  [chartType]="chartWidgetProps.chartType"
  [dataSource]="chartWidgetProps.dataSource"
  [dataOptions]="chartWidgetProps.dataOptions"
  [filters]="chartWidgetProps.filters"
  [highlights]="chartWidgetProps.highlights"
  [styleOptions]="chartWidgetProps.styleOptions"
/>
 * ```
 *
 * ```ts
import { Component } from '@angular/core';
import {
  type ChartWidgetProps
  WidgetService,
  widgetModelTranslator,
} from '@ethings-os/sdk-ui-angular';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  chartWidgetProps: ChartWidgetProps | null = null;

  constructor(private widgetService: WidgetService) {}

  async ngOnInit(): Promise<void> {
    const widgetModel = await widgetService.getWidgetModel({
      dashboardOid: 'your-dashboard-oid',
      widgetOid: 'your-widget-oid'
    });
    this.chartWidgetProps = widgetModelTranslator.toChartWidgetProps(widgetModel);
  }
}
 * ```
 *
 * Note: this method is not supported for pivot widgets.
 */
export function toChartWidgetProps(widgetModel: WidgetModel): ChartWidgetProps {
  return widgetModelTranslatorPreact.toChartWidgetProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a pivot table widget.
 *
 * @example
 * ```html
<csdk-pivot-table-widget
  *ngIf="pivotWidgetProps"
  [dataSet]="pivotWidgetProps.dataSet"
  [dataOptions]="pivotWidgetProps.dataOptions"
  [filters]="pivotWidgetProps.filters"
  [styleOptions]="pivotWidgetProps.styleOptions"
/>
 * ```
 *
 * ```ts
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
 * ```
 *
 * Note: this method is not supported for chart or table widgets.
 * Use {@link toChartWidgetProps} instead for getting props for the {@link ChartWidgetComponent}.
 */
export function toPivotTableWidgetProps(widgetModel: WidgetModel): PivotTableWidgetProps {
  return widgetModelTranslatorPreact.toPivotTableWidgetProps(widgetModel);
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a text widget.
 *
 * @example
 * ```ts
const widgetModel = await widgetService.getWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid'
});
const textWidgetProps = widgetModelTranslator.toTextWidgetProps(widgetModel);
 * ```
 *
 * Note: this method is not supported for chart or pivot widgets.
 * Use {@link toChartWidgetProps} instead for getting props for the {@link ChartWidgetComponent}.
 * Use {@link toPivotTableWidgetProps} instead for getting props for the pivot table widget.
 */
export function toTextWidgetProps(widgetModel: WidgetModel): TextWidgetProps {
  return widgetModelTranslatorPreact.toTextWidgetProps(widgetModel);
}
