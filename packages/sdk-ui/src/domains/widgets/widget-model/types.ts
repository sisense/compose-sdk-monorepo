import { ChartType } from '@/index';

/**
 * Widget type
 *
 * `BuiltInWidgetKey` (`domains/widgets/widget-identity`) covers the built-in types including
 * `'filter'`, without `'custom'`; prefer it in new code. This type is kept for existing consumers.
 *
 * @internal
 */
export type WidgetTypeInternal = ChartType | 'pivot' | 'custom' | 'text' | 'narrative';
