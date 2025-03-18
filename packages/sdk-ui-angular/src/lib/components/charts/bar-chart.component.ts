import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type BarChartProps as BarChartPropsPreact } from '@sisense/sdk-ui-preact';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link BarChartComponent}.
 */
export interface BarChartProps
  extends WithoutPreactChartEventProps<BarChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
 *
 * @example
 * ```html
 *    <csdk-bar-chart
 *      [dataSet]="chart.dataSet"
 *      [dataOptions]="chart.dataOptions"
 *      [highlights]="filters"
 *      [beforeRender]="onBeforeRender"
 *      (dataPointClick)="logArguments($event)"
 *      (dataPointContextMenu)="logArguments($event)"
 *      (dataPointsSelect)="logArguments($event)"
 *    />
 * ```
 *
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
 * <img src="media://angular-bar-chart-example.png" width="800px" />
 *
 * @group Charts
 */
@Component({
  selector: 'csdk-bar-chart',
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
export class BarChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: BarChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: BarChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: BarChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: BarChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: BarChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: BarChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!BarChartProps.onDataReady}
   *
   * @category Callbacks
   * @internal
   */
  @Input()
  dataReady: BarChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'bar';
}
