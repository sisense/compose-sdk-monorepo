import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { TranslatableError } from '@/infra/translation/translatable-error';

const POLLING_INTERVAL = 60000; // 60 seconds

export const DEFAULT_WARNING_THRESHOLD = 85;
export const DEFAULT_EXCEEDED_THRESHOLD = 100;

/**
 * Response from the quota/credit balance API
 *
 * @internal
 */
export interface QuotaApiResponse {
  balance: number;
  initialBalance: number;
  sequenceNumber: string;
  date: string;
}

/**
 * Calculated quota state from API response
 *
 * @internal
 */
export interface QuotaState {
  initialBalance: number;
  currentBalance: number;
  usagePercentage: number;
  isWarning: boolean;
  isExceeded: boolean;
}

/**
 * Options for useQuotaNotification
 *
 * @internal
 */
export interface QuotaNotificationOptions {
  /** Whether to fetch. When false, skips API calls and polling. Defaults to feature-flag value. */
  enabled?: boolean;
  /** Warning threshold percentage. Defaults to 85. */
  warningThreshold?: number;
  /** Exceeded threshold percentage. Defaults to 100. */
  exceededThreshold?: number;
}

const isQuotaNotificationEnabledByFeatureFlags = (
  quotaNotification?: boolean,
  featureModelType?: string,
): boolean => quotaNotification === true && featureModelType === 'sisense_managed';

function calculateQuota(
  response: QuotaApiResponse,
  warningThreshold: number,
  exceededThreshold: number,
): QuotaState {
  const { initialBalance, balance } = response;

  if (initialBalance === 0) {
    return {
      initialBalance,
      currentBalance: balance,
      usagePercentage: 0,
      isWarning: false,
      isExceeded: true,
    };
  }

  const rawPercentage = ((initialBalance - balance) / initialBalance) * 100;
  const usagePercentage = Math.min(Math.max(rawPercentage, 0), 100);

  return {
    initialBalance,
    currentBalance: balance,
    usagePercentage,
    isWarning: usagePercentage >= warningThreshold && usagePercentage < exceededThreshold,
    isExceeded: usagePercentage >= exceededThreshold,
  };
}

/**
 * Hook that fetches and calculates quota notification state with automatic polling.
 * Respects aiAssistant feature flags (quotaNotification + featureModelType) when enabled is not passed.
 *
 * Polls every 60 seconds to keep quota state up-to-date.
 *
 * @param options - Quota notification options. When enabled is false, skips fetching and polling.
 * @returns Quota state, enabled flag, loading status, and error
 * @internal
 */
export const useQuotaNotification = (options: QuotaNotificationOptions = {}) => {
  const {
    enabled: enabledOption,
    warningThreshold = DEFAULT_WARNING_THRESHOLD,
    exceededThreshold = DEFAULT_EXCEEDED_THRESHOLD,
  } = options;

  const { app } = useSisenseContext();
  const httpClient = app?.httpClient;
  const aiAssistant = app?.settings?.serverFeatures?.aiAssistant;
  const enabledByFeatureFlags = isQuotaNotificationEnabledByFeatureFlags(
    aiAssistant?.quotaNotification,
    aiAssistant?.featureModelType,
  );
  const enabled = enabledByFeatureFlags && (enabledOption ?? true);

  const { data, isLoading, error } = useQuery<QuotaApiResponse>({
    queryKey: ['creditBalance'],
    queryFn: async (): Promise<QuotaApiResponse> => {
      if (!httpClient) {
        throw new TranslatableError('errors.httpClientNotFound');
      }
      const response = await httpClient.call<QuotaApiResponse>(
        httpClient.url + 'api/v1/credits/get-balance',
        { method: 'GET' },
      );
      if (!response) {
        throw new TranslatableError('ai.errors.failedToFetchCreditBalance');
      }
      return response;
    },
    enabled: !!httpClient && enabled,
    refetchInterval: POLLING_INTERVAL,
  });

  const quotaState = useMemo((): QuotaState | null => {
    if (!data) return null;
    return calculateQuota(data, warningThreshold, exceededThreshold);
  }, [data, warningThreshold, exceededThreshold]);

  return { enabled, quotaState, isLoading, error };
};
