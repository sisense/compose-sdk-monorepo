import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type AreaChartProps as AreaChartPropsPreact } from '@sisense/sdk-ui-preact';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link AreaChartComponent} component.
 */
export interface AreaChartProps
  extends WithoutPreactChartEventProps<AreaChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component similar to a {@link LineChartComponent},
 * but with filled in areas under each line and an option to display them as stacked.
 *
 * @example
 * ```html
 *    <csdk-area-chart
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
 * <img src="media://angular-area-chart-example.png" width="800px" />
 *
 * @group Charts
 */
@Component({
  selector: 'csdk-area-chart',
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
export class AreaChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: AreaChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: AreaChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: AreaChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: AreaChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: AreaChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: AreaChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!AreaChartProps.onDataReady}
   *
   * @category Callbacks
   * @internal
   */
  @Input()
  dataReady: AreaChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'area';
}
