/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable max-params */
import { normalizeUrl } from '@sisense/sdk-common';
import { PivotQueryClient } from '@sisense/sdk-pivot-query-client';
import { DimensionalQueryClient } from '@sisense/sdk-query-client';
import { getAuthenticator, HttpClient } from '@sisense/sdk-rest-client';

import { clearExecuteQueryCache } from '@/domains/query-execution/core/execute-query';
import { SisenseContextProviderProps } from '@/index';
import { SYSTEM_TENANT_NAME } from '@/shared/const';

import { TranslatableError } from '../translation/translatable-error';
import { isApiTelemetryEnabled, prepareApiTelemetryHeaders } from './helpers';
import { getSettings } from './settings/settings';
import { type ClientApplication, SystemSettings } from './types';

type ClientApplicationParams = Pick<
  SisenseContextProviderProps,
  | 'appConfig'
  | 'defaultDataSource'
  | 'url'
  | 'token'
  | 'wat'
  | 'ssoEnabled'
  | 'enableSilentPreAuth'
  | 'useFusionAuth'
  | 'alternativeSsoHost'
  | 'ssoMaxAuthRedirectAttempts'
  | 'ssoRedirectAttemptsTtlMs'
  | 'disableFusionPalette'
> & {
  /**
   * @internal
   */
  packageName?: string;
};

function getBaseUrl(url: string, tenantName: string) {
  return tenantName === SYSTEM_TENANT_NAME ? url : url.replace(`/${tenantName}`, '');
}

function normalizeErrors() {
  // todo: add unsubscribe flow
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    // TODO: replace this with custom logger
    if (event.reason instanceof Error) {
      console.error(event.reason.message);
    } else {
      console.error(event.reason);
    }
  });
}

/** @internal */
export const createClientApplication = async ({
  defaultDataSource,
  url: rawUrl,
  token,
  wat,
  ssoEnabled,
  appConfig,
  enableSilentPreAuth,
  useFusionAuth,
  alternativeSsoHost,
  ssoMaxAuthRedirectAttempts,
  ssoRedirectAttemptsTtlMs,
  disableFusionPalette,
  packageName = 'sdk-ui',
}: ClientApplicationParams): Promise<ClientApplication> => {
  if (rawUrl === undefined) {
    throw new TranslatableError('errors.sisenseContextNoAuthentication');
  }

  const url = normalizeUrl(rawUrl);
  const urlWithSearchParams = normalizeUrl(rawUrl, true);

  const auth = getAuthenticator({
    url: urlWithSearchParams,
    token,
    wat,
    ssoEnabled,
    enableSilentPreAuth,
    useFusionAuth,
    alternativeSsoHost,
    ssoMaxAuthRedirectAttempts,
    ssoRedirectAttemptsTtlMs,
  });

  if (!auth) {
    throw new TranslatableError('errors.sisenseContextNoAuthentication');
  }

  normalizeErrors();

  const env = packageName + (__PACKAGE_VERSION__ ? `-${__PACKAGE_VERSION__}` : '');
  let httpClient: HttpClient = new HttpClient(url, auth, env);
  const loginSuccess = await httpClient.login();

  // do not fetch palette settings from server if login failed
  // SSO redirect is considered failed login as there will be another login attempt
  const useDefaultPalette = disableFusionPalette || !loginSuccess;
  const settings = await getSettings(appConfig || {}, httpClient, useDefaultPalette);
  const systemSettings = await httpClient.get<SystemSettings>('api/v1/settings/system');
  if (isApiTelemetryEnabled(systemSettings)) {
    httpClient = new HttpClient(
      url,
      auth,
      env,
      prepareApiTelemetryHeaders(packageName, appConfig, useFusionAuth),
    );
  }

  const pivotQueryClient = new PivotQueryClient(getBaseUrl(url, settings.user.tenant.name), auth);
  const queryClient = new DimensionalQueryClient(httpClient, pivotQueryClient);

  const queryCache = {
    clear: clearExecuteQueryCache,
  };

  return {
    httpClient,
    pivotQueryClient,
    queryClient,
    settings,
    // todo: make it optional (incorrect previous implementation)
    defaultDataSource: defaultDataSource,
    queryCache,
  };
};
