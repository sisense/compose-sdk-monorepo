export type DeploymentProps = {
  timeLeft: number;
  isHASupported: boolean;
  isTrial: boolean;
  pRegex: null;
  pError: null;
  sessionMethod: 'client';
  sessionOnlyCookie: null;
  isNarration: boolean;
  isNLQ: boolean;
  isCustomCode: boolean;
  isForecast: boolean;
  isTrend: boolean;
  isExplanations: boolean;
  isBuildDestination: boolean;
  UsageAnalytics: boolean;
  pluginsInfo: {
    fileNames: string[];
    enabledPlugins: any[];
    enabledCDNUrls: any[];
  };
  isNewArchitecture: boolean;
  buildNodeHost: null;
  os: 'linux';
  sso: {
    enabled: null;
    type: 'jwt';
    jwtLoginUrl: null;
  };
  isAd: boolean;
  newReturnToValidationBehavior: boolean;
  internalMonitoring: boolean;
  isManagedService: boolean;
  licenseState: 'valid';
  narrationProvider: 'arria';
  InfusionApps: boolean;
};
