import { Type } from '@angular/core';
import {
  type DashboardHeaderConfig as DashboardHeaderConfigPreact,
  type DashboardHeaderItemComponentProps,
  type DashboardHeaderItem as DashboardHeaderItemPreact,
} from '@sisense/sdk-ui-preact';

/**
 * An Angular component class that renders the content of a custom dashboard header item.
 *
 * The item size resolved by the header layout is provided via the `size` input, which the component
 * declares even when it renders at a fixed size.
 *
 * @example
 * An Angular header item component rendering an export button that uses its resolved size:
 * ```ts
 * import { Component, Input } from '@angular/core';
 * import { type DashboardHeaderItemComponentProps } from '@sisense/sdk-ui-angular';
 *
 * @Component({
 *   selector: 'app-export-button',
 *   template: '<button [style.height.px]="size.height" (click)="onExport()">Export</button>',
 * })
 * export class ExportButtonComponent {
 *   @Input() size!: DashboardHeaderItemComponentProps['size'];
 *
 *   onExport() {
 *     // trigger the export
 *   }
 * }
 * ```
 */
export type DashboardHeaderItemComponent = Type<DashboardHeaderItemComponentProps>;

/**
 * A custom item to inject into the dashboard header.
 */
export interface DashboardHeaderItem extends Omit<DashboardHeaderItemPreact, 'component'> {
  /**
   * Angular component class that renders the content of the item.
   */
  component: DashboardHeaderItemComponent;
}

/**
 * A dashboard header item after the built-in and custom items have been ordered (position applied).
 *
 * This is the shape passed to {@link DashboardHeaderConfig.beforeRender}.
 *
 * For custom items, `component` is the same Angular component class that was registered in
 * {@link DashboardHeaderConfig.items}, so items can be matched by component identity as well as by
 * `id`. For built-in items, `component` is an opaque handle to an internal renderer: reorder, keep,
 * or remove such an item, but do not invoke or replace its component.
 */
export type DashboardResolvedHeaderItem = Omit<DashboardHeaderItem, 'position'>;

/**
 * Transforms the fully ordered list of dashboard header items right before rendering.
 */
export type DashboardHeaderItemsTransform = (
  items: ReadonlyArray<DashboardResolvedHeaderItem>,
) => DashboardResolvedHeaderItem[];

/**
 * Configuration for the dashboard header.
 *
 * Injects custom {@link DashboardHeaderItem | items} into the header and, via
 * {@link DashboardHeaderConfig.beforeRender | `beforeRender`}, reorders or removes the built-in
 * items (referenced by {@link DashboardHeaderTargets}).
 *
 * @example
 * Add a custom item after the title and hide the built-in title:
 * ```ts
 * import { DashboardHeaderTargets, type DashboardConfig } from '@sisense/sdk-ui-angular';
 *
 * const config: DashboardConfig = {
 *   header: {
 *     items: [
 *       {
 *         id: 'export',
 *         component: ExportButtonComponent,
 *         position: { type: 'after', target: DashboardHeaderTargets.Title },
 *       },
 *     ],
 *     beforeRender: (items) => items.filter((item) => item.id !== DashboardHeaderTargets.Title),
 *   },
 * };
 * ```
 */
export interface DashboardHeaderConfig
  extends Omit<DashboardHeaderConfigPreact, 'items' | 'onBeforeRender'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardHeaderConfig.items}
   */
  items?: DashboardHeaderItem[];
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardHeaderConfig.onBeforeRender}
   */
  beforeRender?: DashboardHeaderItemsTransform;
}
