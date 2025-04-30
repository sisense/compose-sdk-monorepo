import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type SunburstChartProps as SunburstChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link SunburstChartComponent}.
 */
export interface SunburstChartProps
  extends WithoutPreactChartEventProps<SunburstChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component displaying hierarchical data in the form of nested slices.
 * This type of chart can be used instead of a pie chart for comparing a large number of categories and sub-categories.
 *
 * @example
 * ```html
 *    <csdk-sunburst-chart
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
 * <img src="media://angular-sunburst-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
  selector: 'csdk-sunburst-chart',
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
export class SunburstChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: SunburstChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: SunburstChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: SunburstChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: SunburstChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: SunburstChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: SunburstChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!SunburstChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: SunburstChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'sunburst';
}
