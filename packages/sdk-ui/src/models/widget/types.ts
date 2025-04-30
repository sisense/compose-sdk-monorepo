import { ChartType } from '@/index';

/**
 * Widget type
 *
 * todo: as a future refactoring need to replace this type by combination of WidgetType and ChartType
 *
 * @internal
 */
export type WidgetTypeInternal = ChartType | 'pivot' | 'plugin' | 'text';
