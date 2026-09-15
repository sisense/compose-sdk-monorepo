import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type CalendarHeatmapChartProps as CalendarHeatmapChartPropsPreact } from '@sisense/sdk-ui-preact';

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
 * ```ts
 * import { Component } from '@angular/core';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-calendar-heatmap-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-calendar-heatmap-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     date: DM.Commerce.Date.Days,
 *     value: { column: measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity') },
 *   };
 *   styleOptions = { viewType: 'quarter' as const };
 * }
 * ```
 * <img src="media://calendar-heatmap-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
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
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: CalendarHeatmapChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: CalendarHeatmapChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: CalendarHeatmapChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: CalendarHeatmapChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: CalendarHeatmapChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: CalendarHeatmapChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!CalendarHeatmapChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: CalendarHeatmapChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<CalendarHeatmapDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<CalendarHeatmapDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<CalendarHeatmapDataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'calendar-heatmap';
}
