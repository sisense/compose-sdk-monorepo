type Feature<Name extends string, Mixin extends Record<string, unknown> = {}> = {
  key: Name;
  active: boolean;
  description?: string;
} & Mixin;

type AlertingFeature = Feature<'alerting'>;
type LiveQueryFeature = Feature<'liveQuery'>;
type NlqFeature = Feature<
  'nlq',
  {
    isLiveEnabled: boolean;
    liveRefreshTime: string;
    isAdvancedMode: boolean;
  }
>;
type PivotFeature = Feature<
  'pivot',
  {
    allowHtml: boolean;
    distinctTotals: {
      default: { value: boolean };
      perMeasure: { value: boolean };
    };
    rangeBackgroundEnabled: boolean;
    subtotalsForSingleRow: boolean;
  }
>;
type CustomCodeFeature = Feature<'customCode'>;
type CustomCodeTransformationFeature = Feature<'customCodeTransformation'>;
type BuildDestinationFeature = Feature<
  'buildDestination',
  {
    monetDBEnabled: boolean;
    azureSynapseEnabled: boolean;
    elasticubeEnabled: boolean;
    redshiftEnabled: boolean;
    snowflakeEnabled: boolean;
  }
>;
type VersionHistoryFeature = Feature<'versionHistory'>;
type EmbedCodeFeature = Feature<'embedCode'>;
type LiveCustomColumnFeature = Feature<'liveCustomColumn'>;
type ExportingEngineV2Feature = Feature<'exportingEngineV2'>;
type ExportingXlsxV2Feature = Feature<'exportingXlsxV2'>;
type ExportingCsvFeature = Feature<'exportingCsv', { localized: boolean }>;
type ConnectionManagementFeature = Feature<
  'connectionManagement',
  {
    levels: {
      modelLevel: boolean;
      governanceLevel: boolean;
    };
  }
>;
type SisenseLightFeature = Feature<'sisenseLight', { workbooksUrl: null | string }>;
type WizardSqlEditorFeature = Feature<'wizardSqlEditor'>;
type MultiTenancyFeature = Feature<'multiTenancy', { visible: boolean }>;
type BloxFeature = Feature<'blox'>;
type FunnelFeature = Feature<'funnel'>;
type Cloud360Feature = Feature<'cloud360', { baseUrl: null | string }>;
type BreakByToggleFeature = Feature<'breakByToggle'>;
type GitIntegrationFeature = Feature<'gitIntegration'>;
type InfusionFeature = Feature<'infusion'>;
type InfusionWebClientFeature = Feature<'infusionWebClient'>;
type NotebooksFeature = Feature<'notebooks'>;
type AdminWebClientFeature = Feature<'adminWebClient'>;
type DateTimeFiltersFeature = Feature<'dateTimeFilters'>;
type TextFiltersFeature = Feature<'textFilters'>;
type NumericFiltersFeature = Feature<'numericFilters'>;
type FilterRelationsEnabledFeature = Feature<'filterRelationsEnabled'>;
type TimeLevelSupportEnabledFeature = Feature<'timeLevelSupportEnabled'>;
type SyncDashboardEventsFeature = Feature<'syncDashboardEvents'>;
type UserProfileFeature = Feature<
  'userProfile',
  {
    tabs: {
      personalInformation: boolean;
      preferences: boolean;
      password: boolean;
      apiToken: boolean;
      sessions: boolean;
    };
  }
>;
type ScatterFeature = Feature<'scatter'>;
type CustomFontsFeature = Feature<'customFonts'>;
type PreferWidgetImageServerExportFeature = Feature<'preferWidgetImageServerExport'>;
type NewAdminUIFeature = Feature<
  'newAdminUI',
  {
    pages: {
      enableNewLicensePage: boolean;
      enableNewGeneralSettingsPage: boolean;
      enableNewFeaturesPage: boolean;
      enableNewSecurityPage: boolean;
      enableNewSSOPage: boolean;
      enableUpgradePage: boolean;
      enableHomePage: boolean;
      enableUsersPage: boolean;
      enableNewAdminNavigation: boolean;
    };
  }
