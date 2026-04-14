import type { HttpClient } from '@sisense/sdk-rest-client';

import type { NarrativeRequest } from './narrative-api-types.js';
import { NARRATIVE_BY_CSDK } from './narrative-constants.js';
import {
  getNarrative,
  LEGACY_NARRATIVE_ENDPOINT,
  UNIFIED_NARRATIVE_ENDPOINT,
} from './narrative-endpoints.js';

const mockResponse = {
  responseType: 'Text' as const,
  data: { answer: 'ok' },
};

const baseRequest: NarrativeRequest = {
  jaql: {
    datasource: { title: 'Sample ECommerce' },
    metadata: [],
  },
};

describe('getNarrative', () => {
  it('sends jaql.by ComposeSDK on legacy-only path', async () => {
    const post = vi.fn().mockResolvedValue(mockResponse);
    const httpClient = { post } as unknown as HttpClient;

    await getNarrative(httpClient, baseRequest, {
      isUnifiedNarrationEnabled: false,
      isSisenseAiEnabled: false,
    });

    expect(post).toHaveBeenCalledWith(LEGACY_NARRATIVE_ENDPOINT, {
      ...baseRequest,
      jaql: { ...baseRequest.jaql, by: NARRATIVE_BY_CSDK },
    });
  });

  it('sends jaql.by ComposeSDK on unified path when unified + Sisense AI are enabled', async () => {
    const post = vi.fn().mockResolvedValue(mockResponse);
    const httpClient = { post } as unknown as HttpClient;

    await getNarrative(httpClient, baseRequest, {
      isUnifiedNarrationEnabled: true,
      isSisenseAiEnabled: true,
    });

    expect(post).toHaveBeenCalledWith(UNIFIED_NARRATIVE_ENDPOINT, {
      ...baseRequest,
      jaql: { ...baseRequest.jaql, by: NARRATIVE_BY_CSDK },
    });
  });

  it('falls back to legacy with jaql.by when unified returns 404', async () => {
    const unifiedError = { status: '404' };
    const post = vi.fn().mockRejectedValueOnce(unifiedError).mockResolvedValueOnce(mockResponse);
    const httpClient = { post } as unknown as HttpClient;

    await getNarrative(httpClient, baseRequest, {
      isUnifiedNarrationEnabled: true,
      isSisenseAiEnabled: true,
    });

    const payload = {
      ...baseRequest,
      jaql: { ...baseRequest.jaql, by: NARRATIVE_BY_CSDK },
    };
    expect(post).toHaveBeenNthCalledWith(1, UNIFIED_NARRATIVE_ENDPOINT, payload);
    expect(post).toHaveBeenNthCalledWith(2, LEGACY_NARRATIVE_ENDPOINT, payload);
  });
});
