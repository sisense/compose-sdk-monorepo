import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type StreamgraphChartProps as StreamgraphChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link StreamgraphChartComponent} component.
 */
export interface StreamgraphChartProps
  extends WithoutPreactChartEventProps<StreamgraphChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component that displays a streamgraph chart.
 *
 * A streamgraph is a type of stacked area chart where areas are displaced around
 * a central axis. It is particularly effective for displaying volume across
 * different categories or over time with a relative scale that emphasizes
 * overall patterns and trends.
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
 *     <csdk-streamgraph-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *     ></csdk-streamgraph-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   };
 * }
 * ```
 * <img src="media://streamgraph-chart-example-1.png" width="700px" />
 *
 * Additional examples:
 *
 * Styled with a visible y-axis, thinned-out x-axis labels, and a legend:
 * ```ts
 * import { Component } from '@angular/core';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-streamgraph-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-streamgraph-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   };
 *   styleOptions = {
 *     yAxis: {
 *       enabled: true,
 *       labels: { enabled: true },
 *       gridLines: false,
 *     },
 *     xAxis: {
 *       intervalJumps: 4,
 *       isIntervalEnabled: true,
 *     },
 *     legend: { enabled: true },
 *   };
 * }
 * ```
 * <img src="media://streamgraph-chart-example-2.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-streamgraph-chart',
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
export class StreamgraphChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: StreamgraphChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: StreamgraphChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: StreamgraphChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: StreamgraphChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: StreamgraphChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: StreamgraphChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!StreamgraphChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: StreamgraphChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'streamgraph';
}
