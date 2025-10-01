import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type AreaRangeChartProps as AreaRangeChartPropsPreact } from '@ethings-os/sdk-ui-preact';

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
import { measureFactory, filterFactory, Filter } from '@ethings-os/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';
import type { ChartType, RangeChartDataOptions } from '@ethings-os/sdk-ui-angular';

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
 * @group Charts
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
      [dataReady]="dataReady"
      (dataPointClick)="dataPointClick.emit($any($event))"
      (dataPointContextMenu)="dataPointContextMenu.emit($any($event))"
      (dataPointsSelect)="dataPointsSelect.emit($any($event))"
    />
  `,
})
export class AreaRangeChartComponent {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: AreaRangeChartProps['dataSet'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: AreaRangeChartProps['dataOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: AreaRangeChartProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: AreaRangeChartProps['highlights'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: AreaRangeChartProps['styleOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: AreaRangeChartProps['beforeRender'];

  /**
   * {@inheritDoc  @ethings-os/sdk-ui!AreaRangeChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: AreaRangeChartProps['dataReady'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreaRangeChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'arearange';
}
