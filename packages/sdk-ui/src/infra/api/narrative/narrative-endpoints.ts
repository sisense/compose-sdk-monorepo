import type { HttpClient } from '@sisense/sdk-rest-client';

import type { NarrativeRequest, NarrativeResponse } from './narrative-api-types.js';
import { NARRATIVE_BY_CSDK } from './narrative-constants.js';

/**
 * Adds `by: NARRATIVE_BY_CSDK` to the request.
 * Somehow, the endpoint returns "400 - The jaql failed to run. Provide a valid jaql."
 * for JAQL with trend or forecast if the `by` is not set.
 * @internal
 */
function withNarrativeRequestBy(request: NarrativeRequest): NarrativeRequest {
  return {
    ...request,
    jaql: { ...request.jaql, by: NARRATIVE_BY_CSDK },
  };
}

/** Unified narrative endpoint. Try first; fall back to legacy on 404. */
export const UNIFIED_NARRATIVE_ENDPOINT = 'api/v2/ai/narrative';

/** Legacy endpoint (used when unified narrative returns 404). */
export const LEGACY_NARRATIVE_ENDPOINT = 'api/v2/ai/nlg/queryResult';

function hasStatusProperty(obj: object): obj is object & { status: unknown } {
  return 'status' in obj;
}

function isUnifiedNarrativeEndpointMissing(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  return hasStatusProperty(error) && error.status === '404';
}

/**
 * Options for getNarrative. All endpoint choice logic lives in this module.
 *
 * @internal
 */
export type GetNarrativeOptions = {
  isUnifiedNarrationEnabled?: boolean;
  isSisenseAiEnabled?: boolean;
};

async function fetchUnifiedNarrativeWithFallback(
  httpClient: HttpClient,
  request: NarrativeRequest,
): Promise<NarrativeResponse> {
  const payload = withNarrativeRequestBy(request);
  try {
    const response = await httpClient.post<NarrativeResponse>(UNIFIED_NARRATIVE_ENDPOINT, payload);
    return response as NarrativeResponse;
  } catch (err) {
    if (!isUnifiedNarrativeEndpointMissing(err)) throw err;

    const response = await httpClient.post<NarrativeResponse>(LEGACY_NARRATIVE_ENDPOINT, payload);
    return response as NarrativeResponse;
  }
}

/**
 * Fetches Narrative. Single place for endpoint logic: isUnifiedNarrationEnabled === false → legacy only;
 * otherwise try unified endpoint first, fall back to legacy on 404.
 *
 * @param httpClient - HttpClient instance
 * @param request - Narration request payload
 * @param options - Optional; isUnifiedNarrationEnabled (from props.isUnifiedNarrationEnabled)
 * @returns Promise with narration response
 * @internal
 */
export async function getNarrative(
  httpClient: HttpClient,
  request: NarrativeRequest,
  options?: GetNarrativeOptions,
): Promise<NarrativeResponse> {
  const { isUnifiedNarrationEnabled = false, isSisenseAiEnabled = false } = options ?? {};

  if (isUnifiedNarrationEnabled && isSisenseAiEnabled) {
    return fetchUnifiedNarrativeWithFallback(httpClient, request);
  }

  const response = await httpClient.post<NarrativeResponse>(
    LEGACY_NARRATIVE_ENDPOINT,
    withNarrativeRequestBy(request),
  );
  return response as NarrativeResponse;
}
