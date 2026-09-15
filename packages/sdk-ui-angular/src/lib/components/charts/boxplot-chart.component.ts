import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type BoxplotChartProps as BoxplotChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  BoxplotChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { BoxplotDataPointEvent, BoxplotDataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link BoxplotChartComponent}.
 */
export interface BoxplotChartProps
  extends WithoutPreactChartEventProps<BoxplotChartPropsPreact>,
    BoxplotChartEventProps {}

/**
 * An Angular component representing data in a way that visually describes the distribution
 * variability, and center of a data set along an axis.
 *
 * @example
 * ```ts
 * import { Component } from '@angular/core';
 * import type { BoxplotChartDataOptions } from '@sisense/sdk-ui-angular';
 * import * as DM from './sample-ecommerce';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-boxplot-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-boxplot-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions: BoxplotChartDataOptions = {
 *     category: [DM.Commerce.Condition],
 *     value: [{ column: DM.Commerce.Cost, name: 'Total Cost' }],
 *     boxType: 'iqr',
 *     outliersEnabled: true,
 *   };
 *   styleOptions = { subtype: 'boxplot/full' };
 * }
 * ```
 * <img src="media://boxplot-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
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
      [dataReady]="dataReady"
      (dataPointClick)="dataPointClick.emit($any($event))"
      (dataPointContextMenu)="dataPointContextMenu.emit($any($event))"
      (dataPointsSelect)="dataPointsSelect.emit($any($event))"
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
  beforeRender: BoxplotChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!BoxplotChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: BoxplotChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<BoxplotDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<BoxplotDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<BoxplotDataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'boxplot';
}
