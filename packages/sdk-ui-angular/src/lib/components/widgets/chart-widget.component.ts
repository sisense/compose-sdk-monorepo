import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ChartWidget as ChartWidgetPreact,
  type ChartWidgetProps as ChartWidgetPropsPreact,
  ComponentAdapter,
} from '@sisense/sdk-ui-preact';

import {
  createPluginContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import { ChartEventProps, WithoutPreactChartEventProps } from '../../types/chart-event-props';
import {
  ChartDataPointClickEvent,
  ChartDataPointContextMenuEvent,
  ChartDataPointsEvent,
} from '../../types/data-point';
import type { Arguments } from '../../types/utility-types';
import { type ChartWidgetConfig } from './widget-config';

/**
 * Props of the {@link ChartWidgetComponent}.
 */
export interface ChartWidgetProps
  extends Omit<WithoutPreactChartEventProps<ChartWidgetPropsPreact>, 'config'>,
    ChartEventProps {
  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.config}
   *
   * @category Widget
   */
  config?: ChartWidgetConfig;
}

/**
 * The Chart Widget component extending {@link ChartComponent} to support widget style options.
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
 *     <csdk-chart-widget
 *       [title]="title"
 *       [description]="description"
 *       [chartType]="chartType"
 *       [dataSource]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *     ></csdk-chart-widget>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   // Change this to "line" to see a line chart
 *   chartType = 'column';
 *   title = 'Revenue by Quarter';
 *   description = 'This chart shows the total revenue by quarter.';
 *   dataOptions = {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [],
 *   };
 * }
 * ```
 * <img src="media://chart-widget-example-1.png" width="700px" />
 * @group Dashboards
 */
@Component({
  standalone: false,
  selector: 'csdk-chart-widget',
  template,
  styles,
})
export class ChartWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.chartType}
   *
   * @category Chart
   */
  @Input()
  chartType!: ChartWidgetProps['chartType'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.dataSource}
   *
   * @category Data
   */
  @Input()
  dataSource: ChartWidgetProps['dataSource'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ChartWidgetProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ChartWidgetProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ChartWidgetProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.styleOptions}
   *
   * @category Widget
   */
  @Input()
  styleOptions: ChartWidgetProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.config}
   *
   * @category Widget
   */
  @Input()
  config: ChartWidgetProps['config'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.id}
   *
   * @category Widget
   */
  @Input()
  id: ChartWidgetProps['id'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.drilldownOptions}
   *
   * @category Widget
   * @internal
   */
  @Input()
  drilldownOptions: ChartWidgetProps['drilldownOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.title}
   *
   * @category Widget
   */
  @Input()
  title: ChartWidgetProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.description}
   *
   * @category Widget
   */
  @Input()
  description: ChartWidgetProps['description'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.highlightSelectionDisabled}
   *
   * @category Widget
   */
  @Input()
  highlightSelectionDisabled: ChartWidgetProps['highlightSelectionDisabled'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ChartWidgetProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!ChartWidgetProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ChartWidgetProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<ChartDataPointClickEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<ChartDataPointContextMenuEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<ChartDataPointsEvent>();

  private componentAdapter: ComponentAdapter<typeof ChartWidgetPreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(ChartWidgetPreact, [
      createPluginContextConnector(this.sisenseContextService),
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
    ]);
  }

  /** @internal */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  /** @internal */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  private getPreactComponentProps(): ChartWidgetPropsPreact {
    return {
      chartType: this.chartType,
      dataSource: this.dataSource,
      dataOptions: this.dataOptions,
      filters: this.filters,
      highlights: this.highlights,
      styleOptions: this.styleOptions,
      config: this.config,
      id: this.id,
      drilldownOptions: this.drilldownOptions,
      title: this.title,
      description: this.description,
      highlightSelectionDisabled: this.highlightSelectionDisabled,
      onBeforeRender: this.beforeRender?.bind(this),
      onDataReady: this.dataReady?.bind(this),
      onDataPointClick: (
        ...[point, nativeEvent]: Arguments<ChartWidgetPropsPreact['onDataPointClick']>
      ) => this.dataPointClick.emit({ point, nativeEvent } as ChartDataPointClickEvent),
      onDataPointContextMenu: (
        ...[point, nativeEvent]: Arguments<ChartWidgetPropsPreact['onDataPointContextMenu']>
      ) => this.dataPointContextMenu.emit({ point, nativeEvent } as ChartDataPointContextMenuEvent),
      onDataPointsSelected: (
        ...[points, nativeEvent]: Arguments<ChartWidgetPropsPreact['onDataPointsSelected']>
      ) => this.dataPointsSelect.emit({ points, nativeEvent } as ChartDataPointsEvent),
    };
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