>;
type SharedFormulasFeature = Feature<'sharedFormulas'>;
type SideBarFeature = Feature<'sideBar'>;
type InfusionTokenEndpointFeature = Feature<'infusionTokenEndpoint'>;
type ExplanationsForIndicatorWidgetsFeature = Feature<'explanationsForIndicatorWidgets'>;
type ExplanationsForCategoricalWidgetsFeature = Feature<'explanationsForCategoricalWidgets'>;
type WidgetDesignStyleFeature = Feature<'widgetDesignStyle'>;
type FiscalOnFeature = Feature<'fiscalOn'>;
type ReactAnalyticsWidgetEditorFeature = Feature<'reactAnalyticsWidgetEditor'>;
type DynamicSQLFeature = Feature<'dynamicSQL'>;
type NewCustomConnectorFeature = Feature<'newCustomConnector'>;
type CrossTenantPerspectivesFeature = Feature<'crossTenantPerspectives'>;
type EnableDatamodelPerspectiveFeature = Feature<'enableDatamodelPerspective'>;
type AlwaysDirectRelationsFeature = Feature<'alwaysDirectRelations'>;
type ModelStatisticsFeature = Feature<'modelStatistics'>;
type ExportingCsvFormattedFeature = Feature<'exportingCsvFormatted'>;
type FlexibleTooltipsFeature = Feature<'flexibleTooltips'>;
type DimensionalModelingFeature = {
  key: 'dimensionalModeling';
  visible: boolean;
  freezeEnable: boolean;
  defaultEnable: boolean;
  joinConditionEnable: boolean;
};

type CloudCDNFeature = Feature<'cloudCDN'>;
type OnboardingFeature = Feature<'onboarding'>;

export type Features = (
  | AlertingFeature
  | LiveQueryFeature
  | NlqFeature
  | PivotFeature
  | CustomCodeFeature
  | CustomCodeTransformationFeature
  | BuildDestinationFeature
  | VersionHistoryFeature
  | EmbedCodeFeature
  | LiveCustomColumnFeature
  | ExportingEngineV2Feature
  | ExportingXlsxV2Feature
  | ExportingCsvFeature
  | ConnectionManagementFeature
  | SisenseLightFeature
  | WizardSqlEditorFeature
  | MultiTenancyFeature
  | BloxFeature
  | FunnelFeature
  | Cloud360Feature
  | BreakByToggleFeature
  | GitIntegrationFeature
  | InfusionFeature
  | InfusionWebClientFeature
  | NotebooksFeature
  | AdminWebClientFeature
  | DateTimeFiltersFeature
  | TextFiltersFeature
  | NumericFiltersFeature
  | FilterRelationsEnabledFeature
  | TimeLevelSupportEnabledFeature
  | SyncDashboardEventsFeature
  | UserProfileFeature
  | ScatterFeature
  | CustomFontsFeature
  | PreferWidgetImageServerExportFeature
  | NewAdminUIFeature
  | SharedFormulasFeature
  | SideBarFeature
  | InfusionTokenEndpointFeature
  | ExplanationsForIndicatorWidgetsFeature
  | ExplanationsForCategoricalWidgetsFeature
  | WidgetDesignStyleFeature
  | FiscalOnFeature
  | ReactAnalyticsWidgetEditorFeature
  | DynamicSQLFeature
  | NewCustomConnectorFeature
  | CrossTenantPerspectivesFeature
  | EnableDatamodelPerspectiveFeature
  | AlwaysDirectRelationsFeature
  | ModelStatisticsFeature
  | ExportingCsvFormattedFeature
  | FlexibleTooltipsFeature
  | DimensionalModelingFeature
  | CloudCDNFeature
  | OnboardingFeature
)[];

export type FeatureByKey<K extends string> = Extract<Features[number], { key: K }>;

export type FeatureMap = {
  [K in Features[number]['key']]: FeatureByKey<K>;
};
