import type { HttpClient } from '@sisense/sdk-rest-client';

import type { SendAiFeedbackRequest } from './narrative-api-types.js';

const FEEDBACK_ENDPOINT = 'api/v2/ai/feedback';

/**
 * Posts AI / chart insight feedback (thumbs).
 *
 * @internal
 */
export function sendAiFeedback(
  httpClient: HttpClient,
  request: SendAiFeedbackRequest,
): Promise<unknown> {
  return httpClient.post(FEEDBACK_ENDPOINT, request);
}
