import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type BoxplotChartProps as BoxplotChartPropsPreact } from '@ethings-os/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  BoxplotChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { BoxplotDataPointEvent, BoxplotDataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link BoxplotChartComponent}.
 */
export interface BoxplotChartProps
  extends WithoutPreactChartEventProps<BoxplotChartPropsPreact>,
    BoxplotChartEventProps {}

/**
 * An Angular component representing data in a way that visually describes the distribution
 * variability, and center of a data set along an axis.
 *
 * @example
 * ```html
 *    <csdk-boxplot-chart
 *      [dataSet]="boxplotChart.dataSet"
 *      [dataOptions]="boxplotChart.dataOptions"
 *      [highlights]="boxplotChart.highlights"
 *      [beforeRender]="onBeforeRender"
 *      (dataPointClick)="logArguments($event)"
 *      (dataPointContextMenu)="logArguments($event)"
 *      (dataPointsSelect)="logArguments($event)"
 *    />
 * ```
 *
 * ```ts
import { Component } from '@angular/core';
import { filterFactory } from '@ethings-os/sdk-data';
import type { BoxplotChartDataOptions } from '@ethings-os/sdk-ui-angular';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  boxplotChart = {
    dataSet: DM.DataSource,
    dataOptions: {
      category: [DM.Divisions.Divison_name],
      value: [DM.Admissions.TimeofStay],
      boxType: 'iqr',
      outliersEnabled: true,
    } as BoxplotChartDataOptions,
    highlights: [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])],
  };

  logArguments(...args: any[]) {
    console.log(args);
  }
}
 * ```
 * <img src="media://angular-boxplot-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
  selector: 'csdk-boxplot-chart',
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
export class BoxplotChartComponent {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: BoxplotChartProps['dataSet'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: BoxplotChartProps['dataOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: BoxplotChartProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: BoxplotChartProps['highlights'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: BoxplotChartProps['styleOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: BoxplotChartProps['beforeRender'];

  /**
   * {@inheritDoc  @ethings-os/sdk-ui!BoxplotChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: BoxplotChartProps['dataReady'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<BoxplotDataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<BoxplotDataPointEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<BoxplotDataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'boxplot';
}
