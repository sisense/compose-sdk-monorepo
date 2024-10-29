import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type SunburstChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../../types/utility-types';

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
 *
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
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
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
  beforeRender: SunburstChartProps['onBeforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!SunburstChartProps.onDataReady}
   *
   * @category Callbacks
   * @internal
   */
  @Input()
  dataReady: SunburstChartProps['onDataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<SunburstChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<SunburstChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<SunburstChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'sunburst';
}
