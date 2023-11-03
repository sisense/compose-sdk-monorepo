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
 * Chart Widget Component
 */
@Component({
  selector: 'csdk-chart-widget',
  template,
})
export class ChartWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  @Input()
  chartType!: ChartWidgetProps['chartType'];

  @Input()
  dataSource: ChartWidgetProps['dataSource'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ChartWidgetProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ChartWidgetProps['filters'];

  @Input()
  highlights: ChartWidgetProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ChartWidgetProps['styleOptions'];

  @Input()
  widgetStyleOptions: ChartWidgetProps['widgetStyleOptions'];

  @Input()
  drilldownOptions: ChartWidgetProps['drilldownOptions'];

  @Input()
  title: ChartWidgetProps['title'];

  @Input()
  description: ChartWidgetProps['description'];

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
