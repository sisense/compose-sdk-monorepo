import type { DistributiveOmit } from '@/shared/utils/utility-types/distributive-omit';

import type { WidgetProps } from '../widget/types';

/**
 * Props for the facade widget component.
 *
 * @internal
 */
export type CommonWidgetProps = DistributiveOmit<WidgetProps, 'id'>;
