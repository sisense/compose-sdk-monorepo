/** @vitest-environment jsdom */

/**
 * Wiring tests for the auto-fit affix budgets: the hook module is mocked so these assert exactly
 * WHAT KpiValue/KpiComparison ask the hook to budget -- the affix glyphs, em-scales, and fixed
 * gaps mirroring the CSS constants -- independent of the fit math itself (covered in
 * use-auto-fit-font-size.test.ts).
 */
import { render } from '@testing-library/react';

import {
  COMPARISON_ARROW_EM,
  COMPARISON_PRIMARY_GAP_PX,
  CONDITIONAL_ICON_EM,
  CONDITIONAL_ICON_GAP_PX,
} from './kpi-card-styles.js';
import { KpiComparison } from './kpi-comparison.js';
import { KpiValue } from './kpi-value.js';
import type { useAutoFitFontSize } from './use-auto-fit-font-size.js';

type UseAutoFitFontSizeParams = Parameters<typeof useAutoFitFontSize>[0];

const useAutoFitFontSizeMock = vi.fn<(params: UseAutoFitFontSizeParams) => number>(() => 16);

vi.mock('./use-auto-fit-font-size.js', () => ({
  useAutoFitFontSize: (params: UseAutoFitFontSizeParams) => useAutoFitFontSizeMock(params),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return { ...mod, useTranslation: () => ({ t: (key: string) => key }) };
});

/** The `affixes` argument of the mocked hook's most recent invocation. */
function lastAffixes(): unknown {
  const calls = useAutoFitFontSizeMock.mock.calls;
  return calls[calls.length - 1]?.[0]?.affixes;
}

describe('auto-fit affix wiring', () => {
  beforeEach(() => {
    useAutoFitFontSizeMock.mockClear();
  });

  describe('KpiValue', () => {
    it('budgets the conditional icon as an em-scaled affix with the CSS margin as its gap', () => {
      render(
        <KpiValue
          text="170.44K"
          textSize="auto"
          onColor={false}
          scale="headline"
          icon={{ icon: { type: 'text', value: '⚠' }, expression: '0', operator: '>' }}
        />,
      );
      expect(lastAffixes()).toEqual([
        { text: '⚠', emScale: CONDITIONAL_ICON_EM, gapPx: CONDITIONAL_ICON_GAP_PX },
      ]);
    });

    it('budgets a built-in (svg) icon as a fixed-width affix', () => {
      render(
        <KpiValue
          text="170.44K"
          textSize="auto"
          onColor={false}
          scale="headline"
          icon={{
            icon: { type: 'built-in', name: 'check' },
            expression: '0',
            operator: '>',
          }}
        />,
      );
      expect(lastAffixes()).toEqual([
        { widthEm: CONDITIONAL_ICON_EM, gapPx: CONDITIONAL_ICON_GAP_PX },
      ]);
    });

    it('passes no affixes without an icon', () => {
      render(<KpiValue text="170.44K" textSize="auto" onColor={false} scale="headline" />);
      expect(lastAffixes()).toBeUndefined();
    });
  });

  describe('KpiComparison', () => {
    const deltaComparison = {
      type: 'delta' as const,
      baseline: 100,
      deltaValue: -20,
      deltaPercent: -77.88,
      label: 'vs cost',
    };

    it('budgets the comparison arrow (its actual glyph) as an em-scaled affix with the flex gap', () => {
      render(
        <KpiComparison
          comparison={deltaComparison}
          display="percent"
          showIcon={true}
          scale="headline"
          compact={false}
          onColor={false}
        />,
      );
      expect(lastAffixes()).toEqual([
        { text: '▼', emScale: COMPARISON_ARROW_EM, gapPx: COMPARISON_PRIMARY_GAP_PX },
      ]);
    });

    it('budgets icon + arrow together; the icon gap includes its margin plus the flex gap', () => {
      render(
        <KpiComparison
          comparison={{ ...deltaComparison, deltaPercent: 12 }}
          display="percent"
          showIcon={true}
          scale="headline"
          compact={false}
          onColor={false}
          conditionalIcon={{ icon: { type: 'text', value: '🔥' }, expression: '0', operator: '>' }}
        />,
      );
      expect(lastAffixes()).toEqual([
        {
          text: '🔥',
          emScale: CONDITIONAL_ICON_EM,
          gapPx: CONDITIONAL_ICON_GAP_PX + COMPARISON_PRIMARY_GAP_PX,
        },
        { text: '▲', emScale: COMPARISON_ARROW_EM, gapPx: COMPARISON_PRIMARY_GAP_PX },
      ]);
    });

    it('budgets an svg-path icon as a fixed-width affix including the flex gap', () => {
      render(
        <KpiComparison
          comparison={{ ...deltaComparison, deltaPercent: 12 }}
          display="percent"
          showIcon={true}
          scale="headline"
          compact={false}
          onColor={false}
          conditionalIcon={{
            icon: { type: 'svg-path', d: 'M0 0H24V24Z' },
            expression: '0',
            operator: '>',
          }}
        />,
      );
      expect(lastAffixes()).toEqual([
        {
          widthEm: CONDITIONAL_ICON_EM,
          gapPx: CONDITIONAL_ICON_GAP_PX + COMPARISON_PRIMARY_GAP_PX,
        },
        { text: '▲', emScale: COMPARISON_ARROW_EM, gapPx: COMPARISON_PRIMARY_GAP_PX },
      ]);
    });

    it('measures the target line that display promotes to primary (headline auto-fit budget)', () => {
      const targetComparison = {
        type: 'target' as const,
        target: 1000000,
        percentOfTarget: 82,
        toGo: 250000,
        label: 'Total Cost',
      };
      const lastText = () => {
        const calls = useAutoFitFontSizeMock.mock.calls;
        return calls[calls.length - 1]?.[0]?.text;
      };

      const { rerender } = render(
        <KpiComparison
          comparison={targetComparison}
          display="percent"
          showIcon={false}
          scale="headline"
          compact={false}
          onColor={false}
        />,
      );
      // t() is mocked to return raw keys in this file.
      expect(lastText()).toBe('kpi.target.ofGoal');

      rerender(
        <KpiComparison
          comparison={targetComparison}
          display="value"
          showIcon={false}
          scale="headline"
          compact={false}
          onColor={false}
        />,
      );
      expect(lastText()).toBe('kpi.target.toGo');
    });

    it('budgets no arrow when showIcon is false, and none at all for a value-type comparison', () => {
      const { rerender } = render(
        <KpiComparison
          comparison={deltaComparison}
          display="percent"
          showIcon={false}
          scale="headline"
          compact={false}
          onColor={false}
        />,
      );
      expect(lastAffixes()).toEqual([]);

      rerender(
        <KpiComparison
          comparison={{ type: 'value', value: 250000, label: 'Total Cost' }}
          display="percent"
          showIcon={true}
          scale="headline"
          compact={false}
          onColor={false}
        />,
      );
      expect(lastAffixes()).toEqual([]);
    });
  });
});
