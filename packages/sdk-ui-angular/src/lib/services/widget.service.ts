import { Injectable } from '@angular/core';
import {
  getWidgetModel,
  type GetWidgetModelParams as GetWidgetModelParamsPreact,
  HookAdapter,
  type JumpToDashboardConfig,
  type JumpToDashboardConfigForPivot,
  useJtdWidget as useJtdWidgetPreact,
} from '@sisense/sdk-ui-preact';
import { BehaviorSubject } from 'rxjs';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { type WidgetProps } from '../components/widgets/widget.component';
import { TrackableService } from '../decorators/trackable.decorator';
import { toPreactWidgetProps, toWidgetProps } from '../helpers/widget-props-preact-translator';
import { SisenseContextService } from './sisense-context.service';
import { ThemeService } from './theme.service';

/**
 * Parameters for retrieving an existing widget model from the Sisense instance
 */
export interface GetWidgetModelParams extends Omit<GetWidgetModelParamsPreact, 'enabled'> {}

/**
 * Service for working with Sisense Fusion widgets.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<WidgetService>(['getWidgetModel', 'createJtdWidget'])
export class WidgetService {
  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {}

  /**
   * Retrieves an existing widget model from the Sisense instance.
   *
   * @param params - Parameters to identify the target widget
   * @returns Widget model
   */
  async getWidgetModel(params: GetWidgetModelParams) {
    const { dashboardOid, widgetOid } = params;
    const app = await this.sisenseContextService.getApp();
    return getWidgetModel(app.httpClient, dashboardOid, widgetOid);
  }

  /**
   * Adds Jump To Dashboard (JTD) functionality to widget props.
   *
   * Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets,
   * such as clicking on chart data points or using context menus. This method is particularly useful when rendering
   * Widget components directly (not through a Dashboard component), but you still want JTD navigation functionality.
   *
   * For widgets that are part of a dashboard, consider using `applyJtdConfig` or `applyJtdConfigs` instead,
   * as they apply JTD configuration at the dashboard level rather than individual widget level.
   *
   * Note: dashboard-only 'includeDashboardFilters' is not supported and would just be ignored, since we do not have a dashboard in the current context.
   *
   * This method enhances the provided widget props with JTD navigation capabilities, including:
   * - Click and right-click event handlers for navigation
   * - Hyperlink styling for actionable pivot cells (when applicable)
   * - JTD icon display in widget headers
   * @example
   * ```TypeScript
   * import { Component, OnDestroy } from '@angular/core';
   * import {
   *   WidgetService,
   *   widgetModelTranslator,
   *   type WidgetProps,
   * } from '@sisense/sdk-ui-angular';
   * import { BehaviorSubject } from 'rxjs';
   *
   * @Component({
   *   selector: 'code-example',
   *   template: `
   *     <csdk-widget
   *       *ngIf="widgetProps$ && (widgetProps$ | async) as widgetProps"
   *       [id]="widgetProps.id"
   *       [widgetType]="widgetProps.widgetType"
   *       [chartType]="widgetProps.chartType"
   *       [title]="widgetProps.title"
   *       [dataSource]="widgetProps.dataSource"
   *       [dataOptions]="widgetProps.dataOptions"
   *       [filters]="widgetProps.filters"
   *       [highlights]="widgetProps.highlights"
   *       [styleOptions]="widgetProps.styleOptions"
   *       [beforeMenuOpen]="widgetProps.beforeMenuOpen"
   *       (dataPointClick)="widgetProps.dataPointClick?.($event)"
   *       (dataPointContextMenu)="widgetProps.dataPointContextMenu?.($event)"
   *       (dataPointsSelect)="widgetProps.dataPointsSelect?.($event)"
   *     />
   *   `,
   * })
   * export class CodeExample implements OnDestroy {
   *   constructor(private widgetService: WidgetService) {}
   *
   *   widgetProps$: BehaviorSubject<WidgetProps | null> | null = null;
   *   private jtdDestroy: (() => void) | null = null;
   *
   *   async ngOnInit(): Promise<void> {
   *     const widget = await this.widgetService.getWidgetModel({
   *       dashboardOid: '65a82171719e7f004018691c',
   *       widgetOid: '65a82171719e7f004018691f',
   *     });
   *
   *     const baseProps = widget
   *       ? widgetModelTranslator.toWidgetProps(widget)
   *       : null;
   *
   *     if (baseProps) {
   *       const jtdConfig = {
   *         targets: [{ id: 'target-dashboard-id', caption: 'Details' }],
   *         interaction: { triggerMethod: 'rightclick' },
   *       };
   *       const jtdResult = this.widgetService.createJtdWidget(
   *         baseProps,
   *         jtdConfig,
   *       );
   *       this.widgetProps$ = jtdResult.widget$;
   *       this.jtdDestroy = jtdResult.destroy;
   *     }
   *   }
   *
   *   ngOnDestroy(): void {
   *     this.jtdDestroy?.();
   *   }
   * }
   * ```
   *
   * @param widgetProps - Base widget props to enhance with JTD functionality
   * @param jtdConfig - JTD configuration defining navigation targets and behavior
   * @returns Object containing:
   *         - `widget$`: The observable that emits enhanced widget props with JTD handlers.
   *         - `destroy`: Function to clean up resources. Call this when the component is destroyed.
   * @group Dashboards
   */
  createJtdWidget(
    widgetProps: WidgetProps | null,
    jtdConfig: JumpToDashboardConfig | JumpToDashboardConfigForPivot,
  ): { widget$: BehaviorSubject<WidgetProps | null>; destroy: () => void } {
    // Create BehaviorSubject initialized with base props (or null)
    const enhancedProps$ = new BehaviorSubject<WidgetProps | null>(widgetProps);

    if (!widgetProps) {
      return {
        widget$: enhancedProps$,
        destroy: () => {
          enhancedProps$.complete();
        },
      };
    }

    // Create HookAdapter with useJtdWidget hook and context connectors
    const hookAdapter = new HookAdapter(useJtdWidgetPreact, [
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
    ]);

    // Convert Angular props to preact props
    const preactProps = toPreactWidgetProps(widgetProps);

    // Subscribe to hook adapter results and capture the subscription
    const hookAdapterSubscription = hookAdapter.subscribe((enhancedPreactProps) => {
      if (enhancedPreactProps) {
        // Convert back to Angular props
        const angularProps = toWidgetProps(enhancedPreactProps);
        enhancedProps$.next(angularProps);
      } else {
        enhancedProps$.next(null);
      }
    });

    // Run the hook with widget props and JTD config
    // This will trigger the subscription above asynchronously when React contexts are ready
    hookAdapter.run(preactProps, jtdConfig);

    // Return the BehaviorSubject and destroy function for cleanup
    return {
      widget$: enhancedProps$,
      destroy: () => {
        // Unsubscribe from hook adapter
        hookAdapterSubscription.unsubscribe();
        // Destroy the hook adapter to clean up React components and contexts
        hookAdapter.destroy();
        // Complete the BehaviorSubject to release subscribers and avoid leaks
        enhancedProps$.complete();
      },
    };
  }
}
