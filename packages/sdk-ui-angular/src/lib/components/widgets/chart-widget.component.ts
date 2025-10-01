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
} from '@ethings-os/sdk-ui-preact';

import {
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

/**
 * Props of the {@link ChartWidgetComponent}.
 */
export interface ChartWidgetProps
  extends WithoutPreactChartEventProps<ChartWidgetPropsPreact>,
    ChartEventProps {}

/**
 * The Chart Widget component extending {@link ChartComponent} to support widget style options.
 *
 * @example
 * ```html
 * <csdk-chart-widget
 *   [chartType]="chartWidget.chartType"
 *   [dataSource]="chartWidget.dataSource"
 *   [dataOptions]="chartWidget.dataOptions"
 *   [highlights]="filters"
 *   [title]="chartWidget.title"
 *   [description]="chartWidget.description"
 *   [beforeRender]="onBeforeRender"
 *   (dataPointClick)="logArguments($event)"
 *   (dataPointContextMenu)="logArguments($event)"
 *   (dataPointsSelect)="logArguments($event)"
 * />
 * ```
 * ```ts
 * import { Component } from '@angular/core';
 * import { ChartType } from '@ethings-os/sdk-ui-angular';
 * import { filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../../assets/sample-healthcare-model';
 *
 * @Component({
 *   selector: 'app-widgets',
 *   templateUrl: './widgets.component.html',
 *   styleUrls: ['./widgets.component.scss'],
 * })
 * export class WidgetsComponent {
 *   filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
 *   chartWidget = {
 *     chartType: 'column' as ChartType,
 *     dataSource: DM.DataSource,
 *     dataOptions: {
 *       category: [DM.Divisions.Divison_name],
 *       value: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
 *       breakBy: [],
 *     },
 *     title: 'Chart Title',
 *     description: 'Chart Description',
 *   };
 *  logArguments(...args: any[]) {
 *   console.log(args);
 * }
 *
 * onBeforeRender(options: any) {
 *   console.log('beforeRender');
 *   console.log(options);
 *   return options;
 * }
 *
 * }
 * ```
 * <img src="media://angular-chart-widget-example.png" width="500px" />
 * @group Dashboards
 */
@Component({
  selector: 'csdk-chart-widget',
  template,
  styles,
})
export class ChartWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.chartType}
   *
   * @category Chart
   */
  @Input()
  chartType!: ChartWidgetProps['chartType'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.dataSource}
   *
   * @category Data
   */
  @Input()
  dataSource: ChartWidgetProps['dataSource'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ChartWidgetProps['dataOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ChartWidgetProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ChartWidgetProps['highlights'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.styleOptions}
   *
   * @category Widget
   */
  @Input()
  styleOptions: ChartWidgetProps['styleOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.drilldownOptions}
   *
   * @category Widget
   * @internal
   */
  @Input()
  drilldownOptions: ChartWidgetProps['drilldownOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.title}
   *
   * @category Widget
   */
  @Input()
  title: ChartWidgetProps['title'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.description}
   *
   * @category Widget
   */
  @Input()
  description: ChartWidgetProps['description'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.highlightSelectionDisabled}
   *
   * @category Widget
   */
  @Input()
  highlightSelectionDisabled: ChartWidgetProps['highlightSelectionDisabled'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ChartWidgetProps['beforeRender'];

  /**
   * {@inheritDoc  @ethings-os/sdk-ui!ChartWidgetProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ChartWidgetProps['dataReady'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<ChartDataPointClickEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<ChartDataPointContextMenuEvent>();

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onDataPointsSelected}
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
