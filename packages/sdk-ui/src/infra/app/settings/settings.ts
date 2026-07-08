import { HttpClient } from '@sisense/sdk-rest-client';
import { merge } from 'ts-deepmerge';

import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings.js';
import { TranslatableError } from '@/infra/translation/translatable-error.js';
import { QUERY_DEFAULT_LIMIT, SYSTEM_TENANT_NAME } from '@/shared/const.js';

import { defaultDateConfig } from '../../../domains/query-execution/core/date-formats/index.js';
import { getBaseDateFnsLocale } from '../../../domains/visualizations/core/chart-data-processor/data-table-date-period.js';
import { AppConfig, ThemeSettings } from '../../../types';
import {
  convertToThemeSettings,
  getPaletteName,
  LegacyDesignSettings,
  LegacyPalette,
} from '../../themes/legacy-design-settings.js';
import { getLegacyPalette } from '../../themes/theme-loader';
import { GlobalsObject } from './types';
import { FeatureMap, Features } from './types/features.js';

type AiSettingsResponse = {
  narration?: { enabled?: boolean; sisenseAIEnabled?: boolean };
};

/**
 * Known AI feature flags exposed on {@link AppSettings} `ai.featureFlags`.
 * Add a flag here when you want first-class typing/autocomplete for it; otherwise
 * it still surfaces via the index signature on {@link AiFeatureFlags}.
 */
type KnownAiFeatureFlags = {
  naturalResponseEnabled: boolean;
  queryDefinition: boolean;
};

/**
 * Loose, forward-compatible shape of `ai.featureFlags`. Known flags are strongly typed
 * (see {@link KnownAiFeatureFlags}); arbitrary string-keyed flags are type-allowed
 * for forward compatibility (unknown keys are readable as `boolean | undefined`)
 * without requiring a CSDK type bump.
 *
 * @sisenseInternal
 */
export type AiFeatureFlags = KnownAiFeatureFlags & {
  [flag: string]: boolean | undefined;
};

/**
 * AI-related slice derived from globals (`serverFeatures` + deployment props),
 * aligned with admin UI paths such as `ai.featureFlags.*`, `ai.featureModelType`,
 * and `ai.quotaNotification`.
 */
type AiSettingsSlice = {
  featureFlags: AiFeatureFlags;
  /**
   * Only when `serverFeatures.aiAssistant` exists.
   * If the block is present but omits this field, defaults to `customer_byok`.
   * When the AI Assistant feature is absent from globals, this stays unset (`undefined`).
   */
  featureModelType?: string;
  quotaNotification: boolean;
};

function mapAiSettingsSlice(features: FeatureMap): AiSettingsSlice {
  const aiAssistant = features.aiAssistant;

  const naturalResponseEnabled = Boolean(aiAssistant?.naturalResponseEnabled ?? false);

  const queryDefinition = Boolean(aiAssistant?.queryDefinition ?? false);

  const quotaNotification = Boolean(aiAssistant?.quotaNotification ?? false);

  const featureModelType =
    aiAssistant !== undefined ? aiAssistant.featureModelType ?? 'customer_byok' : undefined;

  return {
    featureFlags: {
      naturalResponseEnabled,
      queryDefinition,
    },
    ...(featureModelType !== undefined ? { featureModelType } : {}),
    quotaNotification,
  };
}

/**
 * Application settings
 *
 * @sisenseInternal
 */
export type AppSettings = Required<ConfigurableAppSettings> & ServerSettings;

/**
 * Application settings that can be overridden by the user
 */
type ConfigurableAppSettings = AppConfig;

/**
 * User role permissions
 *
 * @internal
 */
