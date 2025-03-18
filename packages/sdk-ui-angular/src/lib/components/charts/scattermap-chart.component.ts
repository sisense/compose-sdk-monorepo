import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type ScattermapChartProps as ScattermapChartPropsPreact } from '@sisense/sdk-ui-preact';
import { BaseChartEventProps, WithoutPreactChartEventProps } from '../../types/chart-event-props';
import { DataPointEvent, DataPointEventHandler } from '../../types/data-point';

/**
 * Props of the {@link ScattermapChartComponent}.
 */
export interface ScattermapChartProps
  extends WithoutPreactChartEventProps<ScattermapChartPropsPreact>,
    BaseChartEventProps {
  dataPointClick?: DataPointEventHandler;
}

/**
 * An Angular component that allows to visualize geographical data as data points on a map.
 *
 * @example
 * ```html
 *    <csdk-scattermap-chart
 *      [dataSet]="scattermapChart.dataSet"
 *      [dataOptions]="scattermapChart.dataOptions"
 *      [styleOptions]="scattermapChart.styleOptions"
 *      (dataPointClick)="logArguments($event)"
 *    />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import type { ScattermapStyleOptions,ScattermapChartDataOptions } from '@sisense/sdk-ui-angular';
import * as DM from '../../assets/sample-ecommerce';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  scattermapChart = {
    dataSet: DM.DataSource,
    dataOptions: {
      geo: [DM.Country.Country],
      size: measureFactory.sum(DM.Commerce.Cost, 'Size by Cost'),
      colorBy: {
        column: measureFactory.sum(DM.Commerce.Revenue, 'Color by Revenue'),
        color: 'green',
      },
      details: DM.Category.Category,
    } as ScattermapChartDataOptions,
    styleOptions: {
      markers: {
        fill: 'hollow-bold',
      },
    } as ScattermapStyleOptions,
  };

  logArguments(...args: any[]) {
    console.log(args);
  }
}
 * ```
 * <img src="media://angular-scattermap-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
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
   * @internal
   */
  @Input()
  dataReady: ScattermapChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /** @internal */
  public chartType: ChartType = 'scattermap';
}
