import { Component, Input } from '@angular/core';
import { type IndicatorChartProps as IndicatorChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  IndicatorChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';

/**
 * Props of the {@link IndicatorChartComponent}.
 */
export interface IndicatorChartProps
  extends WithoutPreactChartEventProps<IndicatorChartPropsPreact>,
    IndicatorChartEventProps {}

/**
 * A component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
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
 *     <csdk-indicator-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-indicator-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     max: [measureFactory.constant(125000000)],
 *   };
 *   styleOptions = {
 *     indicatorComponents: {
 *       title: { shouldBeShown: true, text: 'Total Revenue' },
 *       ticks: { shouldBeShown: false },
 *       labels: { shouldBeShown: true },
 *     },
 *     subtype: 'indicator/gauge',
 *     skin: 2,
 *   };
 * }
 * ```
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 *
 * Numeric indicator variant with a secondary value:
 *
 * ```ts
 * import { Component } from '@angular/core';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-indicator-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-indicator-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     // secondary value is optional
 *     secondary: [measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity')],
 *   };
 * }
 * ```
 *
 * <img src="media://indicator-chart-example-3.png" width="400px" />
 *
 * Ticker style indicator variant:
 *
 * ```ts
 * import { Component } from '@angular/core';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-indicator-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-indicator-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     // secondary value is optional
 *     secondary: [measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity')],
 *   };
 *   styleOptions = {
 *     indicatorComponents: {
 *       title: { shouldBeShown: true, text: 'Total Revenue' },
 *       ticks: { shouldBeShown: false },
 *       labels: { shouldBeShown: true },
 *     },
 *     subtype: 'indicator/gauge',
 *     skin: 2,
 *     forceTickerView: true,
 *     tickerBarHeight: 30,
 *     width: 400,
 *   };
 * }
 * ```
 *
 * <img src="media://indicator-chart-example-4.png" width="400px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-indicator-chart',
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
    />
  `,
})
export class IndicatorChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: IndicatorChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: IndicatorChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: IndicatorChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: IndicatorChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: IndicatorChartProps['styleOptions'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!IndicatorChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: IndicatorChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!IndicatorChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: IndicatorChartProps['dataReady'];

  /** @internal */
  public chartType: ChartType = 'indicator';
}
