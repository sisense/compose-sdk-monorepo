import { TFunction } from '@sisense/sdk-common';
import { describe, expect, it, vi } from 'vitest';

import { SankeyChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { SankeyChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';

import { BuildContext } from '../../types';
import { getSankeyChartAlerts } from './index';

const translate = vi.fn((key: string, opts?: Record<string, string>) => {
  if (key === 'chart.sankey.alerts.tooManyStages' && opts) {
    return `Sankey chart has ${opts.stageCount} stages; more than ${opts.softLimit} often produces an unreadable diagram. Consider fewer category columns or stricter filters.`;
  }
  return key;
}) as unknown as TFunction;

function makeCtx(
  categoryCount: number,
  chartDataOverrides?: Partial<BuildContext<'sankey'>['chartData']>,
): BuildContext<'sankey'> {
  const category = Array.from({ length: categoryCount }, (_, i) => ({
    column: { name: `Stage${i}`, type: 'text' as const },
  }));
  return {
    chartData: { type: 'sankey', links: [], nodes: [], ...chartDataOverrides },
    dataOptions: {
      category,
      value: { column: { name: 'V', type: 'numeric' } },
    } as unknown as SankeyChartDataOptionsInternal,
    designOptions: {} as SankeyChartDesignOptions,
    extraConfig: {
      translate,
      themeSettings: getDefaultThemeSettings(),
      dateFormatter: () => '',
      accessibilityEnabled: false,
      defaultNumberFormattingEnabled: false,
    },
  };
}

describe('getSankeyChartAlerts', () => {
  it('does not warn for two to six stages', () => {
    expect(getSankeyChartAlerts(makeCtx(2))).toEqual([]);
    expect(getSankeyChartAlerts(makeCtx(6))).toEqual([]);
  });

  it('warns when more than six stages', () => {
    const alerts = getSankeyChartAlerts(makeCtx(8));
    expect(alerts.some((a) => a.includes('8 stages'))).toBe(true);
    expect(alerts.some((a) => a.includes('unreadable'))).toBe(true);
  });

  it('emits a console.warn when data was truncated due to link limit', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getSankeyChartAlerts(makeCtx(2, { totalLinksBeforeTruncation: 1200 }));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('1200'));
    warnSpy.mockRestore();
  });

  it('does not emit console.warn when no truncation occurred', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getSankeyChartAlerts(makeCtx(2));
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
