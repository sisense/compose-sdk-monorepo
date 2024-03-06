import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { screen, waitFor } from '@testing-library/react';
import { MockApiWrapper } from '../__mocks__';
import { http, HttpResponse } from 'msw';
import { GetNlgQueryResultResponse } from '../api/types';
import InsightsMessage from './insights-message';

const mockNlgApi = (text: string) => {
  server.use(
    http.post('*/api/v2/ai/nlg/queryResult', () =>
      HttpResponse.json<GetNlgQueryResultResponse>({
        responseType: 'Text',
        data: {
          answer: text,
        },
      }),
    ),
  );
};

it('shows a text summary when the insights button is clicked', async () => {
  const text = 'nlg response';
  mockNlgApi(text);

  const { user } = setup(
    <MockApiWrapper>
      <InsightsMessage
        dataSource="Sample ECommerce"
        metadata={[
          {
            jaql: {
              agg: 'sum',
              column: 'Revenue',
              datatype: 'numeric',
              dim: '[Commerce.Revenue]',
              table: 'Commerce',
              title: 'total of Revenue',
            },
          },
        ]}
      />
    </MockApiWrapper>,
  );

  await waitFor(() => expect(screen.getByText('Insights')).toBeInTheDocument());

  expect(screen.queryByText(text)).toBeNull();

  await user.click(screen.getByText('Insights'));

  await waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());
});

it('allows for expanding and collapsing of text when over character limit', async () => {
  const text =
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget' +
    ' dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes,' +
    ' nascetur ridiculus mus. Donec quam felis';
  mockNlgApi(text);

  const { user } = setup(
    <MockApiWrapper>
      <InsightsMessage
        dataSource="Sample ECommerce"
        metadata={[
          {
            jaql: {
              agg: 'sum',
              column: 'Revenue',
              datatype: 'numeric',
              dim: '[Commerce.Revenue]',
              table: 'Commerce',
              title: 'total of Revenue',
            },
          },
        ]}
      />
    </MockApiWrapper>,
  );

  await waitFor(() => expect(screen.getByText('Insights')).toBeInTheDocument());

  expect(screen.queryByText(text)).toBeNull();

  await user.click(screen.getByText('Insights'));

  await waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());

  expect(screen.getByText(text)).toHaveClass(/line-clamp-5/);

  await user.click(screen.getByText('Read more'));

  expect(screen.getByText(text)).not.toHaveClass(/line-clamp-5/);

  await user.click(screen.getByText('Collapse'));
});
