import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type SankeyChartProps as SankeyChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link SankeyChartComponent}.
 */
export interface SankeyChartProps
  extends WithoutPreactChartEventProps<SankeyChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component that visualizes flow and volume between nodes using a Sankey diagram.
 *
 * Node width represents the total flow through that node; link width represents the flow
 * between two connected nodes.
 *
 * @example
 * ```ts
 * import { Component } from '@angular/core';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-sankey-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-sankey-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
 *     value: measureFactory.sum(DM.Commerce.Revenue),
 *   };
 *   styleOptions = {
 *     orientation: 'horizontal',
 *     nodeAlignment: 'top',
 *   };
 * }
 * ```
 * <img src="media://sankey-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-sankey-chart',
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
export class SankeyChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: SankeyChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: SankeyChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: SankeyChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: SankeyChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: SankeyChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: SankeyChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!SankeyChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: SankeyChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'sankey';
}
