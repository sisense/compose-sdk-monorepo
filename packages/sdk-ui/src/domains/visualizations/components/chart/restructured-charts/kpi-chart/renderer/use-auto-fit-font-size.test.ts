import { StrictMode } from 'react';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { computeAutoFitFontSize, useAutoFitFontSize } from './use-auto-fit-font-size';

/**
 * Extracts the font size (px) from a CSS font shorthand string, for size-aware stubs. The hook
 * always builds `'<weight> <size>px <family>'`, so the size is the second space-separated token.
 */
const fontSizeOf = (cssFont: string) => Number(cssFont.split(' ')[1]?.replace('px', '') ?? 0);

// The injected `measure` stub used throughout: a simple, easy-to-hand-calculate stand-in for
// canvas `measureText`, perfectly linear in the css font's size -- 10px of width per character
// per px of font size. "Measured width per px of font size" is therefore `text.length * 10`
// regardless of the probe size the implementation measures at, and the verify-at-candidate-size
// pass always confirms the extrapolated fit exactly (so expected values stay hand-computable
// as `maxWidthPx / (text.length * 10)`).
const stubMeasure = (text: string, cssFont: string) => text.length * 10 * fontSizeOf(cssFont);

describe('computeAutoFitFontSize', () => {
  it('fits within the width bound with no clamping applied', () => {
    // measured = 3 * 10 = 30; widthBound = 300 / 30 = 10; heightBound = 1000 / 1.2 = 833.33
    expect(
      computeAutoFitFontSize({
        text: 'abc',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 300,
        maxHeightPx: 1000,
        minPx: 8,
        maxPx: 96,
        measure: stubMeasure,
      }),
    ).toBe(10);
  });

  it('clamps to maxPx when the width bound exceeds it', () => {
    // measured = 1 * 10 = 10; widthBound = 2000 / 10 = 200 -> clamped to maxPx
    expect(
      computeAutoFitFontSize({
        text: 'a',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 2000,
        maxHeightPx: 1000,
        minPx: 8,
        maxPx: 96,
        measure: stubMeasure,
      }),
    ).toBe(96);
  });

  it('clamps to minPx when the width bound is smaller than it', () => {
    // measured = 10 * 10 = 100; widthBound = 200 / 100 = 2 -> clamped to minPx
    expect(
      computeAutoFitFontSize({
        text: 'abcdefghij',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 200,
        maxHeightPx: 1000,
        minPx: 8,
        maxPx: 96,
        measure: stubMeasure,
      }),
    ).toBe(8);
  });

  it('caps by height using the 1.2 line-height factor when it is the tighter bound', () => {
    // measured = 2 * 10 = 20; widthBound = 400 / 20 = 20; heightBound = 12 / 1.2 = 10 (tighter)
    expect(
      computeAutoFitFontSize({
        text: 'ab',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 400,
        maxHeightPx: 12,
        minPx: 1,
        maxPx: 96,
        measure: stubMeasure,
      }),
    ).toBe(10);
  });

  it('falls back to maxPx for the width bound when the measured width is zero (e.g. empty text)', () => {
    // measured = 0 -> width bound guard falls back to maxPx; heightBound = 1000/1.2 = 833.33 (looser)
    expect(
      computeAutoFitFontSize({
        text: '',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 300,
        maxHeightPx: 1000,
        minPx: 8,
        maxPx: 96,
        measure: stubMeasure,
      }),
    ).toBe(96);
  });

  it('still respects the height cap when the measured width is zero', () => {
    // measured = 0 -> width bound guard falls back to maxPx (96), but heightBound = 12/1.2 = 10 is tighter
    expect(
      computeAutoFitFontSize({
        text: '',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 300,
        maxHeightPx: 12,
        minPx: 1,
        maxPx: 96,
        measure: stubMeasure,
      }),
    ).toBe(10);
  });

  it('builds the probe css font from the family and weight and passes it to measure', () => {
    const measure = vi.fn<(text: string, cssFont: string) => number>(() => 30);
    computeAutoFitFontSize({
      text: 'abc',
      font: { family: 'Open Sans', weight: 700 },
      maxWidthPx: 300,
      maxHeightPx: 1000,
      minPx: 8,
      maxPx: 96,
      measure,
    });

    // Two measurements: the 100px probe, then the verify pass at the candidate size.
    expect(measure).toHaveBeenCalledTimes(2);
    const [measuredText, cssFont] = measure.mock.calls[0];
    expect(measuredText).toBe('abc');
    expect(cssFont).toContain('100px');
    expect(cssFont).toContain('Open Sans');
    expect(cssFont).toContain('700');
  });

  describe('affixes', () => {
    it('budgets an em-scaled affix and its fixed gap into the width bound', () => {
      // Text 'abc': widthPerPx = 30. Affix 'xy' at 0.5em: measured at the em-scaled probe
      // (50px) = 2*10*50 = 1000 -> 10 px of width per px of TEXT font size. Composite
      // widthPerPx = 40; fixed gap 10 shrinks the 410px box to 400 -> widthBound = 10.
      // Without affix budgeting this would (wrongly) fit at floor(410/30) = 13.
      expect(
        computeAutoFitFontSize({
          text: 'abc',
          font: { family: 'Arial', weight: 400 },
          maxWidthPx: 410,
          maxHeightPx: 1000,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
          affixes: [{ text: 'xy', emScale: 0.5, gapPx: 10 }],
        }),
      ).toBe(10);
    });

    it('budgets multiple affixes (icon + arrow) cumulatively', () => {
      // Text 'ab' (20/px). Affix 1 'i' at 0.7em: 1*10*0.7 = 7/px, gap 9. Affix 2 'v' at
      // 0.85em: 8.5/px, gap 3. Composite = 35.5/px; box 722 - 12 gaps = 710 -> bound 20.
      expect(
        computeAutoFitFontSize({
          text: 'ab',
          font: { family: 'Arial', weight: 400 },
          maxWidthPx: 722,
          maxHeightPx: 10000,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
          affixes: [
            { text: 'i', emScale: 0.7, gapPx: 9 },
            { text: 'v', emScale: 0.85, gapPx: 3 },
          ],
        }),
      ).toBe(20);
    });

    it('re-measures affixes at the em-scaled candidate size in the verify pass', () => {
      const measure = vi.fn(stubMeasure);
      computeAutoFitFontSize({
        text: 'abc',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 410,
        maxHeightPx: 1000,
        minPx: 1,
        maxPx: 96,
        measure,
        affixes: [{ text: 'xy', emScale: 0.5, gapPx: 10 }],
      });

      // Probe: text at 100px + affix at 50px. Verify at the 10px candidate: text at 10px +
      // affix at its em-scaled 5px -- the composite, not the text alone.
      const calls = measure.mock.calls.map(([text, cssFont]) => `${text}@${fontSizeOf(cssFont)}`);
      expect(calls).toEqual(['abc@100', 'xy@50', 'abc@10', 'xy@5']);
    });

    it('clamps to minPx when the fixed gaps alone exceed the available width', () => {
      expect(
        computeAutoFitFontSize({
          text: 'abc',
          font: { family: 'Arial', weight: 400 },
          maxWidthPx: 8,
          maxHeightPx: 1000,
          minPx: 8,
          maxPx: 96,
          measure: stubMeasure,
          affixes: [{ text: 'xy', emScale: 1, gapPx: 20 }],
        }),
      ).toBe(8);
    });

    it('budgets a fixed-width affix as widthEm x the candidate font size', () => {
      // Text 'abc': 30/px. Fixed-width affix 0.7em: 0.7/px (no canvas measurement).
      // Composite = 30.7/px; box 317 - 10 gap = 307 -> widthBound = 10.
      expect(
        computeAutoFitFontSize({
          text: 'abc',
          font: { family: 'Arial', weight: 400 },
          maxWidthPx: 317,
          maxHeightPx: 1000,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
          affixes: [{ widthEm: 0.7, gapPx: 10 }],
        }),
      ).toBe(10);
    });

    it('mixes text and fixed-width affixes in one budget', () => {
      // Text 'ab': 20/px. Text affix 'i' at 0.7em: 7/px, gap 9. Fixed-width affix 0.7em:
      // 0.7/px, gap 3. Composite = 27.7/px; box 289 - 12 gaps = 277 -> widthBound = 10.
      expect(
        computeAutoFitFontSize({
          text: 'ab',
          font: { family: 'Arial', weight: 400 },
          maxWidthPx: 289,
          maxHeightPx: 1000,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
          affixes: [
            { text: 'i', emScale: 0.7, gapPx: 9 },
            { widthEm: 0.7, gapPx: 3 },
          ],
        }),
      ).toBe(10);
    });
  });

  it('floors the fit to a whole pixel (fractional-px safety margin against sub-pixel ellipsis)', () => {
    // widthPerPx = 30; widthBound = 305/30 = 10.1667 -> floored to 10 rather than rendered
    // at a fractional size that could overflow by a fraction of a pixel and still trigger
    // text-overflow: ellipsis.
    expect(
      computeAutoFitFontSize({
        text: 'abc',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 305,
        maxHeightPx: 1000,
        minPx: 8,
        maxPx: 96,
        measure: stubMeasure,
      }),
    ).toBe(10);
  });

  it('steps down when the text measures wider at the candidate size than the probe extrapolation predicted', () => {
    // A measure whose glyph advances are 6% wider at candidate sizes than the 100px probe
    // extrapolation predicts (mimicking per-size hinting drift / a font swap between probe
    // and verify). The probe-based width bound alone would return 6 -- which actually renders
    // 5*10*6*1.06 = 318px wide in a 300px box, i.e. ellipsized. The verify pass must catch
    // this and step down to a size whose re-measured width fits.
    const drift = 1.06;
    const measure = (text: string, cssFont: string) => {
      const sizePx = fontSizeOf(cssFont);
      const linear = text.length * 10 * sizePx;
      return sizePx === 100 ? linear : linear * drift;
    };

    const result = computeAutoFitFontSize({
      text: 'abcde',
      font: { family: 'Arial', weight: 400 },
      maxWidthPx: 300,
      maxHeightPx: 1000,
      minPx: 1,
      maxPx: 96,
      measure,
    });

    // First pass: floor(6 * 300/318) = 5; verify at 5: 5*10*5*1.06 = 265 <= 300 -> fits.
    expect(result).toBe(5);
    expect(measure('abcde', `400 ${result}px Arial`)).toBeLessThanOrEqual(300);
  });

  it('never steps below minPx even when the text cannot fit', () => {
    // widthPerPx = 100; widthBound = 200/100 = 2 -> clamped up to minPx = 8. The verify pass
    // measures 8000 > 200 but must respect the floor -- ellipsis is the designed worst case.
    expect(
      computeAutoFitFontSize({
        text: 'abcdefghij',
        font: { family: 'Arial', weight: 400 },
        maxWidthPx: 200,
        maxHeightPx: 1000,
        minPx: 8,
        maxPx: 96,
        measure: stubMeasure,
      }),
    ).toBe(8);
  });

  it('falls back to canvas measureText when no measure override is provided', () => {
    // vitest-canvas-mock's TextMetrics.width equals text.length regardless of font size,
    // so this just verifies the default path runs end-to-end and returns a clamped number.
    const result = computeAutoFitFontSize({
      text: 'abc',
      font: { family: 'Arial', weight: 400 },
      maxWidthPx: 300,
      maxHeightPx: 1000,
      minPx: 8,
      maxPx: 96,
    });
    expect(result).toBeGreaterThanOrEqual(8);
    expect(result).toBeLessThanOrEqual(96);
  });

  it('reuses a single offscreen canvas for default measurement across calls', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');

    const baseOpts = {
      font: { family: 'Arial', weight: 400 },
      maxWidthPx: 300,
      maxHeightPx: 1000,
      minPx: 8,
      maxPx: 96,
    };
    computeAutoFitFontSize({ ...baseOpts, text: 'abc' });
    computeAutoFitFontSize({ ...baseOpts, text: 'abcdef' });

    // The shared context may already exist from an earlier default-path call in this
    // module's lifetime, so two calls must create AT MOST one canvas -- never one each.
    const canvasCreations = createElementSpy.mock.calls.filter(([tag]) => tag === 'canvas');
    expect(canvasCreations.length).toBeLessThanOrEqual(1);

    createElementSpy.mockRestore();
  });
});

