import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type LineChartProps as LineChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link LineChartComponent}.
 */
export interface LineChartProps
  extends WithoutPreactChartEventProps<LineChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component displaying data as a series of points connected by a line. Used to show trends or changes over time.
 *
 * @example
 * ```html
 *    <csdk-line-chart
 *      [dataSet]="chart.dataSet"
 *      [dataOptions]="chart.dataOptions"
 *      [highlights]="filters"
 *      [beforeRender]="onBeforeRender"
 *      (dataPointClick)="logArguments($event)"
 *      (dataPointContextMenu)="logArguments($event)"
 *      (dataPointsSelect)="logArguments($event)"
 *    />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory, Filter } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';
import type { ChartType } from '@sisense/sdk-ui-angular';
@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  DM = DM;
  filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
  chart = {
    chartType: 'column' as ChartType,
    dataSet: DM.DataSource,
    dataOptions: {
      category: [DM.Divisions.Divison_name],
      value: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
      breakBy: [],
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
 * <img src="media://angular-line-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
  selector: 'csdk-line-chart',
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
export class LineChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: LineChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: LineChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: LineChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: LineChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: LineChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: LineChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!LineChartProps.onDataReady}
   *
   * @category Callbacks
   * @internal
   */
  @Input()
  dataReady: LineChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'line';
}
