import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type AreaRangeChartProps as AreaRangeChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link AreaRangeChartComponent}.
 */
export interface AreaRangeChartProps
  extends WithoutPreactChartEventProps<AreaRangeChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component that displays a range of data over a given time period or across multiple categories.
 * It is particularly useful for visualizing the minimum and maximum values in a dataset, along with
 * the area between these values.
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
 *     <csdk-area-range-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-area-range-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [
 *       {
 *         title: 'Revenue',
 *         upperBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 1.4, 'Upper Revenue'),
 *         lowerBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 0.6, 'Lower Revenue'),
 *       },
 *     ],
 *     breakBy: [],
 *   };
 * }
 * ```
 *
 * <img src="media://area-range-chart-example-1.png" width="700px" />
 *
 * The same range broken down by condition:
 *
 * ```ts
 * dataOptions = {
 *   category: [DM.Commerce.Date.Quarters],
 *   value: [
 *     {
 *       title: 'Revenue',
 *       upperBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 1.4, 'Upper Revenue'),
 *       lowerBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 0.6, 'Lower Revenue'),
 *     },
 *   ],
 *   breakBy: [DM.Commerce.Condition],
 * };
 * ```
 *
 * <img src="media://area-range-chart-example-2.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-area-range-chart',
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
export class AreaRangeChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: AreaRangeChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: AreaRangeChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: AreaRangeChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: AreaRangeChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: AreaRangeChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: AreaRangeChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!AreaRangeChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: AreaRangeChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'arearange';
}