describe('useAutoFitFontSize', () => {
  const font = { family: 'Arial', weight: 400 };

  function createContainer(clientWidth: number, clientHeight: number) {
    const element = document.createElement('div');
    Object.defineProperty(element, 'clientWidth', { value: clientWidth, configurable: true });
    Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true });
    document.body.appendChild(element);
    return element;
  }

  it('returns minPx when the ref has no element yet', () => {
    const containerRef = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() =>
      useAutoFitFontSize({ containerRef, text: 'ABCDE', font, minPx: 8, maxPx: 96 }),
    );
    expect(result.current).toBe(8);
  });

  it('computes the font size from the container size and text once measured', () => {
    const element = createContainer(300, 1000);
    const containerRef = { current: element as HTMLDivElement | null };

    const { result } = renderHook(() =>
      useAutoFitFontSize({
        containerRef,
        text: 'ABCDE',
        font,
        minPx: 8,
        maxPx: 96,
        measure: stubMeasure,
      }),
    );

    // measured = 5*10=50; widthBound = 300/50=6 -> clamped to minPx=8
    expect(result.current).toBe(8);

    element.remove();
  });

  it('skips recomputation on re-renders with identical inputs', () => {
    const element = createContainer(300, 1000);
    const containerRef = { current: element as HTMLDivElement | null };
    const measure = vi.fn(stubMeasure);

    const { result, rerender } = renderHook(() =>
      useAutoFitFontSize({
        containerRef,
        text: 'ABCDE',
        // Inline object on purpose: a fresh identity every render, like a typical caller.
        // The short-circuit must compare font *fields*, not object identity.
        font: { family: 'Arial', weight: 400 },
        minPx: 8,
        maxPx: 96,
        measure,
      }),
    );

    const callsAfterMount = measure.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);
    expect(result.current).toBe(8); // measured=50; widthBound=300/50=6 -> clamped to minPx

    // Unrelated parent re-renders: nothing measurable changed, so no re-measure.
    rerender();
    rerender();

    expect(measure).toHaveBeenCalledTimes(callsAfterMount);
    expect(result.current).toBe(8);

    element.remove();
  });

  it('recomputes when the text changes, even without a resize', () => {
    const element = createContainer(1000, 1000);
    const containerRef = { current: element as HTMLDivElement | null };

    const { result, rerender } = renderHook(
      ({ text }: { text: string }) =>
        useAutoFitFontSize({
          containerRef,
          text,
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
        }),
      { initialProps: { text: 'a' } },
    );

    // measured = 1*10=10; widthBound=1000/10=100 -> clamped to maxPx=96
    expect(result.current).toBe(96);

    rerender({ text: 'a'.repeat(20) });

    // measured = 20*10=200; widthBound=1000/200=5
    expect(result.current).toBe(5);

    element.remove();
  });

  it('recomputes when an affix list changes into one whose text contains the key separators', () => {
    const element = createContainer(1000, 1000);
    const containerRef = { current: element as HTMLDivElement | null };

    // The affix snapshot key must be collision-free for arbitrary affix text. These two lists
    // are structurally different but their fields are identical once flattened -- a key built by
    // joining fields with ' ' and lists with '|' would render both as `x 1 2|y 1 2`, so the
    // second render would be mistaken for "no change" and keep the first fit's font size.
    const twoAffixes = [
      { text: 'x', emScale: 1, gapPx: 2 },
      { text: 'y', emScale: 1, gapPx: 2 },
    ];
    const oneAffixSpellingBothOut = [{ text: 'x 1 2|y', emScale: 1, gapPx: 2 }];

    const { result, rerender } = renderHook(
      ({ affixes }: { affixes: { text: string; emScale: number; gapPx: number }[] }) =>
        useAutoFitFontSize({
          containerRef,
          text: 'a',
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
          affixes,
        }),
      { initialProps: { affixes: twoAffixes } },
    );

    // widthPerPx = 10 (text) + 10 + 10 (affixes at 1em); gaps = 4 -> floor(996/30)
    expect(result.current).toBe(33);

    rerender({ affixes: oneAffixSpellingBothOut });

    // widthPerPx = 10 (text) + 70 (7-char affix at 1em); gaps = 2 -> floor(998/80)
    expect(result.current).toBe(12);

    element.remove();
  });

  it('recomputes when the ResizeObserver reports a new container size', () => {
    const element = createContainer(100, 1000);
    const containerRef = { current: element as HTMLDivElement | null };

    vi.mocked(ResizeObserver).mockClear();

    const { result } = renderHook(() =>
      useAutoFitFontSize({
        containerRef,
        text: 'a'.repeat(10),
        font,
        minPx: 1,
        maxPx: 96,
        measure: stubMeasure,
      }),
    );

    // measured = 100; widthBound = 100/100 = 1
    expect(result.current).toBe(1);

    Object.defineProperty(element, 'clientWidth', { value: 1000, configurable: true });
    const observerCallback = vi.mocked(ResizeObserver).mock.calls[0]?.[0];
    act(() => {
      observerCallback?.([], {} as ResizeObserver);
    });

    // measured = 100; widthBound = 1000/100 = 10
    expect(result.current).toBe(10);

    element.remove();
  });

  it('uses the latest text for a resize that fires after a prop change (no stale closure)', () => {
    const element = createContainer(100, 1000);
    const containerRef = { current: element as HTMLDivElement | null };

    vi.mocked(ResizeObserver).mockClear();

    const { result, rerender } = renderHook(
      ({ text }: { text: string }) =>
        useAutoFitFontSize({
          containerRef,
          text,
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
        }),
      { initialProps: { text: 'a'.repeat(10) } },
    );

    expect(result.current).toBe(1); // measured=100; widthBound=100/100=1

    // Text changes across a render (no resize, no element change) -- picked up immediately.
    rerender({ text: 'a'.repeat(5) });
    expect(result.current).toBe(2); // measured=50; widthBound=100/50=2

    // A real resize fires later, using the ResizeObserver created at mount. If its callback
    // closed over the mount-time text ("a"*10) instead of reading the latest value, this
    // would incorrectly recompute against the stale text.
    Object.defineProperty(element, 'clientWidth', { value: 500, configurable: true });
    const observerCallback = vi.mocked(ResizeObserver).mock.calls[0]?.[0];
    act(() => {
      observerCallback?.([], {} as ResizeObserver);
    });

    // Correct (fresh text, len 5): measured=50; widthBound=500/50=10
    // Stale (mount text, len 10): measured=100; widthBound=500/100=5
    expect(result.current).toBe(10);

    element.remove();
  });

  describe('font-availability watch', () => {
    // The watch exists because the canvas measure silently uses a FALLBACK family while the
    // theme's web font is still unavailable, so a fit computed in that window overflows once
    // the real (typically wider) font swaps in. Two distinct mid-load states are watched:
    // - a REGISTERED face still loading (CSS @font-face): fonts.check() is false; 'loadingdone'
    //   plus a bounded poll (event-less-environment safety net) notice the arrival;
    // - the family entirely ABSENT from document.fonts (sdk-ui's FontsLoader path: standalone
    //   FontFace.load() first, add() of the loaded face after): fonts.check() returns TRUE
    //   throughout per the spec's absent-family quirk (verified in Chromium 148), and the add()
    //   itself fires no FontFaceSet event -- only entry PRESENCE observes the arrival, so a
    //   listener-only watch re-checks presence on each 'loadingdone'.

    const originalFonts = document.fonts;

    afterEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- restoring test override
      (document as any).fonts = originalFonts;
      vi.useRealTimers();
    });

    /**
     * Installs a document.fonts mock modeling the REGISTERED-face lifecycle: `check()` reflects
     * `state.available` (false while the registered face loads, true once loaded), and the
     * family appears among the set's entries. The measure's reported widths double once the
     * font is "available" -- narrow fallback before, wide web font after (2x keeps expected
     * fits hand-computable).
     */
    function installFontsMock(opts: { withEvents: boolean }) {
      const state = { available: false };
      const listeners: Record<string, (() => void)[]> = {};
      const fontsMock = {
        status: 'loaded',
        check: vi.fn(() => state.available),
        // A registered (if not necessarily loaded) face for the family always exists in this
        // mock -- matching the CSS-@font-face lifecycle the `check()`-driven modes serve.
        forEach: vi.fn((cb: (face: { family: string }) => void) => {
          cb({ family: 'Arial' });
        }),
        ...(opts.withEvents && {
          addEventListener: vi.fn((event: string, cb: () => void) => {
            (listeners[event] ??= []).push(cb);
          }),
          removeEventListener: vi.fn(),
        }),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test override of a read-mostly global
      (document as any).fonts = fontsMock;
      const measure = (text: string, cssFont: string) =>
        text.length * 10 * fontSizeOf(cssFont) * (state.available ? 2 : 1);
      return { state, listeners, fontsMock, measure };
    }

    it('re-fits when the awaited web font arrives via loadingdone (CSS @font-face path)', () => {
      const { state, listeners, measure } = installFontsMock({ withEvents: true });
      const element = createContainer(1000, 10000);
      const containerRef = { current: element as HTMLDivElement | null };

      const { result } = renderHook(() =>
        useAutoFitFontSize({
          containerRef,
          text: 'a'.repeat(10),
          font,
          minPx: 1,
          maxPx: 96,
          measure,
        }),
      );

      // Fallback metrics: widthPerPx=100; widthBound = 1000/100 = 10.
      expect(result.current).toBe(10);

      // The real font arrives: glyphs are 2x wider; the stale 10px fit would overflow.
      state.available = true;
      act(() => {
        listeners.loadingdone?.forEach((cb) => cb());
      });

      // Re-fit against real metrics: widthPerPx=200; widthBound = 1000/200 = 5.
      expect(result.current).toBe(5);

      element.remove();
    });

    it('re-fits via the bounded poll when a registered face finishes loading in an event-less environment', () => {
      vi.useFakeTimers();
      // No addEventListener at all -- the poll must be the mechanism that notices.
      const { state, measure } = installFontsMock({ withEvents: false });
      const element = createContainer(1000, 10000);
      const containerRef = { current: element as HTMLDivElement | null };

      const { result } = renderHook(() =>
        useAutoFitFontSize({
          containerRef,
          text: 'a'.repeat(10),
          font,
          minPx: 1,
          maxPx: 96,
          measure,
        }),
      );

      expect(result.current).toBe(10); // fallback metrics

      state.available = true;
      act(() => {
        vi.advanceTimersByTime(500); // one poll tick
      });

      expect(result.current).toBe(5); // re-fit against real metrics

      element.remove();
    });

    it('does not arm any watch when the font is already available at mount', () => {
      const { state, fontsMock } = installFontsMock({ withEvents: true });
      state.available = true;
      const element = createContainer(1000, 10000);
      const containerRef = { current: element as HTMLDivElement | null };

      renderHook(() =>
        useAutoFitFontSize({
          containerRef,
          text: 'abc',
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
        }),
      );

      expect(fontsMock.addEventListener).not.toHaveBeenCalled();

      element.remove();
    });

    it('stops watching when the hook unmounts', () => {
      const { fontsMock } = installFontsMock({ withEvents: true });
      const element = createContainer(1000, 10000);
      const containerRef = { current: element as HTMLDivElement | null };

      const { unmount } = renderHook(() =>
        useAutoFitFontSize({
          containerRef,
          text: 'abc',
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
        }),
      );
      expect(fontsMock.addEventListener).toHaveBeenCalledWith('loadingdone', expect.any(Function));

      unmount();

      expect(fontsMock.removeEventListener).toHaveBeenCalledWith(
        'loadingdone',
        expect.any(Function),
      );

      element.remove();
    });

    describe('absent-family quirk (FontsLoader path)', () => {
      /**
       * Installs a document.fonts mock reproducing the spec quirk verified in Chromium 148:
       * `check()` returns TRUE for a family with NO matching face in the set (nothing would
       * load -- rendering just uses fallback), so it is true BOTH before and after a
       * FontsLoader-style `add()` of an already-loaded face. Only entry enumeration
       * (`forEach`) can observe the arrival; `state.families` is that observable set. The
       * measure's reported widths double once the family is registered -- narrow fallback
       * before, wide web font after.
       */
      function installQuirkFontsMock() {
        const state = { families: [] as string[] };
        const listeners: Record<string, (() => void)[]> = {};
        const fontsMock = {
          status: 'loaded',
          check: vi.fn(() => true), // the quirk: true even while the family is absent
          forEach: vi.fn((cb: (face: { family: string }) => void) => {
            state.families.forEach((family) => cb({ family }));
          }),
          addEventListener: vi.fn((event: string, cb: () => void) => {
            (listeners[event] ??= []).push(cb);
          }),
          removeEventListener: vi.fn(),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test override of a read-mostly global
        (document as any).fonts = fontsMock;
        const measure = (text: string, cssFont: string) =>
          text.length * 10 * fontSizeOf(cssFont) * (state.families.includes('Arial') ? 2 : 1);
        return { state, listeners, fontsMock, measure };
      }

      it('re-fits after the font is add()ed despite check() returning true throughout', () => {
        const { state, listeners, fontsMock, measure } = installQuirkFontsMock();
        const element = createContainer(1000, 10000);
        const containerRef = { current: element as HTMLDivElement | null };

        const { result } = renderHook(() =>
          useAutoFitFontSize({
            containerRef,
            text: 'a'.repeat(10),
            font,
            minPx: 1,
            maxPx: 96,
            measure,
          }),
        );

        // Fallback metrics: widthPerPx=100; widthBound = 1000/100 = 10.
        expect(result.current).toBe(10);
        // The watch must arm even though check() said true -- the family is absent from the
        // set, so that true is the quirk, not a loaded font.
        expect(fontsMock.addEventListener).toHaveBeenCalledWith(
          'loadingdone',
          expect.any(Function),
        );

        // FontsLoader finishes: the loaded face is add()ed (no event fires for the add itself);
        // some later font activity fires loadingdone, and the watch notices the registration.
        state.families.push('Arial');
        act(() => {
          listeners.loadingdone?.forEach((cb) => cb());
        });

        // Re-fit against real metrics: widthPerPx=200; widthBound = 1000/200 = 5.
        expect(result.current).toBe(5);

        element.remove();
      });

      it('keeps waiting when loadingdone fires before the family is registered', () => {
        const { state, listeners, measure } = installQuirkFontsMock();
        const element = createContainer(1000, 10000);
        const containerRef = { current: element as HTMLDivElement | null };

        const { result } = renderHook(() =>
          useAutoFitFontSize({
            containerRef,
            text: 'a'.repeat(10),
            font,
            minPx: 1,
            maxPx: 96,
            measure,
          }),
        );
        expect(result.current).toBe(10);

        // Unrelated font activity completes while the theme font is still absent: check()
        // still says true (quirk), but the family is not registered -- no premature stop.
        act(() => {
          listeners.loadingdone?.forEach((cb) => cb());
        });
        expect(result.current).toBe(10);

        state.families.push('Arial');
        act(() => {
          listeners.loadingdone?.forEach((cb) => cb());
        });
        expect(result.current).toBe(5);

        element.remove();
      });

      it('does not arm the bounded poll for an absent family (a system font would poll for nothing)', () => {
        vi.useFakeTimers();
        const { measure } = installQuirkFontsMock();
        const element = createContainer(1000, 10000);
        const containerRef = { current: element as HTMLDivElement | null };

        renderHook(() =>
          useAutoFitFontSize({
            containerRef,
            text: 'a'.repeat(10),
            font,
            minPx: 1,
            maxPx: 96,
            measure,
          }),
        );

        // A system font (e.g. Arial) legitimately returns check()===true while never being
        // registered -- an armed poll would run its whole budget on every mount for nothing.
        expect(vi.getTimerCount()).toBe(0);

        element.remove();
      });

      it('stops the listener-only watch on unmount', () => {
        const { fontsMock } = installQuirkFontsMock();
        const element = createContainer(1000, 10000);
        const containerRef = { current: element as HTMLDivElement | null };

        const { unmount } = renderHook(() =>
          useAutoFitFontSize({
            containerRef,
            text: 'abc',
            font,
            minPx: 1,
            maxPx: 96,
            measure: stubMeasure,
          }),
        );
        expect(fontsMock.addEventListener).toHaveBeenCalledWith(
          'loadingdone',
          expect.any(Function),
        );

        unmount();

        expect(fontsMock.removeEventListener).toHaveBeenCalledWith(
          'loadingdone',
          expect.any(Function),
        );

        element.remove();
      });
    });
  });

  it('disconnects the ResizeObserver when the hook unmounts', () => {
    const element = createContainer(300, 1000);
    const containerRef = { current: element as HTMLDivElement | null };

    vi.mocked(ResizeObserver).mockClear();

    const { unmount } = renderHook(() =>
      useAutoFitFontSize({
        containerRef,
        text: 'abc',
        font,
        minPx: 8,
        maxPx: 96,
        measure: stubMeasure,
      }),
    );

    const roInstance = vi.mocked(ResizeObserver).mock.results[0]?.value as {
      disconnect: ReturnType<typeof vi.fn>;
    };

    unmount();

    expect(roInstance.disconnect).toHaveBeenCalled();

    element.remove();
  });

  describe('maxHeightPxOverride', () => {
    it('uses the override instead of the container clientHeight for the height bound', () => {
      // clientHeight is 1000 (would never be the tighter bound), but the override (12) is --
      // heightBound = 12/1.2 = 10, tighter than the width bound (300/50=6 is actually tighter
      // here, so pick a wide container to make height the binding constraint instead).
      const element = createContainer(10000, 1000);
      const containerRef = { current: element as HTMLDivElement | null };

      const { result } = renderHook(() =>
        useAutoFitFontSize({
          containerRef,
          text: 'ab',
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
          maxHeightPxOverride: 12,
        }),
      );

      // measured = 2*10=20; widthBound = 10000/20 = 500; heightBound = 12/1.2 = 10 (tighter)
      expect(result.current).toBe(10);

      element.remove();
    });

    it('stays stable across re-fits when the override does not change, even though clientHeight would (non-circularity)', () => {
      const element = createContainer(10000, 1000);
      const containerRef = { current: element as HTMLDivElement | null };

      const { result, rerender } = renderHook(
        ({ maxHeightPxOverride }: { maxHeightPxOverride: number }) =>
          useAutoFitFontSize({
            containerRef,
            text: 'ab',
            font,
            minPx: 1,
            maxPx: 96,
            measure: stubMeasure,
            maxHeightPxOverride,
          }),
        { initialProps: { maxHeightPxOverride: 12 } },
      );
      expect(result.current).toBe(10); // heightBound = 12/1.2 = 10

      // The container's OWN clientHeight changes (as it would if this were a self-referential
      // flex row that grew/shrank with the applied font size), but the override doesn't --
      // the computed size must not drift as a result.
      Object.defineProperty(element, 'clientHeight', { value: 11, configurable: true });
      rerender({ maxHeightPxOverride: 12 });

      expect(result.current).toBe(10);

      element.remove();
    });

    it('falls back to the container clientHeight when no override is provided', () => {
      const element = createContainer(10000, 12);
      const containerRef = { current: element as HTMLDivElement | null };

      const { result } = renderHook(() =>
        useAutoFitFontSize({
          containerRef,
          text: 'ab',
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
        }),
      );

      // measured = 20; widthBound = 500; heightBound = 12/1.2 = 10 (tighter, from clientHeight)
      expect(result.current).toBe(10);

      element.remove();
    });
  });

  it('recomputes when the affixes change, even without a resize (fresh array literals per render)', () => {
    const element = createContainer(1000, 10000);
    const containerRef = { current: element as HTMLDivElement | null };

    const { result, rerender } = renderHook(
      ({ withIcon }: { withIcon: boolean }) =>
        useAutoFitFontSize({
          containerRef,
          text: 'a'.repeat(10),
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
          affixes: withIcon ? [{ text: 'a'.repeat(10), emScale: 1, gapPx: 0 }] : undefined,
        }),
      { initialProps: { withIcon: false } },
    );

    // No affix: widthPerPx = 100 -> 1000/100 = 10.
    expect(result.current).toBe(10);

    rerender({ withIcon: true });

    // Composite widthPerPx = 200 -> 1000/200 = 5, despite identical text/box.
    expect(result.current).toBe(5);

    element.remove();
  });

  it('recomputes when a fixed-width affix changes width at the same gap', () => {
    // Locks the affixesKeyOf fixed-width serialization: two widths must not collide to one memo key.
    const element = createContainer(1000, 10000);
    const containerRef = { current: element as HTMLDivElement | null };

    const { result, rerender } = renderHook(
      ({ widthEm }: { widthEm: number }) =>
        useAutoFitFontSize({
          containerRef,
          text: 'a',
          font,
          minPx: 1,
          maxPx: 96,
          measure: stubMeasure,
          affixes: [{ widthEm, gapPx: 0 }],
        }),
      { initialProps: { widthEm: 0.5 } },
    );

    // Text 'a': 10/px. With widthEm=0.5: composite = 10.5/px -> widthBound = 1000/10.5 ≈ 95.24 -> floor to 95.
    const firstFit = result.current;
    expect(firstFit).toBe(95);

    rerender({ widthEm: 0.9 });

    // With widthEm=0.9: composite = 10.9/px -> widthBound = 1000/10.9 ≈ 91.74 -> floor to 91.
    // Must be different from firstFit; if the memo key collided, it would reuse the stale 95.
    expect(result.current).toBe(91);
    expect(result.current).not.toBe(firstFit);

    element.remove();
  });

  describe('enabled', () => {
    it('returns minPx and performs no observation or measurement when enabled is false', () => {
      const element = createContainer(300, 1000);
      const containerRef = { current: element as HTMLDivElement | null };
      const measure = vi.fn(stubMeasure);

      vi.mocked(ResizeObserver).mockClear();

      const { result } = renderHook(() =>
        useAutoFitFontSize({
          containerRef,
          text: 'abc',
          font,
          minPx: 8,
          maxPx: 96,
          measure,
          enabled: false,
        }),
      );

      expect(result.current).toBe(8);
      expect(measure).not.toHaveBeenCalled();
      expect(vi.mocked(ResizeObserver)).not.toHaveBeenCalled();

      element.remove();
    });

    it('starts observing and fitting when enabled flips to true', () => {
      const element = createContainer(1000, 1000);
      const containerRef = { current: element as HTMLDivElement | null };
      const measure = vi.fn(stubMeasure);

      const { result, rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) =>
          useAutoFitFontSize({
            containerRef,
            text: 'a'.repeat(20),
            font,
            minPx: 1,
            maxPx: 96,
            measure,
            enabled,
          }),
        { initialProps: { enabled: false } },
      );

      expect(result.current).toBe(1); // minPx while disabled
      expect(measure).not.toHaveBeenCalled();

      rerender({ enabled: true });

      // measured widthPerPx = 200; widthBound = 1000/200 = 5
      expect(result.current).toBe(5);
      expect(measure).toHaveBeenCalled();

      element.remove();
    });

    it('resets to minPx when enabled flips to false, then recomputes on re-enable with identical inputs', () => {
      const element = createContainer(1000, 1000);
      const containerRef = { current: element as HTMLDivElement | null };
      const measure = vi.fn(stubMeasure);

      const { result, rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) =>
          useAutoFitFontSize({
            containerRef,
            text: 'a'.repeat(20),
            font,
            minPx: 1,
            maxPx: 96,
            measure,
            enabled,
          }),
        { initialProps: { enabled: true } },
      );

      // measured widthPerPx = 200; widthBound = 1000/200 = 5
      expect(result.current).toBe(5);

      // Disable: the documented contract is minPx, not the last computed size.
      rerender({ enabled: false });
      expect(result.current).toBe(1);

      // Re-enable with IDENTICAL inputs: the last-fit snapshot must have been invalidated on
      // disable, so the fit is recomputed instead of bailing out and staying at minPx.
      measure.mockClear();
      rerender({ enabled: true });
      expect(result.current).toBe(5);
      expect(measure).toHaveBeenCalled();

      element.remove();
    });
  });

  describe('StrictMode', () => {
    it('survives StrictMode double-mount: still re-fits on later input changes and resizes', () => {
      // React 18 StrictMode's simulated unmount runs the teardown cleanup (cancel + observer
      // disconnect) without a real unmount; the remounted effect must resurrect the tracker
      // rather than early-return on the unchanged element -- otherwise every subsequent fit()
      // bails on `cancelled` and the font size stays frozen at its mount value forever (the
      // "tiny KPI value that no resize wiggle can fix" UAT bug, reproduced live in the demo
      // app, which renders inside <StrictMode>).
      const element = createContainer(100, 1000);
      const containerRef = { current: element as HTMLDivElement | null };

      vi.mocked(ResizeObserver).mockClear();

      const { result, rerender } = renderHook(
        ({ text }: { text: string }) =>
          useAutoFitFontSize({
            containerRef,
            text,
            font,
            minPx: 1,
            maxPx: 96,
            measure: stubMeasure,
          }),
        { initialProps: { text: 'a'.repeat(10) }, wrapper: StrictMode },
      );
      expect(result.current).toBe(1); // widthPerPx=100; widthBound = 100/100 = 1

      // Prop-driven re-fit after the StrictMode cycle.
      rerender({ text: 'a'.repeat(5) });
      expect(result.current).toBe(2); // widthPerPx=50; widthBound = 100/50 = 2

      // Resize-driven re-fit: the LAST-created observer is the resurrected, live one.
      Object.defineProperty(element, 'clientWidth', { value: 500, configurable: true });
      const calls = vi.mocked(ResizeObserver).mock.calls;
      const lastObserverCallback = calls[calls.length - 1]?.[0];
      act(() => {
        lastObserverCallback?.([], {} as ResizeObserver);
      });
      expect(result.current).toBe(10); // widthBound = 500/50 = 10

      element.remove();
    });
  });
});
