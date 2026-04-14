import { AppSettings } from '@/infra/app/settings/settings.js';

/**
 * Checks if widget design style is enabled.
 * Pure function with default fallback.
 *
 * @param appSettings - Optional application settings
 * @returns True if widget design is enabled
 */
export const isWidgetDesignEnabled = (appSettings?: AppSettings): boolean =>
  appSettings?.serverFeatures?.widgetDesignStyle?.active ?? true;
