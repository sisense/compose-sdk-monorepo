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
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  @Input()
  chartType!: ChartWidgetProps['chartType'];

  @Input()
  dataSource: ChartWidgetProps['dataSource'];

  @Input()
  dataOptions!: ChartWidgetProps['dataOptions'];

  @Input()
  filters: ChartWidgetProps['filters'];

  @Input()
  highlights: ChartWidgetProps['highlights'];

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

  @Input()
  beforeRender: ChartWidgetProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<ChartWidgetProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<ChartWidgetProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

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

  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

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

  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
