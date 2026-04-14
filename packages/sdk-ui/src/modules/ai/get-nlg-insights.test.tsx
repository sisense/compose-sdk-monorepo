import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import {
  LEGACY_NARRATIVE_ENDPOINT,
  UNIFIED_NARRATIVE_ENDPOINT,
} from '@/infra/api/narrative/narrative-endpoints.js';

import { AiTestWrapper } from './__mocks__/index.js';
import { GetNlgInsightsResponse } from './api/types.js';
import GetNlgInsights, { GetNlgInsightsProps } from './get-nlg-insights.js';

const nlgRequest: GetNlgInsightsProps = {
  dataSource: 'Sample ECommerce',
  measures: [],
};

beforeEach(() => {
  server.use(
    http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
    http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () =>
      HttpResponse.json<GetNlgInsightsResponse>({
        responseType: 'Text',
        data: {
          answer: 'nlg response text',
        },
      }),
    ),
  );
});

it('renders a text summary', async () => {
  setup(
    <AiTestWrapper>
      <GetNlgInsights {...nlgRequest} />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByText('nlg response text')).toBeInTheDocument());
});

it('renders error messsage if API call fails', async () => {
  server.use(
    http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
    http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => HttpResponse.error()),
  );

  setup(
    <AiTestWrapper>
      <GetNlgInsights {...nlgRequest} />
    </AiTestWrapper>,
  );

  await waitFor(() =>
    expect(
      screen.getByText('Oh snap, something went wrong. Please try again later.'),
    ).toBeInTheDocument(),
  );
});
