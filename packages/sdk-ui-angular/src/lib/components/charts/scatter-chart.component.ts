import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ScatterChartProps as ScatterChartPropsPreact } from '@sisense/sdk-ui-preact';

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
 * ```ts
 * import { Component } from '@angular/core';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-scatter-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-scatter-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     x: DM.Category.CategoryID,
 *     y: measureFactory.sum(DM.Commerce.Revenue),
 *     breakByColor: DM.Commerce.Gender,
 *   };
 *   styleOptions = {
 *     yAxis: { enabled: true, logarithmic: true, title: { enabled: true, text: 'Total Revenue' } },
 *   };
 * }
 * ```
 * <img src="media://scatter-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
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
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ScatterChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: ScatterChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ScatterChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ScatterChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ScatterChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ScatterChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!ScatterChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ScatterChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<ScatterDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<ScatterDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<ScatterDataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'scatter';
}
