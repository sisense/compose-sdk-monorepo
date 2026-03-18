import { DataSource } from '@sisense/sdk-data';
import { PivotQueryClient } from '@sisense/sdk-pivot-query-client';
import { QueryClient } from '@sisense/sdk-query-client';
import { HttpClient } from '@sisense/sdk-rest-client';
import { TrackingEventDetails } from '@sisense/sdk-tracking';

import { DateConfig, LoadingIndicatorConfig, TranslationConfig } from '@/types';

import { AppSettings } from './settings/settings';

/**
 * Application configuration
 */
export type AppConfig = {
  /**
   * A [date-fns Locale](https://date-fns.org/v2.30.0/docs/Locale)
   */
  locale?: Locale;

  /**
   * Translation Configuration
   */
  translationConfig?: TranslationConfig;

  /**
   * Date Configurations
   */
  dateConfig?: DateConfig;

  /**
   * Loading Indicator Configurations
   */
  loadingIndicatorConfig?: LoadingIndicatorConfig;

  /**
   * Query Cache Configurations.
   *
   * See [Client query caching guide](/guides/sdk/guides/client-query-caching.html) for more details.
   *
   * @beta
   */
  queryCacheConfig?: {
    /**
     * Whether to enable client-side query caching.
     *
     * If not specified, the default value is `false`
     */
    enabled?: boolean;
  };

  /**
   * Query limit (max rows count that will be fetched in query)
   *
   * @default 20000
   */
  queryLimit?: number;

  /**
   * Accessibility configuration. Set the `accessibilityConfig.enabled` property to `true` to enable accessibility features for charts built with Highcharts.
   *
   * Once the accessibility configuration in enabled, you can use the default descriptions or choose to create custom configurations for the descriptions of a chart, its axes, its series, and values description formatting. To create custom configurations, use the `highchartsOptions` object that is passed to the {@link BeforeRenderHandler} of the chart's `onBeforeRender` callback. Modify the object using the accessibility options as described in the [Accessibility module documentation](https://www.highcharts.com/docs/accessibility/accessibility-module).
   *
   * Note that enabling accessibility also causes markers to appear in charts even if they are disabled using the chart's `styleOptions`.
   *
   * This feature is in alpha.
   */
  accessibilityConfig?: {
    /**
     * Whether to enable accessibility features
     *
     * If not specified, the default value is `false`
     */
    enabled?: boolean;
  };

  /**
   * Configuration of the tabber widgets feature
   *
   * Only tabber widgets that are configured using the Fusion UI as documented [here](https://docs.sisense.com/main/SisenseLinux/tabber.htm#Creating) are supported.
   */
  tabberConfig?: {
    /**
     * Whether to enable tabber widget support
     *
     * If not specified, the default value is `true`
     *
     * @deprecated Tabber widgets are now supported by default and this property is no longer needed.
     */
    enabled?: boolean;
  };
  /**
   * Configuration of the component that is rendered in case of an error
   */
  errorBoundaryConfig?: {
    /**
     * Whether to show error text without hovering over the error icon
     *
     * If not specified, the default value is `false`
     */
    alwaysShowErrorText?: boolean;
  };

  /**
   * API Telemetry headers to attach to every request made by the SDK.
   * Attached only when the API Telemetry feature flag is enabled.
   *
   * Support only headers with the prefix 'x-sisense-'.
   *
   * @example
   * ```tsx
   * appConfig={{
   *   apiTelemetryHeaders: {
   *     'x-sisense-embed': 'iframe',
   *   },
   * }}
   * ```
   * @sisenseInternal
   */
  apiTelemetryHeaders?: Record<string, string>;

  /**
   * Tracking configuration
   */
  trackingConfig?: {
    /**
     * Whether to enable or disable tracking in development or test environment.
     *
     * If not specified, the default value is `true`
     *
     * In production, tracking is always enabled.
     *
     * @internal
     */
    enabled?: boolean;
    /**
     * Callback to be invoked when tracking event occurs
     */
    onTrackingEvent?: (payload: TrackingEventDetails) => void;
  };

  /**
   * Configuration of the Jump To Dashboard feature
   *
   * This feature is currently in Beta.
   *
   * **Note:** Only widgets that are configured using the Fusion UI as documented
   * [here](https://docs.sisense.com/main/SisenseLinux/jump-to-dashboard.htm?tocpath=Add-ons%7C_____2#ConfiguringJTDPerWidget)
   * are supported in Compose SDK.
   *
   * Widgets that are configured using an older version of Jump To Dashboard, or via scripts, are not supported.
   *
   * Known limitations:
   * - Jump To Dashboard is not currently supported for Pivot widgets.
   * - Target dashboards are always opened in a popup window, options to open in new tab and new window are not supported.
   * - Show 'Header' and 'Dashboards panel' options are not supported (only relevant to Fusion).
   * - 'Reset filters after JTD' is not supported, since changes are never saved to the target dashboard using Compose SDK.
   *
   * The following Jump To Dashboard configuration is supported:
   *   - Target dashboard set by Id, with configurable display title
   *   - 'Popup window' display type ('Allow Resize' not supported)
   *   - Display filter panel on the target dashboard (true/false)
   *   - Navigation setting (Click / Right click)
   *     - Note: 'Keep changes made by user' is not supported, since changes are never saved to the target dashboard using Compose SDK.
   *   - Apply filters to the target dashboard (select)
   *   - Merge target dashboard filters (true/false)
   *
   */
  jumpToDashboardConfig?: {
    /**
     * Whether to enable or disable the Jump To Dashboard feature
     *
     * If not specified, the default value is `true`
     */
    enabled?: boolean;
  };

  /**
   * Global configuration for some specific aspects of data visualizations.
   */
  chartConfig?: {
    /** `Table` and `PivotTable` configuration */
    tabular?: {
      /** Configuration for HTML content in `Table` and `PivotTable` */
      htmlContent?: {
        /**
         * If true, the contents of table and pivot table cells are rendered as HTML instead of text.
         *
         * **Note**: The {@link StyledColumn.isHtml} property of columns in `dataOptions` are of higher precedence, and will therefore override this setting.
         * @default true
         * */
        enabled?: boolean;
        /**
         * Enables sanitization of HTML content before rendering to prevent XSS attacks.
         * @default true
         * */
        sanitizeContents?: boolean;
      };
      /**
       * Boolean flag whether to always show the results per page select
       *
       * If `true`, the results per page select will be shown even if there is only one page of results.
       * Currently only supported for `PivotTable`.
       *
       * @default false
       */
      alwaysShowResultsPerPage?: boolean;
    };
  };
};

/**
 * Stands for a Sisense Client Application which connects to a Sisense Environment
 *
 * @internal
 */
export interface ClientApplication {
  /**
   * Gets the underlying HTTP Client
   */
  readonly httpClient: HttpClient;

  /**
   * Gets the underlying Pivot Query Client
   */
  readonly pivotQueryClient: PivotQueryClient;

  /**
   * Gets the underlying Query Client
   */
  readonly queryClient: QueryClient;

  /**
   * Gets the default data source being used as default for child components with no explicitly defined data source
   */
  readonly defaultDataSource?: DataSource;

  /**
   * Gets the application settings
   */
  settings: AppSettings;

  /**
   * Gets the module to control query cache
   */
  queryCache: {
    /**
     * Clears the query cache
     */
    clear: () => void;
  };
}

export type SystemSettings = {
  tracking?: {
    apiTelemetry?: boolean;
  };
};
