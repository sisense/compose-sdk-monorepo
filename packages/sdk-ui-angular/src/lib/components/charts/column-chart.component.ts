import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ColumnChartProps as ColumnChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link ColumnChartComponent}.
 */
export interface ColumnChartProps
  extends WithoutPreactChartEventProps<ColumnChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
 *
 * @example
 * ```html
 *    <csdk-column-chart
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
 * <img src="media://angular-column-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
  selector: 'csdk-column-chart',
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
export class ColumnChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ColumnChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ColumnChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ColumnChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ColumnChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ColumnChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ColumnChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!ColumnChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ColumnChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'column';
}
