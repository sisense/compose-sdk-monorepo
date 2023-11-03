import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type FunnelChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Funnel Chart Component
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
