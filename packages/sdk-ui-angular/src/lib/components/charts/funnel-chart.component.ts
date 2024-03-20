import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType } from '../../sdk-ui-core-exports';
import { type FunnelChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../../types/utility-types';

/**
 * A component representing data progressively decreasing in size or quantity through a funnel shape.
 * See [Funnel Chart](https://docs.sisense.com/main/SisenseLinux/funnel-chart.htm) for more information.
 *
 * @example
 * ```html
 *    <csdk-funnel-chart
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
 * <img src="media://angular-funnel-chart-example.png" width="800px" />
 *
 * @group Charts
 */
@Component({
  selector: 'csdk-funnel-chart',
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
export class FunnelChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: FunnelChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: FunnelChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: FunnelChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: FunnelChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: FunnelChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: FunnelChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<FunnelChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<FunnelChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<FunnelChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'funnel';
}
