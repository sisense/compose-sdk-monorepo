import type { JaqlQueryPayload } from '@sisense/sdk-query-client';

export interface GetNlgInsightsRequest {
  /**
   * @privateRemarks
   * JAQL sent with narrative requests. Chart narratives omit pivot-only fields; pivot narratives
   * include full `JaqlQueryPayload` fields (`format`, `grandTotals`, `queryGuid`, etc.).
   * The SDK sets the payload `by` field to `ComposeSDK` when calling the narrative API.
   *
   */
  jaql: Partial<JaqlQueryPayload> & Pick<JaqlQueryPayload, 'datasource' | 'metadata'>;
  verbosity?: 'Low' | 'High';
}

/** @internal */
export type NarrativeRequest = GetNlgInsightsRequest;

export interface NarrativeResponse {
  data?: {
    answer: string;
  };
  responseType: 'Text';
}

/**
 * Payload for `api/v2/ai/feedback`.
 *
 * @internal
 */
export interface SendAiFeedbackRequest {
  type: string;
  data: object;
  sourceId: string;
  rating: -1 | 1;
}

export type GetNlgInsightsResponse = NarrativeResponse;
