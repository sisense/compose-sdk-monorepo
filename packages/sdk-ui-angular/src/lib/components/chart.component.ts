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
import { Chart, type ChartProps, ComponentAdapter, createElement } from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';
import type { Arguments, ArgumentsAsObject } from '../utility-types';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';

/**
 * Chart Component
 */
@Component({
  selector: 'csdk-chart',
  template: `<div #preact></div>`,
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('preact')
  preactRef!: ElementRef<HTMLDivElement>;

  @Input('chartType')
  chartType!: ChartProps['chartType'];

  @Input('dataSet')
  dataSet: ChartProps['dataSet'];

  @Input('dataOptions')
  dataOptions!: ChartProps['dataOptions'];

  @Input('filters')
  filters: ChartProps['filters'];

  @Input('highlights')
  highlights: ChartProps['highlights'];

  @Input('styleOptions')
  styleOptions: ChartProps['styleOptions'];

  @Input('beforeRender')
  beforeRender: ChartProps['onBeforeRender'];

  @Output('dataPointClick')
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<ChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output('dataPointContextMenu')
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<ChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output('dataPointsSelect')
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<ChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
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
      dataSet: this.dataSet,
      dataOptions: this.dataOptions,
      filters: this.filters,
      highlights: this.highlights,
      styleOptions: this.styleOptions,
      onBeforeRender: this.beforeRender?.bind(this),
      onDataPointClick: (...[point, nativeEvent]: Arguments<ChartProps['onDataPointClick']>) =>
        this.dataPointClick.emit({ point, nativeEvent }),
      onDataPointContextMenu: (
        ...[point, nativeEvent]: Arguments<ChartProps['onDataPointContextMenu']>
      ) => this.dataPointContextMenu.emit({ point, nativeEvent }),
      onDataPointsSelected: (
        ...[points, nativeEvent]: Arguments<ChartProps['onDataPointsSelected']>
      ) => this.dataPointsSelect.emit({ points, nativeEvent }),
    };

    return createElement(Chart, props);
  }

  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
