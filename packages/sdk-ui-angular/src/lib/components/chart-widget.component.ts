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
  type ChartWidgetProps,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';
import type { Arguments, ArgumentsAsObject } from '../utility-types';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { template, rootId } from '../component-wrapper-helpers/template';

/**
 * The Chart Widget component extending {@link ChartComponent} to support widget style options.
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
   * @category Chart
   */
  @Input()
  styleOptions: ChartWidgetProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.widgetStyleOptions}
   *
   * @category Widget
   */
  @Input()
  widgetStyleOptions: ChartWidgetProps['widgetStyleOptions'];

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
  beforeRender: ChartWidgetProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<ChartWidgetProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<ChartWidgetProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<ChartWidgetProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

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
      widgetStyleOptions: this.widgetStyleOptions,
      drilldownOptions: this.drilldownOptions,
      title: this.title,
      description: this.description,
      highlightSelectionDisabled: this.highlightSelectionDisabled,
      onBeforeRender: this.beforeRender?.bind(this),
      onDataPointClick: (
        ...[point, nativeEvent]: Arguments<ChartWidgetProps['onDataPointClick']>
      ) => this.dataPointClick.emit({ point, nativeEvent }),
      onDataPointContextMenu: (
        ...[point, nativeEvent]: Arguments<ChartWidgetProps['onDataPointContextMenu']>
      ) => this.dataPointContextMenu.emit({ point, nativeEvent }),
      onDataPointsSelected: (
        ...[points, nativeEvent]: Arguments<ChartWidgetProps['onDataPointsSelected']>
      ) => this.dataPointsSelect.emit({ points, nativeEvent }),
    };

    return createElement(ChartWidget, props);
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
