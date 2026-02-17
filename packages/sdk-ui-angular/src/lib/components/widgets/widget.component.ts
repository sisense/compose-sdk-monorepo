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
  type BeforeMenuOpenHandler,
  ComponentAdapter,
  CustomWidgetProps,
  type SoftUnion,
  TextWidgetProps as TextWidgetPropsPreact,
  Widget as WidgetPreact,
  type WidgetProps as WidgetPropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { toPreactWidgetProps } from '../../helpers/widget-props-preact-translator';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import { TextWidgetEventProps, WithoutPreactChartEventProps } from '../../types';
import {
  ChartDataPointsEvent,
  ChartDataPointsEventHandler,
  WidgetDataPointClickEvent,
  WidgetDataPointClickEventHandler,
  WidgetDataPointContextMenuEvent,
  WidgetDataPointContextMenuEventHandler,
} from '../../types/data-point';
import { ChartWidgetProps } from './chart-widget.component';
import { PivotTableWidgetProps } from './pivot-table-widget.component';

/**
 * Props for the text widget.
 */
export interface TextWidgetProps
  extends WithoutPreactChartEventProps<TextWidgetPropsPreact>,
    TextWidgetEventProps {}

/**
 * {@inheritDoc @sisense/sdk-ui!WithCommonWidgetProps}
 */
export type WithCommonWidgetProps<BaseWidget, Type> = BaseWidget & {
  /**
   * Unique identifier of the widget within the container component (dashboard)
   *
   */
  readonly id: string;
  /**
   * Widget type
   */
  widgetType: Type;
  /**
   * Optional handler function to process menu options before opening the context menu.
   *
   * @internal
   */
  beforeMenuOpen?: BeforeMenuOpenHandler;
};

/**
 * Props of the {@link WidgetComponent}.
 */
export type WidgetProps = SoftUnion<
  | WithCommonWidgetProps<ChartWidgetProps, 'chart'>
  | WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'>
  | WithCommonWidgetProps<TextWidgetProps, 'text'>
  | WithCommonWidgetProps<CustomWidgetProps, 'custom'>
> & {
  // Explicitly declare event handlers to prevent Angular's template type checker
  // from inferring intersection types when accessing these properties on WidgetProps.
  // This is needed because WidgetProps is a SoftUnion, and Angular's template compiler
  // dynamically accesses properties at usage time, causing TypeScript to create
  // intersections that are incompatible with CalendarHeatmap's unique event structure.
  dataPointClick?: WidgetDataPointClickEventHandler;
  dataPointContextMenu?: WidgetDataPointContextMenuEventHandler;
  dataPointsSelect?: ChartDataPointsEventHandler;
};

/**
 * Facade component that renders a widget within a dashboard based on the widget type.
 *
 * @example
 * ```html
<!--Component HTML template in example.component.html-->
<csdk-widget
  [id]="widgetProps.id"
  [title]="widgetProps.title"
  [widgetType]="widgetProps.widgetType"
  [chartType]="widgetProps.chartType"
  [dataSource]="widgetProps.dataSource"
  [dataOptions]="widgetProps.dataOptions"
/>
 * ```
 *
 * ```ts
// Component behavior in example.component.ts
import { Component } from '@angular/core';
import { type WidgetProps } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  widgetProps: WidgetProps = {
    id: 'widget-id',
    widgetType: 'chart',
    chartType: 'column',
    title: 'Widget Title',
    dataSource: DM.DataSource,
    dataOptions: {
      category: [DM.Divisions.Divison_name],
      value: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
      breakBy: [],
    },
  };
}
 * ```
 * <img src="media://angular-chart-widget-example.png" width="500px" />
 * @group Dashboards
 */
@Component({
  selector: 'csdk-widget',
  template,
  styles,
})
export class WidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * Unique identifier of the widget
   *
   * @category Widget
   */
  @Input()
  id!: WidgetProps['id'];

  /**
   * Widget type
   *
   * @category Widget
   */
  @Input()
  widgetType!: WidgetProps['widgetType'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.chartType}
   *
   * @category Chart
   */
  @Input()
  chartType: WidgetProps['chartType'];

  /**
   * {@inheritDoc @sisense/sdk-ui!CustomWidgetProps.customWidgetType}
   *
   * @category Widget
   */
  @Input()
  customWidgetType: WidgetProps['customWidgetType'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.dataSource}
   *
   * @category Data
   */
  @Input()
  dataSource: WidgetProps['dataSource'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions: WidgetProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: WidgetProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: WidgetProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.styleOptions}
   *
   * @category Widget
   */
  @Input()
  styleOptions: WidgetProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.drilldownOptions}
   *
   * @category Widget
   */
  @Input()
  drilldownOptions: WidgetProps['drilldownOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.title}
   *
   * @category Widget
   */
  @Input()
  title: WidgetProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.description}
   *
   * @category Widget
   */
  @Input()
  description: WidgetProps['description'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.highlightSelectionDisabled}
   *
   * @category Widget
   * @internal
   */
  @Input()
  highlightSelectionDisabled: WidgetProps['highlightSelectionDisabled'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: WidgetProps['beforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: WidgetProps['dataReady'];

  /**
   * Optional handler function to process menu options before opening the context menu.
   *
   * @category Callbacks
   * @internal
   */
  @Input()
  beforeMenuOpen: WidgetProps['beforeMenuOpen'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<WidgetDataPointClickEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<WidgetDataPointContextMenuEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<ChartDataPointsEvent>();

  private componentAdapter: ComponentAdapter<typeof WidgetPreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(WidgetPreact, [
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

  private getPreactComponentProps(): WidgetPropsPreact {
    return toPreactWidgetProps({
      id: this.id,
      widgetType: this.widgetType,
      chartType: this.chartType,
      customWidgetType: this.customWidgetType,
      dataSource: this.dataSource,
      dataOptions: this.dataOptions,
      filters: this.filters,
      highlights: this.highlights,
      styleOptions: this.styleOptions,
      drilldownOptions: this.drilldownOptions,
      title: this.title,
      description: this.description,
      highlightSelectionDisabled: this.highlightSelectionDisabled,
      beforeRender: this.beforeRender?.bind(this),
      dataReady: this.dataReady?.bind(this),
      beforeMenuOpen: this.beforeMenuOpen?.bind(this),
      dataPointClick: this.dataPointClick.emit.bind(this.dataPointClick),
      dataPointContextMenu: this.dataPointContextMenu.emit.bind(this.dataPointContextMenu),
      dataPointsSelect: this.dataPointsSelect.emit.bind(this.dataPointsSelect),
    } as WidgetProps);
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