type RoleManifest = {
  dashboards?: {
    create: boolean;
    delete: boolean;
    move: boolean;
    rename: boolean;
    duplicate: boolean;
    change_owner: boolean;
    toggle_edit_mode: boolean;
    edit_layout: boolean;
    edit_script: boolean;
    export_dash: boolean;
    export_jpeg: boolean;
    export_image: boolean;
    export_pdf: boolean;
    share: boolean;
    restore: boolean;
    copy_to_server: boolean;
    import: boolean;
    select_palette: boolean;
    replace_datasource: boolean;
    undo_import_dash: boolean;
    toggleDataExploration: boolean;
    filters: {
      create: boolean;
      delete: boolean;
      save: boolean;
      on_off: boolean;
      toggle_expansion: boolean;
      modify: boolean;
      reorder: boolean;
      modify_type: boolean;
      toggle_auto_update: boolean;
      set_defaults: boolean;
      advanced: boolean;
      use_starred: boolean;
      modify_filter_relationship: boolean;
    };
  };
};

/**
 * Fusion platform settings
 */
type ServerSettings = {
  serverThemeSettings: ThemeSettings;
  serverLanguage: string;
  serverVersion: string;
  serverFeatures: FeatureMap;
  ai: AiSettingsSlice;
  /**
   * Whether this is a Sisense-managed (cloud) deployment.
   * From `api/globals` props.isManagedService; `false` for on-prem.
   */
  isManaged: boolean;
  narrative: {
    /** From `api/v2/settings/ai` narration.enabled */
    isEnabled: boolean;

    /** Computed from `narrationUnified` and the unlimited or credit-based narrative entitlements. */
    canGenerateNarrativeViaAI: boolean;

    /**
     * Narrative text provider from the license (`api/globals` props.narrationProvider).
     * `arria` is the legacy 3rd-party engine served only via `POST /api/v1/narration/widget`,
     * which CSDK does not support; `sisenseAI` uses the AI endpoints CSDK can call.
     */
    provider?: 'arria' | 'sisenseAI';
  };
  user: {
    tenant: {
      name: string;
    };
    /**
     * User role permissions
     *
     * @internal
     */
    permissions: RoleManifest;
    /** From `api/globals` `user.firstName` — for embedded UIs (e.g. assistant greeting). */
    firstName?: string;
    /** From `api/globals` `user.lastName`. */
    lastName?: string;
    /** From `api/globals` `user.email`. */
    email?: string;
    /** From `api/globals` `user.baseRoleName`. */
    baseRoleName?: string;
  };
  /**
   * Raw Fusion `designSettings` from `api/globals` (before palette / theme conversion).
   * Use for CSS variable derivation that mirrors the main Fusion app; see also {@link ServerSettings.serverThemeSettings}.
   */
  fusionDesignSettings: LegacyDesignSettings;
  /** Subset of `globals.brand` needed by embedded chrome (e.g. documentation link). */
  fusionBrand: {
    documentationUrl: string | null;
  };
};

const defaultLoadingIndicatorConfig = {
  enabled: true,
  delay: 500, // default value is 500 to avoid flickering between re-renders
};

const defaultAppConfig: Required<ConfigurableAppSettings> = {
  locale: getBaseDateFnsLocale(),
  dateConfig: defaultDateConfig,
  loadingIndicatorConfig: defaultLoadingIndicatorConfig,
  translationConfig: {
    language: 'en-US',
    customTranslations: [],
  },
  queryCacheConfig: {
    enabled: false,
  },
  queryLimit: QUERY_DEFAULT_LIMIT,
  tabberConfig: {
    enabled: true,
  },
  accessibilityConfig: {
    enabled: false,
  },
  errorBoundaryConfig: {
    alwaysShowErrorText: false,
  },
  apiTelemetryHeaders: {},
  trackingConfig: {
    enabled: true,
  },
  jumpToDashboardConfig: {
    enabled: true,
  },
  narrativeConfig: {
    enabled: true,
  },
  chartConfig: {
    tabular: {
      htmlContent: {
        enabled: true,
        sanitizeContents: true,
      },
    },
    defaultNumberFormatting: {
      enabled: true,
    },
  },
};

/**
 * Gets the application settings
 *
 * @param customConfig - Custom application configuration
 * @param httpClient - Sisense REST API client
 * @param isWat - Whether the application is running with WAT authentication
 * @returns - Application settings
 */
