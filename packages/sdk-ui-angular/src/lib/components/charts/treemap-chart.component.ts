import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type TreemapChartProps as TreemapChartPropsPreact } from '@sisense/sdk-ui-preact';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

export interface TreemapChartProps
  extends WithoutPreactChartEventProps<TreemapChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component displaying hierarchical data in the form of nested rectangles.
 * This type of chart can be used instead of a column chart for comparing a large number of categories and sub-categories.
 *
 * @example
 * ```html
 *    <csdk-treemap-chart
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
import type { ChartType } from '@sisense/sdk-ui-angular';
import * as DM from '../../assets/sample-healthcare-model';

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
 * <img src="media://angular-treemap-chart-example.png" width="800px" />
 *
 * @group Charts
 */
@Component({
  selector: 'csdk-treemap-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
      [styleOptions]="styleOptions"
      [beforeRender]="beforeRender"
      (dataPointClick)="dataPointClick.emit($any($event))"
      (dataPointContextMenu)="dataPointContextMenu.emit($any($event))"
      (dataPointsSelect)="dataPointsSelect.emit($any($event))"
    />
  `,
})
export class TreemapChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: TreemapChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: TreemapChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: TreemapChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: TreemapChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: TreemapChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: TreemapChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!TreemapChartProps.onDataReady}
   *
   * @category Callbacks
   * @internal
   */
  @Input()
  dataReady: TreemapChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'treemap';
}
