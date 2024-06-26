import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type AreaRangeChartProps } from '@sisense/sdk-ui-preact';
import { ArgumentsAsObject } from '../../types';

/**
 * A component that displays a range of data over a given time period or across multiple categories.
 * It is particularly useful for visualizing the minimum and maximum values in a dataset, along with
 * the area between these values.
 *
 * @example
 * ```html
 *    <csdk-area-range-chart
 *      [dataSet]="chart.dataSet"
 *      [dataOptions]="chart.dataOptions"
 *      [highlights]="filters"
 *      [beforeRender]="onBeforeRender"
 *      (dataPointClick)="logArguments($event)"
 *      (dataPointContextMenu)="logArguments($event)"
 *      (dataPointsSelect)="logArguments($event)"
 *    />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory, Filter } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';
import type { ChartType, RangeChartDataOptions } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  DM = DM;
  filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
  chart = {
    chartType: 'arearange' as ChartType,
    dataSet: DM.DataSource,
    dataOptions: {
      category: [DM.Admissions.Admission_Time.Years],
      value: [
        {
            title: 'Admission Cost Range',
            upperBound: measureFactory.multiply(
              measureFactory.sum(DM.Admissions.Cost_of_admission, 'Lower Admission'),
              0.6,
            ),
            lowerBound: measureFactory.multiply(
              measureFactory.sum(DM.Admissions.Cost_of_admission, 'Upper Admission'),
              1.4,
             ),
        }
      ],
      breakBy: [],
    } as RangeChartDataOptions,
  };

  onBeforeRender(options: any) {
    console.log('beforeRender');
    console.log(options);
    return options;
  }

  logArguments(...args: any[]) {
    console.log(args);
  }
}
 * ```
 * <img src="media://angular-area-range-chart-example.png" width="800px" />
 *
 * @group Charts
 * @beta
 */
@Component({
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
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
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
  beforeRender: AreaRangeChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<AreaRangeChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<AreaRangeChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<AreaRangeChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'arearange';
}
