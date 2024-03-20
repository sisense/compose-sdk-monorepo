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
  ComponentAdapter,
  createElement,
  DrilldownWidget,
  type DrilldownWidgetProps,
  type ContextMenuProps,
  type CustomDrilldownResult as CustomDrilldownResultBase,
  type ComponentRenderer,
  DrilldownBreadcrumbsProps,
  createWrapperElement,
  createWrapperElementHandler,
  createComponentRenderer,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import type { Arguments } from '../../types/utility-types';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import {
  templateWithContent,
  rootId,
  rootContentId,
} from '../../component-wrapper-helpers/template';

export type CustomDrilldownResult = CustomDrilldownResultBase & {
  breadcrumbsComponent?: {
    render: ComponentRenderer;
  };
};

/**
 * An Angular component designed to add drilldown functionality to any type of chart.
 *
 * It acts as a wrapper around a given chart component, enhancing it with drilldown capabilities
 *
 * The widget offers several features including:
 * - A context menu for initiating drilldown actions (can be provided as a custom component)
 * - Breadcrumbs that not only allow for drilldown selection slicing but also
 * provide an option to clear the selection (can be provided as a custom component)
 * - Filters specifically created for drilldown operation
 * - An option to navigate to the next drilldown dimension
 *
 * When an `initialDimension` is specified, the `drilldownDimension` will automatically inherit its value,
 * even before any points on the chart are selected.
 * This allows for complete control over the chart's dimensions to be handed over to the DrilldownWidget
 *
 * @example
 * An example of using the `csdk-drilldown-widget` component to plot a `csdk-column-chart`
 * over the Sample Healthcare data source hosted in a Sisense instance:
 * ```ts
 * // Component behavior in .component.ts
 * chart = {
 *   dataOptions: {
 *     category: [DM.Divisions.Divison_name],
 *     value: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
 *     breakBy: [],
 *   },
 *   dataPointContextMenu: ({ point, nativeEvent }: { point: any; nativeEvent: MouseEvent }) => {
 *     this.drilldownResult?.onDataPointsSelected?.([point], nativeEvent);
 *     this.drilldownResult?.onContextMenu({
 *       left: nativeEvent.clientX,
 *       top: nativeEvent.clientY,
 *     });
 *   }
 * }
 *
 * drilldownResult?: CustomDrilldownResult;
 *
 * drilldown = {
 *   drilldownDimensions: [DM.Patients.Gender, DM.Admissions.Surgical_Procedure],
 *   initialDimension: DM.Divisions.Divison_name,
 *   drilldownChange: (drilldownResult: CustomDrilldownResult) => {
 *     this.drilldownResult = drilldownResult;
 *     this.chart.dataOptions = {
 *       ...this.chart.dataOptions,
 *       category: [drilldownResult.drilldownDimension]
 *     }
 *   }
 * };
 * ```
 * ```html
 * <!--Component HTML template in .component.html-->
 * <csdk-drilldown-widget
 *   [drilldownDimensions]="drilldown.drilldownDimensions"
 *   [initialDimension]="drilldown.initialDimension"
 *   (drilldownResultChange)="drilldown.drilldownChange($event)"
 * >
 *   <csdk-column-chart
 *     [dataSet]="DM.DataSource"
 *     [dataOptions]="chart.dataOptions"
 *     [filters]="drilldownResult?.drilldownFilters || []"
 *     (dataPointContextMenu)="chart.dataPointContextMenu($event)"
 *   />
 * </csdk-drilldown-widget>
 * ```
 * <img src="media://angular-drilldown-widget-example.png" width="800px" />
 *
 * @group Drilldown
 */
@Component({
  selector: 'csdk-drilldown-widget',
  template: templateWithContent,
})
export class DrilldownWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * @internal
   */
  @ViewChild(rootContentId)
  preactContentRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!DrilldownWidgetProps.drilldownDimensions}
   */
  @Input()
  drilldownDimensions!: DrilldownWidgetProps['drilldownDimensions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DrilldownWidgetProps.initialDimension}
   */
  @Input()
  initialDimension!: DrilldownWidgetProps['initialDimension'];

  @Input()
  config?: Omit<DrilldownWidgetProps['config'], 'breadcrumbsComponent | contextMenuComponent'> & {
    breadcrumbsComponent?: (drilldownBreadcrumbsProps: DrilldownBreadcrumbsProps) => HTMLDivElement;
    contextMenuComponent?: (contextMenuProps: ContextMenuProps) => HTMLDivElement;
  };

  @Output()
  drilldownResultChange = new EventEmitter<CustomDrilldownResult>();

  private componentAdapter: ComponentAdapter;

  /**
   * Constructor for the `DrilldownWidgetComponent`.
   *
   * @param sisenseContextService - Sisense context service
   * @param themeService - Theme service
   */
  constructor(
    /**
     * Sisense context service
     *
     * @category Constructor
     */
    public sisenseContextService: SisenseContextService,
    /**
     * Theme service
     *
     * @category Constructor
     */
    public themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(
      () => this.createPreactComponent(),
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
      ],
    );
  }

  /**
   * @internal
   */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  /**
   * @internal
   */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  private createPreactComponent() {
    const props = {
      drilldownDimensions: this.drilldownDimensions,
      initialDimension: this.initialDimension,
      config: {
        ...this.config,
        ...(this.config?.breadcrumbsComponent && {
          breadcrumbsComponent: createWrapperElementHandler(this.config.breadcrumbsComponent),
        }),
        ...(this.config?.contextMenuComponent && {
          contextMenuComponent: (contextMenuProps: ContextMenuProps) =>
            createWrapperElement(this.config!.contextMenuComponent!(contextMenuProps)),
        }),
      },
    } as DrilldownWidgetProps;

    return createElement(
      DrilldownWidget,
      props,
      (customDrilldownResult: Arguments<DrilldownWidgetProps['children']>[0]) => {
        const { breadcrumbsComponent } = customDrilldownResult;
        this.drilldownResultChange.emit({
          ...customDrilldownResult,
          ...(breadcrumbsComponent && {
            breadcrumbsComponent: { render: createComponentRenderer(breadcrumbsComponent) },
          }),
        } as CustomDrilldownResult);
        return createWrapperElement(this.preactContentRef.nativeElement);
      },
    );
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
