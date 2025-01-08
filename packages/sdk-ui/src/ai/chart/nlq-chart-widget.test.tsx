import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { AiTestWrapper } from '../__mocks__';

import { GetNlgQueryResultResponse, type NlqResponseData } from '../api/types';
import { NlqChartWidget } from '@/ai';
import MOCK_NLQ_RESPONSE from '@/ai/__mocks__/nlq-response';
import { setTimeout } from 'timers/promises';

vi.mock(
  '@/widgets/chart-widget',
  async (importOriginal): Promise<typeof import('@/widgets/chart-widget')> => {
    const { ChartWidget } = await importOriginal<typeof import('@/widgets/chart-widget')>();
    const { forwardRef }: typeof import('react') = await import('react');

    const mockChartWidget: typeof ChartWidget = forwardRef((props) => (
      <div data-testid="chart-widget-mocked">{props.topSlot}</div>
    ));

    return {
      ChartWidget: mockChartWidget,
    };
  },
);

const mockNlqResponseData: NlqResponseData = MOCK_NLQ_RESPONSE;
const mockNlqResponseText = 'nlg response text';

describe('NlqChartWidget', () => {
  beforeEach(() => {
    server.use(
      http.post('*/api/v2/ai/nlg/queryResult', () =>
        HttpResponse.json<GetNlgQueryResultResponse>({
          responseType: 'Text',
          data: {
            answer: mockNlqResponseText,
          },
        }),
      ),
    );
  });

  it('renders loading icon, then insights text and chart widget', async () => {
    setup(
      <AiTestWrapper>
        <NlqChartWidget nlqResponse={mockNlqResponseData} />
      </AiTestWrapper>,
    );

    await waitFor(() => expect(screen.getByLabelText('loading dots')).toBeInTheDocument());

    await waitFor(() => expect(screen.getByText(mockNlqResponseText)).toBeInTheDocument());

    await setTimeout(250);

    await waitFor(() => expect(screen.getByTestId('chart-widget-mocked')).toBeInTheDocument());
  });

  it('renders loading icon, then default text if API call returns empty response', async () => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.json({})));

    setup(
      <AiTestWrapper>
        <NlqChartWidget nlqResponse={mockNlqResponseData} />
      </AiTestWrapper>,
    );

    await waitFor(() =>
      expect(screen.queryByText('No insights available.')).not.toBeInTheDocument(),
    );
  });

  it('renders loading icon, then error text if API call fails', async () => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.error()));

    setup(
      <AiTestWrapper>
        <NlqChartWidget nlqResponse={mockNlqResponseData} />
      </AiTestWrapper>,
    );

    await waitFor(() => expect(screen.getByLabelText('loading dots')).toBeInTheDocument());

    await waitFor(() =>
      expect(
        screen.queryByText('Oh snap, something went wrong. Please try again later.'),
      ).not.toBeInTheDocument(),
    );
  });
});
