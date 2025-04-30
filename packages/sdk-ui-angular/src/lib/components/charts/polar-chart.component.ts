import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type PolarChartProps as PolarChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link PolarChartComponent}.
 */
export interface PolarChartProps
  extends WithoutPreactChartEventProps<PolarChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component comparing multiple categories/variables with a spacial perspective in a radial chart.
 *
 * @example
 * ```html
 *    <csdk-polar-chart
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
 * <img src="media://angular-polar-chart-example.png" width="800px" />
 * @group Charts
 */
@Component({
  selector: 'csdk-polar-chart',
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
export class PolarChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: PolarChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: PolarChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: PolarChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: PolarChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: PolarChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: PolarChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!PolarChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: PolarChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'polar';
}
