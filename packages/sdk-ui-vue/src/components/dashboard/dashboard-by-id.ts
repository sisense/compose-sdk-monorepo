import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DashboardById as DashboardByIdPreact } from '@ethings-os/sdk-ui-preact';
import type {
  DashboardByIdProps as DashboardByIdPropsPreact,
  DashboardByIdConfig,
} from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

// Re-exports related types
export { DashboardByIdConfig };

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!DashboardById | `DashboardById`} component.
 */
export interface DashboardByIdProps extends DashboardByIdPropsPreact {}

/**
 * A component used for easily rendering a dashboard by its ID in a Sisense Fusion instance.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @example
 * Here's how you can use the DashboardById component in a Vue application:
 * ```vue
 * <template>
 *    <DashboardById
 *      :dashboardOid="dashboardOid"
 *    />
 * </template>
 *
 * <script setup lang="ts">
 * import { DashboardById } from '@ethings-os/sdk-ui-vue';
 *
 * const dashboardOid = '6441e728dac1920034bce737';
 * </script>
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Fusion Assets
 * @fusionEmbed
 */
export const DashboardById = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!DashboardByIdProps.dashboardOid}
     */
    dashboardOid: {
      type: String as PropType<DashboardByIdProps['dashboardOid']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!DashboardByIdProps.config}
     */
    config: Object as PropType<DashboardByIdProps['config']>,
  },
  setup: (props) => setupHelper(DashboardByIdPreact, props),
});
