import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type LineChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../../types/utility-types';

/**
 * A component displaying data as a series of points connected by a line. Used to show trends or changes over time.
 *
 * @example
 * ```html
 *    <csdk-line-chart
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
 * <img src="media://angular-line-chart-example.png" width="800px" />
 *
 * @group Charts
 */
@Component({
  selector: 'csdk-line-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
      [styleOptions]="styleOptions"
      [beforeRender]="beforeRender"
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
    />
  `,
})
export class LineChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: LineChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  dataOptions!: LineChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: LineChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: LineChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: LineChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: LineChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'line';
}
