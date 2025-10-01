import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ColumnChartProps as ColumnChartPropsPreact } from '@ethings-os/sdk-ui-preact';

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
import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';
import type { ChartType } from '@ethings-os/sdk-ui-angular';

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
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ColumnChartProps['dataSet'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ColumnChartProps['dataOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ColumnChartProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ColumnChartProps['highlights'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ColumnChartProps['styleOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ColumnChartProps['beforeRender'];

  /**
   * {@inheritDoc  @ethings-os/sdk-ui!ColumnChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ColumnChartProps['dataReady'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'column';
}
