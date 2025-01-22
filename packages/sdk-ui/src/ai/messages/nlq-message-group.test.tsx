import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { GetNlgInsightsResponse } from '../api/types.js';
import { AiTestWrapper } from '../__mocks__/index.js';
import MOCK_JAQL_RESPONSE from '../__mocks__/jaql-response.js';
import MOCK_NLQ_RESPONSE from '../__mocks__/nlq-response.js';
import NlqMessageGroup from './nlq-message-group.js';
import { setTimeout } from 'timers/promises';

vi.mock(
  'highcharts-react-official',
  async (importOriginal): Promise<typeof import('highcharts-react-official')> => {
    const { HighchartsReact } = await importOriginal<typeof import('highcharts-react-official')>();
    const { forwardRef }: typeof import('react') = await import('react');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const mockHighchartsReact: typeof HighchartsReact = forwardRef((props, _ref) => (
      <div data-testid="highcharts-react">{JSON.stringify(props.options)}</div>
    ));

    return {
      default: mockHighchartsReact,
      HighchartsReact: mockHighchartsReact,
    };
  },
);

const mockJaqlApi = () => {
  server.use(
    http.post('*/api/datasources/Sample%20ECommerce/jaql', () =>
      HttpResponse.json(MOCK_JAQL_RESPONSE),
    ),
  );
};

const mockNlgApi = (text: string) => {
  server.use(
    http.post('*/api/v2/ai/nlg/queryResult', () =>
      HttpResponse.json<GetNlgInsightsResponse>({
        responseType: 'Text',
        data: {
          answer: text,
        },
      }),
    ),
  );
};

beforeEach(() => {
  mockJaqlApi();
});

// this test tends to timeout locally. Added a longer timeout to prevent flakiness
it('renders expandable cartesian chart with expected toolbar buttons', async () => {
  const { user } = setup(
    <AiTestWrapper>
      <NlqMessageGroup data={MOCK_NLQ_RESPONSE} />
    </AiTestWrapper>,
  );
  await setTimeout(250);

  await waitFor(() => expect(screen.getByTestId('highcharts-react')).toBeInTheDocument());
  const originalChart = screen.getByTestId('highcharts-react');

  expect(screen.getByLabelText('chatbot chart toolbar')).toBeInTheDocument();

  const infoTooltipText = MOCK_NLQ_RESPONSE.detailedDescription;
  expect(screen.getByLabelText(infoTooltipText)).toBeInTheDocument();

  const threeDotsButton = screen.getByLabelText('three dots button');
  await user.click(threeDotsButton);

  expect(screen.getByRole('menu')).toBeInTheDocument();

  const menuItems = screen.getAllByRole('menuitem');
  expect(menuItems[0]).toHaveTextContent('Refresh');

  await user.click(menuItems[0]);
  expect(screen.queryByRole('menu')).toBeNull();

  const expandTooltipText = 'Preview';
  const expandButton = screen.getByLabelText(expandTooltipText);
  await user.click(expandButton);

  const modal = screen.getByRole('dialog');
  expect(modal).toBeInTheDocument();

  const expandedChart = within(modal).getByTestId('highcharts-react');
  expect(expandedChart).toBeInTheDocument();
  expect(expandedChart).not.toEqual(originalChart);

  const closeButton = within(modal).getByLabelText('close expanded chart');
  await user.click(closeButton);

  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(expandedChart).not.toBeInTheDocument();
}, 10000);

it('renders a table chart', async () => {
  setup(
    <AiTestWrapper>
      <NlqMessageGroup
        data={{
          ...MOCK_NLQ_RESPONSE,
          chartRecommendations: {
            chartType: 'table',
            chartFamily: 'table',
          },
        }}
      />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByLabelText('table-root')).toBeInTheDocument());
});

it('shows a text summary when the insights button is clicked', async () => {
  const text = 'nlg response';
  mockNlgApi(text);

  const { user } = setup(
    <AiTestWrapper>
      <NlqMessageGroup data={MOCK_NLQ_RESPONSE} />
    </AiTestWrapper>,
  );

  await waitFor(() => expect(screen.getByText('Insights')).toBeInTheDocument());

  expect(screen.queryByText(text)).toBeNull();

  await user.click(screen.getByText('Insights'));

  await waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());

  // hide insights
  await user.click(screen.getByText('Insights'));
  expect(screen.queryByText(text)).toBeNull();
});
