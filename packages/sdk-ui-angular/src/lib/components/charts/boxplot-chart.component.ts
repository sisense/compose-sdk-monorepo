import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type BoxplotChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../../types/utility-types';

/**
 * An Angular component representing data in a way that visually describes the distribution, variability,
 * and center of a data set along an axis.
 * See [Boxplot Chart](https://docs.sisense.com/main/SisenseLinux/box-and-whisker-plot.htm) for more information.
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
 *    /> * ```
 * ```ts
import { Component } from '@angular/core';
import { filterFactory } from '@sisense/sdk-data';
import type { BoxplotChartDataOptions } from '@sisense/sdk-ui-angular';
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
 *
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
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
    />
  `,
})
export class BoxplotChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: BoxplotChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: BoxplotChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: BoxplotChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: BoxplotChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: BoxplotChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: BoxplotChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<BoxplotChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<BoxplotChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<BoxplotChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'boxplot';
}
