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
 * ```ts
 * import { Component } from '@angular/core';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-polar-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-polar-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [],
 *   };
 * }
 * ```
 * <img src="media://polar-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
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
