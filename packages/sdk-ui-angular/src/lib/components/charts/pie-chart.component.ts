import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type PieChartProps as PieChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link PieChartComponent}.
 */
export interface PieChartProps
  extends WithoutPreactChartEventProps<PieChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component representing data in a circular graph with the data shown as slices of a whole,
 * with each slice representing a proportion of the total.
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
 *     <csdk-pie-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-pie-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   };
 *   styleOptions = { subtype: 'pie/classic' };
 * }
 * ```
 * <img src="media://pie-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-pie-chart',
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
export class PieChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: PieChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: PieChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: PieChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: PieChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: PieChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: PieChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!PieChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: PieChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'pie';
}
