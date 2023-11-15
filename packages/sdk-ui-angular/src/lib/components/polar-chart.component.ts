import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type PolarChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * A component comparing multiple categories/variables with a spacial perspective in a radial chart.
 * See [Polar Chart](https://docs.sisense.com/main/SisenseLinux/polar-chart.htm) for more information.
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
      [beforeRender]="beforeRender"
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
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
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.highlights}
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
  beforeRender: PolarChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<PolarChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<PolarChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<PolarChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'polar';
}
