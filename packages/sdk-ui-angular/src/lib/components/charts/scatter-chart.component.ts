import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ScatterChartProps as ScatterChartPropsPreact } from '@ethings-os/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  ScatterChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { ScatterDataPointEvent, ScatterDataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link ScatterChartComponent}.
 */
export interface ScatterChartProps
  extends WithoutPreactChartEventProps<ScatterChartPropsPreact>,
    ScatterChartEventProps {}

/**
 * A component displaying the distribution of two variables on an X-Axis, Y-Axis,
 * and two additional fields of data that are shown as colored circles scattered across the chart.
 *
 * **Point**: A field that for each of its members a scatter point is drawn. The maximum amount of data points is 500.
 *
 * **Size**: An optional field represented by the size of the circles.
 * If omitted, all scatter points are equal in size. If used, the circle sizes are relative to their values.
 *
 * @example
 * ```html
 *    <csdk-scatter-chart
 *      [dataSet]="scatter.dataSet"
 *      [dataOptions]="scatter.dataOptions"
 *      [highlights]="filters"
 *      [beforeRender]="onBeforeRender"
 *      (dataPointClick)="logArguments($event)"
 *      (dataPointContextMenu)="logArguments($event)"
 *      (dataPointsSelect)="logArguments($event)"
 *    />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  DM = DM;
  filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
  scatter = {
    dataSet: DM.DataSource,
    dataOptions: {
      x: DM.Admissions.Room_ID,
      y: measureFactory.sum(DM.Admissions.Cost_of_admission),
    },
  };

  onBeforeRender(options: any) {
    console.log('beforeRender');
    console.log(options);
    return options;
  }

  logArguments(...args: any[]) {
    console.log(args);
  }
}
 * ```
 * <img src="media://angular-scatter-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
  selector: 'csdk-scatter-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
      [styleOptions]="styleOptions"
      [beforeRender]="beforeRender"
      [dataReady]="dataReady"
      (dataPointClick)="dataPointClick.emit($any($event))"
      (dataPointContextMenu)="dataPointContextMenu.emit($any($event))"
      (dataPointsSelect)="dataPointsSelect.emit($any($event))"
    />
  `,
})
export class ScatterChartComponent {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ScatterChartProps['dataSet'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: ScatterChartProps['dataOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ScatterChartProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ScatterChartProps['highlights'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ScatterChartProps['styleOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ScatterChartProps['beforeRender'];

  /**
   * {@inheritDoc  @ethings-os/sdk-ui!ScatterChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ScatterChartProps['dataReady'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<ScatterDataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<ScatterDataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<ScatterDataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'scatter';
}
