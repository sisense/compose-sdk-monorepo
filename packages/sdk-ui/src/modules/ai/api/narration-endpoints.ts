import type { HttpClient } from '@sisense/sdk-rest-client';

import type { GetNlgInsightsRequest, GetNlgInsightsResponse } from './types.js';

/** Unified narrative endpoint. Try first; fall back to legacy on 404. */
export const UNIFIED_NARRATION_ENDPOINT = 'api/v2/ai/widget/narrative';

/** Legacy endpoint (used when unified narrative returns 404). */
export const LEGACY_NARRATION_ENDPOINT = 'api/v2/ai/nlg/queryResult';

function hasStatusProperty(obj: object): obj is object & { status: unknown } {
  return 'status' in obj;
}

function isUnifiedNarrationEndpointMissing(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  return hasStatusProperty(error) && error.status === '404';
}

/**
 * Options for getNarrations. All endpoint choice logic lives in this module.
 * @internal
 */
export type GetNarrationsOptions = {
  isUnifiedNarrationEnabled?: boolean;
};

/**
 * Fetches narrations. Single place for endpoint logic: isUnifiedNarrationEnabled === false → legacy only;
 * otherwise try unified endpoint first, fall back to legacy on 404.
 *
 * @param httpClient - HttpClient instance
 * @param request - Narration request payload
 * @param options - Optional; isUnifiedNarrationEnabled (from props.isUnifiedNarrationEnabled)
 * @returns Promise with narration response
 * @internal
 */
export async function getNarrations(
  httpClient: HttpClient,
  request: GetNlgInsightsRequest,
  options?: GetNarrationsOptions,
): Promise<GetNlgInsightsResponse> {
  const useUnifiedNarrationEndpoint = options?.isUnifiedNarrationEnabled !== false;

  if (useUnifiedNarrationEndpoint) {
    try {
      const response = await httpClient.post<GetNlgInsightsResponse>(
        UNIFIED_NARRATION_ENDPOINT,
        request,
      );
      return response as GetNlgInsightsResponse;
    } catch (narrativeError) {
      // Fall back to legacy endpoint only when unified endpoint is missing (404)
      if (!isUnifiedNarrationEndpointMissing(narrativeError)) {
        throw narrativeError;
      }
    }
  }

  const response = await httpClient.post<GetNlgInsightsResponse>(
    LEGACY_NARRATION_ENDPOINT,
    request,
  );
  return response as GetNlgInsightsResponse;
}
