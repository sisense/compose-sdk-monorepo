import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { AiTestWrapper } from '../__mocks__';
import { ChartInsights } from '@/ai/chart/chart-insights';

import { GetNlgQueryResultRequest, GetNlgQueryResultResponse } from '../api/types';

const mockNlgRequest: GetNlgQueryResultRequest = {
  jaql: {
    datasource: { title: 'Sample ECommerce' },
    metadata: [],
  },
};

describe('ChartInsights', () => {
  beforeEach(() => {
    server.use(
      http.post('*/api/v2/ai/nlg/queryResult', () =>
        HttpResponse.json<GetNlgQueryResultResponse>({
          responseType: 'Text',
          data: {
            answer: 'nlg response text',
          },
        }),
      ),
    );
  });

  it('renders loading icon, then response text if API call returns text response', async () => {
    setup(
      <AiTestWrapper>
        <ChartInsights nlgRequest={mockNlgRequest} />
      </AiTestWrapper>,
    );

    await waitFor(() => expect(screen.getByLabelText('loading dots')).toBeInTheDocument());

    await waitFor(() => expect(screen.getByText('nlg response text')).toBeInTheDocument());
  });

  it('renders loading icon, then default text if API call returns empty response', async () => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.json({})));

    setup(
      <AiTestWrapper>
        <ChartInsights nlgRequest={mockNlgRequest} />
      </AiTestWrapper>,
    );

    await waitFor(() => expect(screen.getByLabelText('loading dots')).toBeInTheDocument());

    await waitFor(() => expect(screen.getByText('No insights available.')).toBeInTheDocument());
  });

  it('renders loading icon, then error text if API call fails', async () => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.error()));

    setup(
      <AiTestWrapper>
        <ChartInsights nlgRequest={mockNlgRequest} />
      </AiTestWrapper>,
    );

    await waitFor(() => expect(screen.getByLabelText('loading dots')).toBeInTheDocument());

    await waitFor(() =>
      expect(
        screen.getByText('Oh snap, something went wrong. Please try again later.'),
      ).toBeInTheDocument(),
    );
  });
});
