import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DashboardById as DashboardByIdPreact } from '@sisense/sdk-ui-preact';
import type { DashboardByIdProps as DashboardByIdPropsPreact } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!DashboardById | `DashboardById`} component.
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
 * import { DashboardById } from '@sisense/sdk-ui-vue';
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
     * {@inheritDoc @sisense/sdk-ui!DashboardByIdProps.dashboardOid}
     */
    dashboardOid: String as PropType<DashboardByIdProps['dashboardOid']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardByIdProps.persist}
     *
     * @alpha
     */
    persist: Boolean as PropType<DashboardByIdProps['persist']>,
  },
  setup: (props) => setupHelper(DashboardByIdPreact, props),
});
