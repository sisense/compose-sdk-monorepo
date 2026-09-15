import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type TreemapChartProps as TreemapChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link TreemapChartComponent}.
 */
export interface TreemapChartProps
  extends WithoutPreactChartEventProps<TreemapChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component displaying hierarchical data in the form of nested rectangles.
 * This type of chart can be used instead of a column chart for comparing a large number of categories and sub-categories.
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
 *     <csdk-treemap-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-treemap-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [{ column: DM.Commerce.Condition, isColored: true }, DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue)],
 *   };
 * }
 * ```
 * <img src="media://treemap-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-treemap-chart',
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
export class TreemapChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: TreemapChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: TreemapChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: TreemapChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: TreemapChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: TreemapChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: TreemapChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!TreemapChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: TreemapChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'treemap';
}
