import {
  type DashboardHeaderConfig as DashboardHeaderConfigPreact,
  type DashboardHeaderItemComponentProps,
  type DashboardHeaderItem as DashboardHeaderItemPreact,
} from '@sisense/sdk-ui-preact';
import type { Component, DefineComponent } from 'vue';

/**
 * A Vue component that renders the content of a custom dashboard header item.
 * This can be a Vue component options object, a `defineComponent` result, or any valid Vue component.
 *
 * The item size resolved by the header layout is provided via the `size` prop.
 *
 * @example
 * A Vue header item component rendering an export button that uses its resolved size:
 * ```vue
 * <script setup lang="ts">
 * import { type DashboardHeaderItemComponentProps } from '@sisense/sdk-ui-vue';
 *
 * const props = defineProps<DashboardHeaderItemComponentProps>();
 *
 * const onExport = () => {
 *   // trigger the export
 * };
 * </script>
 * <template>
 *   <button :style="{ height: props.size.height + 'px' }" @click="onExport">Export</button>
 * </template>
 * ```
 */
export type DashboardHeaderItemComponent =
  | Component<DashboardHeaderItemComponentProps>
  | DefineComponent<DashboardHeaderItemComponentProps>;

/**
 * A custom item to inject into the dashboard header.
 */
export interface DashboardHeaderItem extends Omit<DashboardHeaderItemPreact, 'component'> {
  /**
   * Vue component that renders the content of the item.
   */
  component: DashboardHeaderItemComponent;
}

/**
 * A dashboard header item after the built-in and custom items have been ordered (position applied).
 *
 * This is the shape passed to {@link DashboardHeaderConfig.onBeforeRender}.
 *
 * For custom items, `component` is the same Vue component that was registered in
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
 * {@link DashboardHeaderConfig.onBeforeRender | `onBeforeRender`}, reorders or removes the
 * built-in items (referenced by {@link DashboardHeaderTargets}).
 *
 * @example
 * Add a custom item after the title and hide the built-in title:
 * ```ts
 * import { DashboardHeaderTargets, type DashboardConfig } from '@sisense/sdk-ui-vue';
 * import ExportButton from './export-button.vue';
 *
 * const config: DashboardConfig = {
 *   header: {
 *     items: [
 *       {
 *         id: 'export',
 *         component: ExportButton,
 *         position: { type: 'after', target: DashboardHeaderTargets.Title },
 *       },
 *     ],
 *     onBeforeRender: (items) => items.filter((item) => item.id !== DashboardHeaderTargets.Title),
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
  onBeforeRender?: DashboardHeaderItemsTransform;
}
