import { describe, expect, it, vi } from 'vitest';

import type { DashboardNarrativeResponseDto } from '@/infra/api/narrative/dashboard-narrative-endpoints.js';

import { isDashboardNarrativeResponse, toNarrativeData } from './to-narrative-data.js';

const standard: DashboardNarrativeResponseDto = {
  overview: 'Admissions grew **12%** over the period.',
  insights: [
    { text: 'Cardiology leads with **312** admissions.', status: 'positive' },
    { text: 'Average cost rose **8%**.', status: 'negative' },
    { text: 'Five divisions share the rest evenly.', status: 'neutral' },
  ],
  density: 'standard',
  sourceType: 'dashboard',
  sourceId: null,
  model: 'test-model',
  usage: { inputTokens: 1, outputTokens: 2 },
  traceId: 'trace-1',
  generatedAt: '2026-09-10T08:00:00.000Z',
  excludedWidgetIds: [],
};

describe('toNarrativeData', () => {
  it('keeps overview, insights and generatedAt, and drops everything else', () => {
    const data = toNarrativeData(standard);

    expect(data).toEqual({
      overview: standard.overview,
      insights: standard.insights,
      generatedAt: standard.generatedAt,
      copyText: expect.any(String),
    });
    expect(data).not.toHaveProperty('density');
    expect(data).not.toHaveProperty('traceId');
  });

  it('maps a response whose traceId is null the same way', () => {
    expect(toNarrativeData({ ...standard, traceId: null })).toEqual(toNarrativeData(standard));
  });

  it('stamps the mapping time when the response carries no generatedAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-22T09:30:00.000Z'));
    try {
      const { generatedAt, ...withoutTimestamp } = standard;
      expect(generatedAt).toBeDefined();
      expect(toNarrativeData(withoutTimestamp).generatedAt).toBe('2026-09-22T09:30:00.000Z');
    } finally {
      vi.useRealTimers();
    }
  });

  it('assembles the copy text as the overview, a blank line, then one marked line per insight', () => {
    const { copyText } = toNarrativeData(standard);

    expect(copyText).toBe(
      'Admissions grew **12%** over the period.\n\n' +
        '🟢 Cardiology leads with **312** admissions.\n' +
        '🔴 Average cost rose **8%**.\n' +
        '⚪ Five divisions share the rest evenly.',
    );
  });

  it('uses the overview alone as copy text for the low-density output', () => {
    const data = toNarrativeData({ ...standard, insights: [], density: 'low' });

    expect(data.insights).toEqual([]);
    expect(data.copyText).toBe(standard.overview);
  });

  it('keeps every insight the service sends, beyond three included', () => {
    const extra = Array.from({ length: 4 }, (_, i) => ({
      text: `Extra ${i + 1}.`,
      status: 'neutral' as const,
    }));
    const data = toNarrativeData({ ...standard, insights: [...standard.insights, ...extra] });

    expect(data.insights).toHaveLength(standard.insights.length + 4);
    expect(data.copyText).toContain('⚪ Extra 4.');
  });

  it('copies insight fields without carrying extra wire fields along', () => {
    const data = toNarrativeData({
      ...standard,
      insights: [{ text: 'Only one.', status: 'positive', extra: 1 } as never],
    });

    expect(data.insights[0]).toEqual({ text: 'Only one.', status: 'positive' });
  });
});

describe('isDashboardNarrativeResponse', () => {
  it('accepts the narrative shape, including an empty insight list', () => {
    expect(isDashboardNarrativeResponse(standard)).toBe(true);
    expect(isDashboardNarrativeResponse({ ...standard, insights: [] })).toBe(true);
  });

  it('accepts a body without generatedAt and rejects a non-string one', () => {
    const { generatedAt, ...withoutTimestamp } = standard;
    expect(generatedAt).toBeDefined();
    expect(isDashboardNarrativeResponse(withoutTimestamp)).toBe(true);
    expect(isDashboardNarrativeResponse({ ...standard, generatedAt: 1757491200000 })).toBe(false);
  });

  it('rejects a body without an overview or with malformed insights', () => {
    expect(isDashboardNarrativeResponse({ resolvedQueries: [], excludedWidgetIds: [] })).toBe(
      false,
    );
    expect(isDashboardNarrativeResponse({ overview: 'x', insights: [{ text: 'y' }] })).toBe(false);
    expect(
      isDashboardNarrativeResponse({ overview: 'x', insights: [{ text: 'y', status: 'great' }] }),
    ).toBe(false);
    expect(isDashboardNarrativeResponse({ overview: 'x' })).toBe(false);
  });

  it('rejects non-objects', () => {
    expect(isDashboardNarrativeResponse(undefined)).toBe(false);
    expect(isDashboardNarrativeResponse(null)).toBe(false);
    expect(isDashboardNarrativeResponse('overview')).toBe(false);
  });
});
