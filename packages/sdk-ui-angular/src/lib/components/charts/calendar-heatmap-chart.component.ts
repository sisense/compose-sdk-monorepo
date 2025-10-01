import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type CalendarHeatmapChartProps as CalendarHeatmapChartPropsPreact } from '@ethings-os/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  CalendarHeatmapChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import {
  CalendarHeatmapDataPointEvent,
  CalendarHeatmapDataPointsEvent,
} from '../../types/data-point';

/**
 * Props of the {@link CalendarHeatmapChartComponent} component.
 */
export interface CalendarHeatmapChartProps
  extends WithoutPreactChartEventProps<CalendarHeatmapChartPropsPreact>,
    CalendarHeatmapChartEventProps {}

/**
 * A component that visualizes values over days in a calendar-like view,
 * making it easy to identify daily patterns or anomalies
 *
 * @example
 * ```html
 *    <csdk-calendar-heatmap-chart
 *      [dataSet]="chart.dataSet"
 *      [dataOptions]="chart.dataOptions"
 *      [highlights]="chart.highlights"
 *      [styleOptions]="chart.styleOptions"
 *    />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
import * as DM from '../../assets/sample-ecommerce';
import type { CalendarHeatmapChartProps } from '@ethings-os/sdk-ui-angular';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  DM = DM;
  chart = {
    dataSet: DM.DataSource,
    dataOptions: {
      date: DM.Commerce.Date.Days,
      value: measureFactory.sum(DM.Commerce.Cost),
    },
    highlights: [
      filterFactory.dateRange(
        DM.Commerce.Date.Days,
        '2009-11-29',
        '2009-12-15'
      ),
    ],
    styleOptions: {
      viewType: 'quarter',
    },
  };
}
 * ```
 * <img src="media://angular-calendar-heatmap-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
  selector: 'csdk-calendar-heatmap-chart',
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
export class CalendarHeatmapChartComponent {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: CalendarHeatmapChartProps['dataSet'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: CalendarHeatmapChartProps['dataOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: CalendarHeatmapChartProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: CalendarHeatmapChartProps['highlights'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: CalendarHeatmapChartProps['styleOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: CalendarHeatmapChartProps['beforeRender'];

  /**
   * {@inheritDoc  @ethings-os/sdk-ui!CalendarHeatmapChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: CalendarHeatmapChartProps['dataReady'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<CalendarHeatmapDataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<CalendarHeatmapDataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CalendarHeatmapChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<CalendarHeatmapDataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'calendar-heatmap';
}
