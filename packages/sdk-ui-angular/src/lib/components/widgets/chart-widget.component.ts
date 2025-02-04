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
  ChartWidget,
  type ChartWidgetProps as ChartWidgetPropsPreact,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import type { Arguments } from '../../types/utility-types';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import { template, rootId } from '../../component-wrapper-helpers/template';
import { ChartEventProps, WithoutPreactChartEventProps } from '../../types/chart-event-props';
import { ChartDataPointEvent, ChartDataPointsEvent } from '../../types/data-point';

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
 * import { ChartType } from '@sisense/sdk-ui-angular';
 * import { filterFactory } from '@sisense/sdk-data';
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
 * <img src="media://angular-chart-widget-example.png" width="800px" />
 *
 * @group Dashboards
 */
@Component({
  selector: 'csdk-chart-widget',
  template,
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
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ChartWidgetProps['beforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<ChartDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<ChartDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<ChartDataPointsEvent>();

  private componentAdapter: ComponentAdapter;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(
      () => this.createPreactComponent(),
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
      ],
    );
  }

  /** @internal */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  /** @internal */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  private createPreactComponent() {
    const props = {
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
      onDataPointClick: (
        ...[point, nativeEvent]: Arguments<ChartWidgetPropsPreact['onDataPointClick']>
      ) => this.dataPointClick.emit({ point, nativeEvent }),
      onDataPointContextMenu: (
        ...[point, nativeEvent]: Arguments<ChartWidgetPropsPreact['onDataPointContextMenu']>
      ) => this.dataPointContextMenu.emit({ point, nativeEvent }),
      onDataPointsSelected: (
        ...[points, nativeEvent]: Arguments<ChartWidgetPropsPreact['onDataPointsSelected']>
      ) => this.dataPointsSelect.emit({ points, nativeEvent }),
    };

    return createElement(ChartWidget, props);
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
