/** @vitest-environment jsdom */
import { render, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WidgetNarrativeConfig } from '@/domains/narrative/core/widget-narrative-config';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import type { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';

import { WidgetHeaderTargets } from '../../shared/widget-header/widget-header-targets';
import type { ChartWidgetProps } from './types';
import { useChartWidgetNarrative } from './use-chart-widget-narrative';

vi.mock('@/infra/contexts/sisense-context/sisense-context');
vi.mock('@/domains/narrative/components/widget-narrative', () => ({
  WidgetNarrative: () => null,
}));
// A real (if bare) button, so a test can drive the contributed narrative-toggle item the way the
// header does — by rendering its component and clicking it.
vi.mock('@/domains/narrative/components/narrative-trigger-button', () => ({
  NarrativeTriggerButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="widget-narrative-trigger-button" onClick={onClick} />
  ),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

function makeContextMock({
  canGenerateNarrativeViaAI = true,
  globalNarrativeEnabled = true,
}: {
  /** Whether the connected instance can generate narratives via AI. */
  canGenerateNarrativeViaAI?: boolean;
  /** Global `appConfig.narrativeConfig.enabled` flag. */
  globalNarrativeEnabled?: boolean;
} = {}): SisenseContextPayload {
  return {
    app: {
      settings: {
        narrative: { canGenerateNarrativeViaAI },
        narrativeConfig: { enabled: globalNarrativeEnabled },
      },
    },
    tracking: { packageName: 'test', enabled: false },
    isInitialized: true,
    errorBoundary: { showErrorBox: false },
  } as unknown as SisenseContextPayload;
}

function makeProps(narrative: WidgetNarrativeConfig): ChartWidgetProps {
  return {
    chartType: 'column',
    dataOptions: { category: [], value: [], breakBy: [] },
    config: { narrative },
  } as unknown as ChartWidgetProps;
}

describe('useChartWidgetNarrative', () => {
  beforeEach(() => {
    useSisenseContextMock.mockReturnValue(makeContextMock());
  });

  describe('narrative slots when narrative should NOT show', () => {
    it('returns null slots when canGenerateNarrativeViaAI=false', () => {
      useSisenseContextMock.mockReturnValue(makeContextMock({ canGenerateNarrativeViaAI: false }));
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: true, autoShow: true }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).toBeNull();
      expect(result.current.narrativeBottomSlot).toBeNull();
      expect(result.current.narrativeAloneContent).toBeNull();
    });

    it('returns null slots when narrative.enabled=false', () => {
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: false, autoShow: true }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).toBeNull();
      expect(result.current.narrativeBottomSlot).toBeNull();
      expect(result.current.narrativeAloneContent).toBeNull();
    });

    it('returns null slots when autoShow=false and trigger has not been clicked', () => {
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: true, autoShow: false }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).toBeNull();
      expect(result.current.narrativeBottomSlot).toBeNull();
      expect(result.current.narrativeAloneContent).toBeNull();
    });
  });

  describe('global narrativeConfig gate', () => {
    it('returns null slots when global narrativeConfig.enabled=false, even if the widget enables narrative', () => {
      useSisenseContextMock.mockReturnValue(makeContextMock({ globalNarrativeEnabled: false }));
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({
            enabled: true,
            autoShow: true,
            displayLocation: 'above',
          }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).toBeNull();
      expect(result.current.narrativeBottomSlot).toBeNull();
      expect(result.current.narrativeAloneContent).toBeNull();
    });

    it('does not contribute the trigger button when global narrativeConfig.enabled=false', () => {
      useSisenseContextMock.mockReturnValue(makeContextMock({ globalNarrativeEnabled: false }));
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: true, autoShow: false }),
          styleOptions: { header: { hidden: false } } as ChartWidgetProps['styleOptions'],
        }),
      );
      expect(result.current.narrativeToggleItem).toBeUndefined();
    });

    it('shows narrative when global narrativeConfig.enabled=true and the widget enables it', () => {
      useSisenseContextMock.mockReturnValue(makeContextMock({ globalNarrativeEnabled: true }));
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({
            enabled: true,
            autoShow: true,
            displayLocation: 'above',
          }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).not.toBeNull();
    });
  });

  describe('narrative slot placement', () => {
    it('returns non-null narrativeTopSlot when displayLocation=above and autoShow=true', () => {
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({
            enabled: true,
            autoShow: true,
            displayLocation: 'above',
          }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).not.toBeNull();
      expect(result.current.narrativeBottomSlot).toBeNull();
      expect(result.current.narrativeAloneContent).toBeNull();
    });

    it('returns non-null narrativeBottomSlot when displayLocation=below', () => {
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({
            enabled: true,
            autoShow: true,
            displayLocation: 'below',
          }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).toBeNull();
      expect(result.current.narrativeBottomSlot).not.toBeNull();
      expect(result.current.narrativeAloneContent).toBeNull();
    });

    it('returns non-null narrativeAloneContent when displayLocation=alone', () => {
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({
            enabled: true,
            autoShow: true,
            displayLocation: 'alone',
          }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).toBeNull();
      expect(result.current.narrativeBottomSlot).toBeNull();
      expect(result.current.narrativeAloneContent).not.toBeNull();
    });

    it('defaults to above when displayLocation is not set', () => {
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: true, autoShow: true }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeTopSlot).not.toBeNull();
      expect(result.current.narrativeBottomSlot).toBeNull();
      expect(result.current.narrativeAloneContent).toBeNull();
    });
  });

  describe('trigger button contribution', () => {
    it('contributes the trigger button when autoShow=false and canGenerateNarrativeViaAI=true', () => {
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: true, autoShow: false }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeToggleItem?.id).toBe(WidgetHeaderTargets.NarrativeToggle);
    });

    it('does not contribute the trigger button when autoShow=true (no trigger needed)', () => {
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: true, autoShow: true }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeToggleItem).toBeUndefined();
    });

    it('does not contribute the trigger button when canGenerateNarrativeViaAI=false', () => {
      useSisenseContextMock.mockReturnValue(makeContextMock({ canGenerateNarrativeViaAI: false }));
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: true, autoShow: false }),
          styleOptions: undefined,
        }),
      );
      expect(result.current.narrativeToggleItem).toBeUndefined();
    });

    it('shows the narrative once the toggle is clicked', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({
            enabled: true,
            autoShow: false,
            displayLocation: 'below',
          }),
          styleOptions: undefined,
        }),
      );

      // Nothing is shown until the toggle is used; the item is opaque to the widget, so this drives
      // it the way the header does — by rendering its component.
      expect(result.current.narrativeBottomSlot).toBeNull();
      const { getByTestId } = render(
        <>{result.current.narrativeToggleItem?.component({ size: { width: 28, height: 28 } })}</>,
      );
      await user.click(getByTestId('widget-narrative-trigger-button'));

      expect(result.current.narrativeBottomSlot).not.toBeNull();
    });
  });

  describe('contentAreaRef', () => {
    it('returns a stable ref object', () => {
      const { result, rerender } = renderHook(() =>
        useChartWidgetNarrative({
          propsWithDrilldown: makeProps({ enabled: true, autoShow: true }),
          styleOptions: undefined,
        }),
      );
      const ref = result.current.contentAreaRef;
      rerender();
      expect(result.current.contentAreaRef).toBe(ref);
    });
  });
});
