import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type PieChartProps as PieChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link PieChartComponent}.
 */
export interface PieChartProps
  extends WithoutPreactChartEventProps<PieChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component representing data in a circular graph with the data shown as slices of a whole,
 * with each slice representing a proportion of the total.
 *
 * @example
 * ```html
 *    <csdk-pie-chart
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
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';
import type { ChartType } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  DM = DM;
  filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
  chart = {
    chartType: 'column' as ChartType,
    dataSet: DM.DataSource,
    dataOptions: {
      category: [DM.Divisions.Divison_name],
      value: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
      breakBy: [],
    },
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
 * <img src="media://angular-pie-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
  selector: 'csdk-pie-chart',
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
export class PieChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: PieChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: PieChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: PieChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: PieChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: PieChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: PieChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!PieChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: PieChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'pie';
}
