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
  DashboardById,
  type DashboardByIdProps,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import {
  createPluginsContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import { template, rootId } from '../../component-wrapper-helpers/template';
import { PluginsService } from '../../services/plugins.service';

/**
 * An Angular component used for easily rendering a dashboard by its ID created in a Sisense Fusion instance.
 *
 * **Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.
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
 * @group Fusion Embed
 * @fusionEmbed
 * @beta
 */
@Component({
  selector: 'csdk-dashboard-by-id',
  template,
})
export class DashboardByIdComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardByIdProps.dashboardOid}
   */
  @Input()
  dashboardOid!: DashboardByIdProps['dashboardOid'];

  private componentAdapter: ComponentAdapter;

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
     * Plugin service
     *
     * @internal
     * @category Constructor
     */
    public pluginService: PluginsService,
  ) {
    this.componentAdapter = new ComponentAdapter(
      () => this.createPreactComponent(),
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
        createPluginsContextConnector(this.pluginService),
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
      dashboardOid: this.dashboardOid,
    };

    return createElement(DashboardById, props);
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
