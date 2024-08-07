import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DashboardById as DashboardByIdPreact } from '@sisense/sdk-ui-preact';
import type { DashboardByIdProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A component used for easily rendering a dashboard by its ID in a Sisense Fusion instance.
 *
 * **Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.
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
 * @group Fusion Embed
 * @fusionEmbed
 * @internal
 */
export const DashboardById = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardByIdProps.dashboardOid}
     */
    dashboardOid: String as PropType<DashboardByIdProps['dashboardOid']>,
  },
  setup: (props) => setupHelper(DashboardByIdPreact, props),
});
