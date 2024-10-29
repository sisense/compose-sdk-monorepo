import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type BarChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../../types/utility-types';

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
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
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
  beforeRender: BarChartProps['onBeforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!BarChartProps.onDataReady}
   *
   * @category Callbacks
   * @internal
   */
  @Input()
  dataReady: BarChartProps['onDataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'bar';
}
