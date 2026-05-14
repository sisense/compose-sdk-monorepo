/**
 * @alpha API Exports
 *
 * Alpha APIs are highly experimental and subject to change.
 * Not recommended for production use.
 */

export { useDashboardTheme } from '../domains/dashboarding/use-dashboard-theme.js';
export type { ThemeConfig } from '../types';

// Translation
export {
  type TranslationDictionary,
  PACKAGE_NAMESPACE as translationNamespace,
} from '@/infra/translation/resources';

// Filter components
export {
  CascadingFilterTile,
  type CascadingFilterTileProps,
} from '../domains/filters/components/cascading-filter-tile';
export {
  CustomFilterTile,
  type CustomFilterTileProps,
} from '../domains/filters/components/custom-filter-tile';

// Charts related
export {
  isIndicatorRenderOptions,
  isHighchartsOptions,
  type HighchartsOptions,
  type CalendarHeatmapChartEventProps,
} from '../props';
