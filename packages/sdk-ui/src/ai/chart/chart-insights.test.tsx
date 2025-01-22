import { screen, waitFor } from '@testing-library/react';
import { setup } from '@/__test-helpers__';
import { AiTestWrapper } from '../__mocks__';
import { ChartInsights } from '@/ai/chart/chart-insights';

import { GetNlgInsightsRequest } from '../api/types';

const mockNlgRequest: GetNlgInsightsRequest = {
  jaql: {
    datasource: { title: 'Sample ECommerce' },
    metadata: [],
  },
};

describe('ChartInsights', () => {
  it('renders loading icon, then response text if API call returns text response', async () => {
    setup(
      <AiTestWrapper>
        <ChartInsights nlgRequest={mockNlgRequest} summary="nlg response text" />
      </AiTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText('nlg response text')).toBeInTheDocument());
  });
});
