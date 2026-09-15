import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  type AreamapChartProps as AreamapChartPropsPreact,
  type ChartType,
} from '@sisense/sdk-ui-preact';

import {
  AreamapChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { AreamapDataPointEvent } from '../../types/data-point';

/**
 * Props of the {@link AreamapChartComponent}.
 */
export interface AreamapChartProps
  extends WithoutPreactChartEventProps<AreamapChartPropsPreact>,
    AreamapChartEventProps {}

/**
 * An Angular component that allows to visualize geographical data as polygons on a map.
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
 *     <csdk-areamap-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-areamap-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     geo: [DM.Country.Country],
 *     color: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   };
 *   styleOptions = { mapType: 'world' };
 * }
 * ```
 * <img src="media://areamap-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-areamap-chart',
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
export class AreamapChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: AreamapChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: AreamapChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: AreamapChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: AreamapChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: AreamapChartProps['styleOptions'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!AreamapChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: AreamapChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<AreamapDataPointEvent>();

  /** @internal */
  public chartType: ChartType = 'areamap';
}
