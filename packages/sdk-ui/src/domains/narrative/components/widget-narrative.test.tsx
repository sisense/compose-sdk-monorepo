import { measureFactory } from '@sisense/sdk-data';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import type { GetNlgInsightsResponse } from '@/infra/api/narrative/narrative-api-types.js';
import {
  LEGACY_NARRATIVE_ENDPOINT,
  UNIFIED_NARRATIVE_ENDPOINT,
} from '@/infra/api/narrative/narrative-endpoints.js';

import { NarrativeTestWrapper } from '../__test-helpers__/narrative-test-wrapper.js';
import { WidgetNarrative } from './widget-narrative.js';

const mockChartWidgetProps: WidgetProps = {
  widgetType: 'chart',
  id: 'test-widget',
  chartType: 'bar',
  dataSource: 'Sample ECommerce',
  dataOptions: {
    category: [DM.Commerce.Date.Months],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
  },
};

const mockPivotWidgetProps: WidgetProps = {
  widgetType: 'pivot',
  id: 'test-pivot',
  dataSource: 'Sample ECommerce',
  dataOptions: {
    rows: [DM.Commerce.AgeRange],
    columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
    values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
  },
};

const chartWithFeedback: WidgetProps = {
  ...mockChartWidgetProps,
  aiOptions: {
    narrative: { feedback: { enabled: true } },
  },
};

const summaryText = 'widget narrative summary text';

const mockNlgResponse: GetNlgInsightsResponse = {
  responseType: 'Text',
  data: {
    answer: summaryText,
  },
};

const useLegacyNarrativeHandlers = () => {
  server.use(
    http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
    http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => HttpResponse.json(mockNlgResponse)),
  );
};

describe('WidgetNarrative', () => {
  it('shows narrative text without feedback chrome when feedback uses defaults (chart)', async () => {
    useLegacyNarrativeHandlers();

    setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={mockChartWidgetProps} />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
    expect(screen.queryByLabelText('thumbs-up')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('thumbs-down')).not.toBeInTheDocument();
  });

  it('shows narrative text without feedback chrome when feedback uses defaults (pivot)', async () => {
    useLegacyNarrativeHandlers();

    setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={mockPivotWidgetProps} />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
    expect(screen.queryByLabelText('thumbs-up')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('thumbs-down')).not.toBeInTheDocument();
  });

  it('always shows the sparkle AI icon regardless of feedback setting', async () => {
    useLegacyNarrativeHandlers();

    // Without feedback
    const { unmount } = setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={mockChartWidgetProps} />
      </NarrativeTestWrapper>,
    );
    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
    expect(screen.getByTestId('narrative-ai-icon')).toBeInTheDocument();
    unmount();

    // With feedback
    useLegacyNarrativeHandlers();
    setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={chartWithFeedback} />
      </NarrativeTestWrapper>,
    );
    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
    expect(screen.getByTestId('narrative-ai-icon')).toBeInTheDocument();
  });

  it('shows narrative text and feedback chrome when aiOptions.narrative.feedback.enabled is true', async () => {
    useLegacyNarrativeHandlers();

    setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={chartWithFeedback} />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
    expect(screen.getByLabelText('thumbs-up')).toBeInTheDocument();
    expect(screen.getByLabelText('thumbs-down')).toBeInTheDocument();
  });

  it('feedback buttons remain visible after clicking thumbs-up', async () => {
    useLegacyNarrativeHandlers();

    const { user } = setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={chartWithFeedback} />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
    await user.click(screen.getByLabelText('thumbs-up'));

    // Both buttons still visible after click
    expect(screen.getByLabelText('thumbs-up')).toBeInTheDocument();
    expect(screen.getByLabelText('thumbs-down')).toBeInTheDocument();
  });

  it('feedback buttons remain visible after clicking thumbs-down', async () => {
    useLegacyNarrativeHandlers();

    const { user } = setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={chartWithFeedback} />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
    await user.click(screen.getByLabelText('thumbs-down'));

    expect(screen.getByLabelText('thumbs-up')).toBeInTheDocument();
    expect(screen.getByLabelText('thumbs-down')).toBeInTheDocument();
  });

  it('feedback buttons remain visible when same button is clicked twice (deselect)', async () => {
    useLegacyNarrativeHandlers();

    const { user } = setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={chartWithFeedback} />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());

    // First click selects, second click deselects — both buttons must stay enabled
    await user.click(screen.getByLabelText('thumbs-up'));
    await user.click(screen.getByLabelText('thumbs-up'));

    expect(screen.getByLabelText('thumbs-up')).toBeInTheDocument();
    expect(screen.getByLabelText('thumbs-down')).toBeInTheDocument();
  });

  it('renders nothing for unsupported widget types', () => {
    const textProps: WidgetProps = {
      id: 'widget-text',
      widgetType: 'text',
      styleOptions: {
        html: 'Test',
        vAlign: 'valign-middle',
        bgColor: 'white',
      },
    };

    const { container } = setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={textProps} />
      </NarrativeTestWrapper>,
    );

    expect(container.textContent).toBe('');
  });

  it('renders nothing when enabled is false (opt-out)', () => {
    const { container } = setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={mockChartWidgetProps} enabled={false} />
      </NarrativeTestWrapper>,
    );

    expect(container.textContent).toBe('');
  });
});
