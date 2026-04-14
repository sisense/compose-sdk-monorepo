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

const summaryText = 'widget narrative summary text';

const mockNlgResponse: GetNlgInsightsResponse = {
  responseType: 'Text',
  data: {
    answer: summaryText,
  },
};

describe('WidgetNarrative', () => {
  it('renders plain variant with narrative text after load', async () => {
    server.use(
      http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
      http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => HttpResponse.json(mockNlgResponse)),
    );

    setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={mockChartWidgetProps} variant="plain" />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
  });

  it('renders plain variant for pivot widget props after load', async () => {
    server.use(
      http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
      http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => HttpResponse.json(mockNlgResponse)),
    );

    setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={mockPivotWidgetProps} variant="plain" />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
  });

  it('renders nothing for unsupported widget types', () => {
    server.use(
      http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
      http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => HttpResponse.json(mockNlgResponse)),
    );

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
        <WidgetNarrative widgetProps={textProps} variant="plain" />
      </NarrativeTestWrapper>,
    );

    expect(container.textContent).toBe('');
  });

  it('renders nothing when enabled is false (opt-out)', () => {
    server.use(
      http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
      http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => HttpResponse.json(mockNlgResponse)),
    );

    const { container } = setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={mockChartWidgetProps} variant="plain" enabled={false} />
      </NarrativeTestWrapper>,
    );

    expect(container.textContent).toBe('');
  });

  it('default variant shows narrative after load', async () => {
    server.use(
      http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
      http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => HttpResponse.json(mockNlgResponse)),
    );

    setup(
      <NarrativeTestWrapper>
        <WidgetNarrative widgetProps={mockChartWidgetProps} variant="default" />
      </NarrativeTestWrapper>,
    );

    await waitFor(() => expect(screen.getByText(summaryText)).toBeInTheDocument());
  });
});
