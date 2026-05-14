import type { HttpClient } from '@sisense/sdk-rest-client';

import type { NarrativeRequest, NarrativeResponse } from './narrative-api-types.js';
import { NARRATIVE_BY_CSDK } from './narrative-constants.js';

/**
 * Adds `by: NARRATIVE_BY_CSDK` to the request.
 * Somehow, the endpoint returns "400 - The jaql failed to run. Provide a valid jaql."
 * for JAQL with trend or forecast if the `by` is not set.
 *
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

function isNarrative400(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  return hasStatusProperty(error) && error.status === '400';
}

/**
 * Options for getNarrative. All endpoint choice logic lives in this module.
 *
 * @internal
 */
export type GetNarrativeOptions = {
  canGenerateNarrativeViaAI?: boolean;
  /**
   * When provided and the primary request returns a 400, the request is retried once with this
   * fallback payload. Intended for trend/forecast stripping when the backend cannot handle them.
   */
  fallbackRequestOn400?: NarrativeRequest;
};

async function fetchUnifiedNarrativeWithFallback(
  httpClient: HttpClient,
  request: NarrativeRequest,
): Promise<NarrativeResponse | undefined> {
  const payload = withNarrativeRequestBy(request);
  try {
    return await httpClient.post<NarrativeResponse>(UNIFIED_NARRATIVE_ENDPOINT, payload);
  } catch (err) {
    if (!isUnifiedNarrativeEndpointMissing(err)) throw err;

    return await httpClient.post<NarrativeResponse>(LEGACY_NARRATIVE_ENDPOINT, payload);
  }
}

/**
 * Fetches Narrative. Single place for endpoint logic: when `canGenerateNarrativeViaAI` is truthy,
 * try the unified endpoint first and fall back to legacy on 404; otherwise hit legacy directly.
 * When `fallbackRequestOn400` is provided and the primary request returns a 400, the request is
 * retried once with the fallback payload.
 *
 * @param httpClient - HttpClient instance
 * @param request - Narration request payload
 * @param options - Optional; `canGenerateNarrativeViaAI` (typically from `app.settings.narrative`)
 * @returns Promise that resolves with narration JSON or `undefined` (same semantics as `HttpClient.post`)
 * @internal
 */
export async function getNarrative(
  httpClient: HttpClient,
  request: NarrativeRequest,
  options?: GetNarrativeOptions,
): Promise<NarrativeResponse | undefined> {
  const { canGenerateNarrativeViaAI, fallbackRequestOn400 } = options ?? {};

  const run = (req: NarrativeRequest) =>
    canGenerateNarrativeViaAI
      ? fetchUnifiedNarrativeWithFallback(httpClient, req)
      : httpClient.post<NarrativeResponse>(LEGACY_NARRATIVE_ENDPOINT, withNarrativeRequestBy(req));

  if (!fallbackRequestOn400) return run(request);

  try {
    return await run(request);
  } catch (e) {
    if (!isNarrative400(e)) throw e;
    return run(fallbackRequestOn400);
  }
}
