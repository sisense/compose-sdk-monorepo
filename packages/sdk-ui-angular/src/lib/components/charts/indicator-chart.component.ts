import { Component, Input } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type IndicatorChartProps as IndicatorChartPropsPreact } from '@sisense/sdk-ui-preact';
import {
  BaseChartEventProps,
  HighchartsBasedChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';

export interface IndicatorChartProps
  extends WithoutPreactChartEventProps<IndicatorChartPropsPreact>,
    BaseChartEventProps,
    HighchartsBasedChartEventProps {}

/**
 * A component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
 *
 * @example
 * ```html
 *    <csdk-indicator-chart
 *      [dataSet]="indicator.dataSet"
 *      [dataOptions]="indicator.dataOptions"
 *      [filters]="filters"
 *      [styleOptions]="indicator.styleOptions"
 *    />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';
import type { IndicatorStyleOptions } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  DM = DM;
  filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
  indicator = {
    dataSet: DM.DataSource,
    dataOptions: {
      value: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
      secondary: [measureFactory.sum(DM.Admissions.Diagnosis_ID)],
    },
    styleOptions: {
      indicatorComponents: {
        title: {
          shouldBeShown: true,
          text: 'Total Cost_of_admission',
        },
        secondaryTitle: {
          text: 'Total Diagnosis_ID',
        },
        ticks: {
          shouldBeShown: true,
        },
        labels: {
          shouldBeShown: true,
        },
      },
      subtype: 'indicator/gauge',
      skin: 2,
    } as IndicatorStyleOptions,
  };

}
 * ```
 * <img src="media://angular-indicator-chart-example.png" width="800px" />
 *
 * @group Charts
 */
@Component({
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
   * @internal
   */
  @Input()
  dataReady: IndicatorChartProps['dataReady'];

  /** @internal */
  public chartType: ChartType = 'indicator';
}
