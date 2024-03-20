import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { screen, waitFor } from '@testing-library/react';
import { AiTestWrapper } from './__mocks__';
import { http, HttpResponse } from 'msw';
import GetNlgQueryResult, { GetNlgQueryResultProps } from './get-nlg-query-result';
import { GetNlgQueryResultResponse } from './api/types';

const nlgRequest: GetNlgQueryResultProps = {
  dataSource: 'Sample ECommerce',
  measures: [],
};

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

it('renders a text summary', async () => {
  setup(
    <AiTestWrapper>
      <GetNlgQueryResult {...nlgRequest} />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByText('nlg response text')).toBeInTheDocument());
});

it('renders error messsage if API call fails', async () => {
  server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.error()));

  setup(
    <AiTestWrapper>
      <GetNlgQueryResult {...nlgRequest} />
    </AiTestWrapper>,
  );

  await waitFor(() =>
    expect(
      screen.getByText('Oh snap, something went wrong. Please try again later.'),
    ).toBeInTheDocument(),
  );
});