export async function getSettings(
  customConfig: ConfigurableAppSettings,
  httpClient: Pick<HttpClient, 'get' | 'url'>,
  useDefaultPalette?: boolean,
): Promise<AppSettings> {
  const serverSettings = await loadServerSettings(httpClient, useDefaultPalette);
  return merge.withOptions(
    { mergeArrays: false },
    defaultAppConfig,
    serverSettings,
    {
      translationConfig: {
        language: serverSettings.serverLanguage,
      },
      locale: getBaseDateFnsLocale(
        customConfig?.translationConfig?.language ?? serverSettings.serverLanguage,
      ),
    },
    customConfig,
  ) as AppSettings;
}

/**
 * Translate Features to FeatureMap
 *
 * @param features - Features to be mapped
 * @returns FeatureMap
 */
function mapFeatures(features: Features): FeatureMap {
  const map: Record<string, Features[number]> = {};

  features.forEach((feature) => {
    map[feature.key] = feature;
  });

  return map as FeatureMap;
}

async function loadAiSettings(httpClient: Pick<HttpClient, 'get'>) {
  try {
    const ai = await httpClient.get<AiSettingsResponse>('api/v2/settings/ai');
    return {
      narrative: {
        isEnabled: ai?.narration?.enabled === true,
        isSisenseAiEnabled: ai?.narration?.sisenseAIEnabled === true,
      },
    };
  } catch {
    return {
      narrative: { isEnabled: false, isSisenseAiEnabled: false },
    };
  }
}

function documentationUrlFromBrand(brand: unknown): string | null {
  if (brand == null || typeof brand !== 'object') return null;
  const raw = Reflect.get(brand, 'documentationUrl');
  if (raw == null) return null;
  return typeof raw === 'string' ? raw : null;
}

/**
 * Loads the server settings
 *
 * @param httpClient - Sisense REST API client
 * @param isWat - Whether the application is running with WAT authentication
 * @returns - Server settings
 */
async function loadServerSettings(
  httpClient: Pick<HttpClient, 'get' | 'url'>,
  useDefaultPalette = false,
) {
  const globals = await httpClient.get<GlobalsObject>('api/globals');
  if (!globals) {
    throw new TranslatableError('errors.serverSettingsNotLoaded');
  }
  const palette = useDefaultPalette
    ? ({ colors: getDefaultThemeSettings().palette.variantColors } as LegacyPalette)
    : await getLegacyPalette(getPaletteName(globals.designSettings), httpClient);
  const { narrative: apiNarration } = await loadAiSettings(httpClient);
  const props = globals.props;
  const unlimitedNarrativesEnabled =
    apiNarration.isSisenseAiEnabled ||
    (props?.isNarration && props?.narrationProvider === 'sisenseAI');
  const creditNarrativesEnabled = !!(
    props?.isNarration === false &&
    props?.aiNarrative &&
    (props?.SisenseManagedLLM || props?.llmBYOK)
  );
  const isUnified = props?.narrationUnified === true;
  const serverFeatures = mapFeatures(globals.features ?? []);
  const ai = mapAiSettingsSlice(serverFeatures);

  const serverSettings: ServerSettings = {
    serverThemeSettings: convertToThemeSettings(globals.designSettings, palette, httpClient.url),
    serverLanguage: globals.language,
    serverVersion: globals.version,
    serverFeatures,
    ai,
    isManaged: props?.isManagedService === true,
    narrative: {
      isEnabled: apiNarration.isEnabled,
      canGenerateNarrativeViaAI:
        isUnified && (unlimitedNarrativesEnabled || creditNarrativesEnabled),
      provider: props?.narrationProvider,
    },
    user: {
      tenant: {
        name: globals.user?.tenant?.name || SYSTEM_TENANT_NAME,
      },
      permissions: {
        dashboards: globals?.user?.userAuth?.dashboards,
      },
      firstName: globals.user?.firstName,
      lastName: globals.user?.lastName,
      email: globals.user?.email,
      baseRoleName: globals.user?.baseRoleName,
    },
    fusionDesignSettings: globals.designSettings,
    fusionBrand: {
      documentationUrl: documentationUrlFromBrand(globals.brand),
    },
  };
  return serverSettings;
}
