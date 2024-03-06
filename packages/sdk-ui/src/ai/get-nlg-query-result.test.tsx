import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { screen, waitFor } from '@testing-library/react';
import { MockApiWrapper } from './__mocks__';
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
    <MockApiWrapper>
      <GetNlgQueryResult {...nlgRequest} />
    </MockApiWrapper>,
  );

  await waitFor(() => expect(screen.getByText('nlg response text')).toBeInTheDocument());
});
