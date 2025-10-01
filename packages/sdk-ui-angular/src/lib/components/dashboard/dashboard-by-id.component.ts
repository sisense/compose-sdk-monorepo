import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  ComponentAdapter,
  DashboardById as DashboardByIdPreact,
  type DashboardByIdConfig,
  type DashboardByIdProps as DashboardByIdPropsPreact,
} from '@ethings-os/sdk-ui-preact';

import {
  createCustomWidgetsContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { CustomWidgetsService } from '../../services/custom-widgets.service';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';

// Re-exports related types
export { DashboardByIdConfig };

/**
 * Props of the {@link DashboardByIdComponent}.
 */
export interface DashboardByIdProps extends DashboardByIdPropsPreact {}

/**
 * An Angular component used for easily rendering a dashboard by its ID created in a Sisense Fusion instance.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @example
 * ```ts
 * import { Component } from '@angular/core';
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <div style="width: 100vw;">
 *       <csdk-dashboard-by-id *ngIf="dashboardOid" [dashboardOid]="dashboardOid" />
 *     </div>
 *   `,
 *  })
 * export class CodeExampleComponent {
 *   dashboardOid = 'your-dashboard-oid';
 * }
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Fusion Assets
 * @fusionEmbed
 */
@Component({
  selector: 'csdk-dashboard-by-id',
  template,
  styles,
})
export class DashboardByIdComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardByIdProps.dashboardOid}
   */
  @Input()
  dashboardOid!: DashboardByIdProps['dashboardOid'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardByIdProps.config}
   */
  @Input()
  config: DashboardByIdProps['config'];

  private componentAdapter: ComponentAdapter<typeof DashboardByIdPreact>;

  /**
   * Constructor for the `DashboardById` component.
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
    /**
     * Custom widgets service
     *
     * @internal
     * @category Constructor
     */
    public customWidgetsService: CustomWidgetsService,
  ) {
    this.componentAdapter = new ComponentAdapter(DashboardByIdPreact, [
      createCustomWidgetsContextConnector(this.customWidgetsService),
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
    ]);
  }

  /**
   * @internal
   */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  /**
   * @internal
   */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  private getPreactComponentProps(): DashboardByIdPropsPreact {
    return {
      dashboardOid: this.dashboardOid,
      config: this.config,
    };
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
