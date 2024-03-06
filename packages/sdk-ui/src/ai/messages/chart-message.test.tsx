import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MockApiWrapper } from '../__mocks__';
import MOCK_JAQL_RESPONSE from '../__mocks__/jaql-response';
import MOCK_NLQ_RESPONSE from '../__mocks__/nlq-response';
import ChartMessage from './chart-message';

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

describe('ChartMessage', () => {
  beforeEach(() => {
    server.use(
      http.post('*/api/datasources/Sample%20ECommerce/jaql', () =>
        HttpResponse.json(MOCK_JAQL_RESPONSE),
      ),
    );
  });

  it('renders expandable cartesian chart with expected toolbar buttons', async () => {
    const { user } = setup(
      <MockApiWrapper>
        <ChartMessage content={MOCK_NLQ_RESPONSE} dataSource="Sample ECommerce" />
      </MockApiWrapper>,
    );

    await waitFor(() => expect(screen.getByTestId('highcharts-react')).toBeInTheDocument());
    const originalChart = screen.getByTestId('highcharts-react');

    expect(screen.getByLabelText('chatbot chart toolbar')).toBeInTheDocument();

    const infoTooltipText = MOCK_NLQ_RESPONSE.detailedDescription;
    expect(screen.getByLabelText(infoTooltipText)).toBeInTheDocument();

    const threeDotsButton = screen.getByLabelText('three dots button');
    await user.click(threeDotsButton);
    expect(screen.getByRole('menuitem')).toHaveTextContent('Refresh');

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
  });

  it('renders a table chart', async () => {
    setup(
      <MockApiWrapper>
        <ChartMessage
          content={{
            ...MOCK_NLQ_RESPONSE,
            chartRecommendations: {
              chartType: 'table',
              chartFamily: 'table',
            },
          }}
          dataSource="Sample ECommerce"
        />
      </MockApiWrapper>,
    );

    await waitFor(() => expect(screen.getByLabelText('table-root')).toBeInTheDocument());
  });
});
