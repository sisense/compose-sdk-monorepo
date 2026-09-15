import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ScattermapChartProps as ScattermapChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  ScattermapChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { ScattermapDataPointEvent } from '../../types/data-point';

/**
 * Props of the {@link ScattermapChartComponent}.
 */
export interface ScattermapChartProps
  extends WithoutPreactChartEventProps<ScattermapChartPropsPreact>,
    ScattermapChartEventProps {}

/**
 * An Angular component that allows to visualize geographical data as data points on a map.
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
 *     <csdk-scattermap-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-scattermap-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     geo: [DM.Country.Country],
 *     size: measureFactory.sum(DM.Commerce.Cost, 'Size by Cost'),
 *     colorBy: {
 *       column: measureFactory.rank(measureFactory.sum(DM.Commerce.Revenue, 'Color by Revenue Rank')),
 *       color: { type: 'range', steps: 7, minColor: '#cf9270', maxColor: '#3900b3' },
 *     },
 *     details: DM.Brand.Brand,
 *   };
 * }
 * ```
 * <img src="media://scattermap-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-scattermap-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
      [styleOptions]="styleOptions"
      [dataReady]="dataReady"
      (dataPointClick)="dataPointClick.emit($any($event))"
    />
  `,
})
export class ScattermapChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ScattermapChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ScattermapChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ScattermapChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ScattermapChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ScattermapChartProps['styleOptions'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!ScattermapChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ScattermapChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<ScattermapDataPointEvent>();

  /** @internal */
  public chartType: ChartType = 'scattermap';
}
