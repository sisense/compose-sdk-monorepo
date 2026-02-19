import { screen, waitFor } from '@testing-library/react';

import { setup } from '@/__test-helpers__';
import { ChartInsights } from '@/modules/ai/chart/chart-insights';

import { AiTestWrapper } from '../__mocks__';
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
