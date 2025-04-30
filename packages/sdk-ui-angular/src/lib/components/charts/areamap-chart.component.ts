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
 * ```html
 *    <csdk-areamap-chart
 *      [dataSet]="areamapChart.dataSet"
 *      [dataOptions]="areamapChart.dataOptions"
 *      [styleOptions]="areamapChart.styleOptions"
 *      (dataPointClick)="logArguments($event)"
 *    />
 * ```
 *
 * ```ts
import { Component } from '@angular/core';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-ecommerce';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  areamapChart = {
    dataSet: DM.DataSource,
    dataOptions: {
      geo: [DM.Country.Country],
      color: [measureFactory.sum(DM.Commerce.Revenue, 'Color by Revenue')],
    } as AreamapChartDataOptions,
    styleOptions: {
      mapType: 'world',
    } as AreamapStyleOptions,
  };

  logArguments(...args: any[]) {
    console.log(args);
  }
}
 * ```
 * <img src="media://angular-areamap-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
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
