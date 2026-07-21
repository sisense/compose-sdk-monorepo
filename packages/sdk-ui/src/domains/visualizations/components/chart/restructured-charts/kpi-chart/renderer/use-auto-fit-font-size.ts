import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Line-height multiplier used to derive the height cap from `maxHeightPx`. */
const LINE_HEIGHT_FACTOR = 1.2;

// Font size (px) the probe text is measured at. Text width scales ~linearly with font size
// for a fixed string/font, so dividing the measured probe width by the probe size yields
// "px of width per px of font size". Measured at 100px rather than 1px: rasterization/
// hinting make glyph advances not perfectly linear across a large scale-up, so probing in
// the same order of magnitude as the target sizes (16-64px here) keeps the extrapolation
// error negligible where a 1px probe would amplify it 16-64x.
const PROBE_FONT_SIZE_PX = 100;

// Upper bound on verify-and-step-down passes in computeAutoFitFontSize. One correction is
// computed from a measurement AT the candidate size (where no extrapolation error exists),
// so a second pass only runs when the first correction itself lands short -- more than two
// never observed in practice.
const MAX_VERIFY_ITERATIONS = 2;

// Bounded fallback poll used by watchFontAvailability while a REGISTERED font face (one with
// a matching entry in document.fonts) is still loading. FontFaceSet events normally cover that
// window ('loadingdone' fires when a face in the set finishes loading); the poll is a safety
// net for environments where those events are unavailable or get missed.
const FONT_POLL_INTERVAL_MS = 500;
const FONT_POLL_MAX_ATTEMPTS = 20;

function toCssFont(font: { family: string; weight: string | number }, sizePx: number): string {
  return `${font.weight} ${sizePx}px ${font.family}`;
}

/** Extracts the first family of a CSS font-family list, unquoted and lowercased, for comparison. */
function normalizeFontFamily(family: string): string {
  return family
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase();
}

/**
 * Checks whether any font face registered in `fonts` matches `family`'s first-choice family
 * (compared case-insensitively, quotes stripped), or `undefined` when the set cannot be
 * enumerated in this environment.
 */
function isFamilyRegistered(fonts: FontFaceSet, family: string): boolean | undefined {
  if (typeof fonts.forEach !== 'function') return undefined;
  const target = normalizeFontFamily(family);
  let registered = false;
  try {
    fonts.forEach((face) => {
      if (normalizeFontFamily(face.family) === target) registered = true;
    });
  } catch {
    return undefined;
  }
  return registered;
}

/**
 * Invokes `onAvailable` once, as soon as `family`'s first-choice font becomes renderable --
 * or never, if it already is (returns `null`; measurements are already truthful).
 *
 * Why this exists: the canvas `measure` silently falls back to the next available family
 * while a web font is still loading, so a fit computed in that window is wrong for the glyphs
 * the DOM will eventually render (measured Helvetica vs rendered Open Sans differ by ~5% --
 * enough to push a width-bound fit into `text-overflow: ellipsis`).
 *
 * `fonts.check()` alone cannot drive this: per the CSS Font Loading spec it returns `true`
 * not only for loaded faces but ALSO for a family with no matching face in the set at all
 * (rendering would just use fallback, loading nothing). That absent-family state is exactly
 * sdk-ui's own `FontsLoader` mid-load window (standalone `FontFace.load()` first,
 * `document.fonts.add(loadedFace)` only after) -- verified in Chromium 148: `check()` is
 * `true` both before and after the `add()`, no FontFaceSet event fires for the `add()` of an
 * already-loaded face, and only entry enumeration observes the arrival. So the watch runs in
 * one of two modes:
 * - `check()` is `false` (a registered face is still loading -- the CSS `@font-face` path):
 *   re-check `check()` on each `loadingdone`, plus the bounded poll as a safety net;
 * - `check()` is `true` but the family is absent from the set's entries (either a system
 *   font that will never register, or a web font still en route to `FontFaceSet.add()` --
 *   indistinguishable up front): watch entry PRESENCE on each `loadingdone`, with no poll --
 *   a system font would keep a poll running its whole budget on every mount for nothing.
 *   This listener-only watch stays armed until cleanup; since the `add()` itself fires no
 *   event, the arrival is only noticed when some other font activity fires `loadingdone` --
 *   an accepted trade-off versus polling indefinitely for system-font users.
 * @returns A cleanup function to stop watching, or `null` when there's nothing to watch.
 */
function watchFontAvailability(
  cssFont: string,
  family: string,
  onAvailable: () => void,
): (() => void) | null {
  const fonts = document.fonts;
  if (!fonts?.check) return null;

  let checksTrue = false;
  try {
    checksTrue = fonts.check(cssFont);
  } catch {
    return null; // malformed font shorthand: nothing meaningful to watch
  }

  // A `true` from check() is only conclusive when the family actually has a registered face
  // (or the set can't be enumerated to tell -- then trust it, matching the old behavior).
  if (checksTrue && isFamilyRegistered(fonts, family) !== false) return null;

  // `true` + absent family = the ambiguous mode described in the TSDoc above.
  const waitingForRegistration = checksTrue;

  let stopped = false;
  let attempts = 0;
  const cleanups: (() => void)[] = [];

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cleanups.forEach((cleanup) => cleanup());
  };

  const isAvailableNow = (): boolean => {
    try {
      return waitingForRegistration
        ? isFamilyRegistered(fonts, family) === true && fonts.check(cssFont)
        : fonts.check(cssFont);
    } catch {
      return false; // keep waiting
    }
  };

  const checkNow = () => {
    if (stopped) return;
    if (isAvailableNow()) {
      stop();
      onAvailable();
    }
  };

  if (fonts.addEventListener) {
    fonts.addEventListener('loadingdone', checkNow);
    cleanups.push(() => fonts.removeEventListener?.('loadingdone', checkNow));
  }
  if (!waitingForRegistration) {
    const intervalId = setInterval(() => {
      attempts += 1;
      checkNow();
      if (!stopped && attempts >= FONT_POLL_MAX_ATTEMPTS) stop();
    }, FONT_POLL_INTERVAL_MS);
    cleanups.push(() => clearInterval(intervalId));
  }

  return stop;
}

// Shared offscreen 2D context for the default `measure`, created lazily on first use and
// reused by every call afterwards (only `ctx.font` changes per measurement). A per-call
// canvas would be allocated on every resize tick of every KPI tile on a dashboard.
// `undefined` = not yet attempted; `null` = 2D context unavailable in this environment
// (cached too, so a known-unsupported environment isn't re-probed on each call).
let sharedMeasureContext: CanvasRenderingContext2D | null | undefined;

/** Default `measure`: renders the probe font on a shared offscreen canvas and measures it. */
function measureWithCanvas(text: string, cssFont: string): number {
  if (sharedMeasureContext === undefined) {
    sharedMeasureContext = document.createElement('canvas').getContext('2d');
  }
  if (!sharedMeasureContext) return 0;
  sharedMeasureContext.font = cssFont;
  return sharedMeasureContext.measureText(text).width;
}

/**
 * An inline decoration that shares the auto-fitted text's nowrap box and therefore consumes
 * width the text itself cannot use -- e.g. a conditional icon next to the headline value, or
 * the trend arrow before a headline-scale comparison delta. Affix glyphs are styled in em
 * units, so their width scales with the fitted font and must be budgeted proportionally; their
 * margins/flex gaps are fixed px.
 * @internal
 */
export type AutoFitAffix = {
  /** The affix's text content (e.g. the icon glyph or the arrow character). */
  text: string;
  /** The affix's font size relative to the fitted text's, e.g. `0.7` for a 0.7em icon. */
  emScale: number;
  /** Fixed spacing the affix adds (margins plus flex gaps), in px. */
  gapPx: number;
};

/** Sums the widths of `affixes` measured at `fontSizePx` of the HOST text (em-scaled per affix). */
function measureAffixesWidth(
  affixes: readonly AutoFitAffix[],
  font: { family: string; weight: string | number },
  fontSizePx: number,
  measure: (text: string, cssFont: string) => number,
): number {
  return affixes.reduce(
    (total, affix) => total + measure(affix.text, toCssFont(font, affix.emScale * fontSizePx)),
    0,
  );
}

/**
 * Computes the font size (px) that fits `text` (plus any {@link AutoFitAffix}es sharing its
 * box) into a `maxWidthPx` x `maxHeightPx` box.
 *
 * The width bound is derived by measuring `text` -- and each affix at its em-scaled size --
 * at a {@link PROBE_FONT_SIZE_PX} probe font size (via canvas `measureText`, or the injected
 * `measure`) and scaling that composite measurement to `maxWidthPx` minus the affixes' fixed
 * gaps. The height bound is `maxHeightPx` divided by the {@link LINE_HEIGHT_FACTOR}
 * line-height. The tighter of the two bounds is clamped to `[minPx, maxPx]`, floored to a
 * whole pixel, and then VERIFIED: the composite is re-measured at the candidate size itself
 * and stepped down proportionally if it turns out wider than `maxWidthPx` (extrapolation from
 * the probe is near-linear but not exact -- hinting differs per size -- and `text-overflow:
 * ellipsis` clips on ANY overflow, sub-pixel included). The whole-px floor doubles as a
 * fractional-pixel safety margin against that same sub-pixel clipping.
 * @param opts - Fit parameters.
 * @param opts.text - The text to fit.
 * @param opts.font - Font family and weight used to build the probe CSS font string.
 * @param opts.maxWidthPx - Available width, in CSS pixels.
 * @param opts.maxHeightPx - Available height, in CSS pixels.
 * @param opts.minPx - Lower bound for the returned font size.
 * @param opts.maxPx - Upper bound for the returned font size.
 * @param opts.measure - Measures a string's rendered width (px) for a given CSS font
 * shorthand string. Defaults to canvas `measureText`; injectable for tests.
 * @param opts.affixes - Inline decorations sharing the text's box, budgeted into the fit.
 * @returns The fitted font size, in CSS pixels, clamped to `[minPx, maxPx]`.
 * @internal
 */
export function computeAutoFitFontSize(opts: {
  text: string;
  font: { family: string; weight: string | number };
  maxWidthPx: number;
  maxHeightPx: number;
  minPx: number;
  maxPx: number;
  measure?: (text: string, cssFont: string) => number;
  affixes?: readonly AutoFitAffix[];
}): number {
  const {
    text,
    font,
    maxWidthPx,
    maxHeightPx,
    minPx,
    maxPx,
    measure = measureWithCanvas,
    affixes = [],
  } = opts;

  const measuredWidthPerPx =
    (measure(text, toCssFont(font, PROBE_FONT_SIZE_PX)) +
      measureAffixesWidth(affixes, font, PROBE_FONT_SIZE_PX, measure)) /
    PROBE_FONT_SIZE_PX;
  // The affixes' fixed gaps don't scale with the font -- subtract them from the width budget
  // up front instead of folding them into the per-px slope.
  const fixedGapsPx = affixes.reduce((total, affix) => total + affix.gapPx, 0);
  const availableWidthPx = Math.max(0, maxWidthPx - fixedGapsPx);

  // Unmeasurable content (e.g. empty string, no affixes) can't constrain the width -- defer
  // to maxPx, still subject to the height cap and overall clamp below.
  const widthBoundPx = measuredWidthPerPx > 0 ? availableWidthPx / measuredWidthPerPx : maxPx;
  const heightBoundPx = maxHeightPx / LINE_HEIGHT_FACTOR;

  const clampedPx = Math.min(Math.max(Math.min(widthBoundPx, heightBoundPx), minPx), maxPx);
  let fitPx = Math.max(minPx, Math.floor(clampedPx));

  // Verify at the actual candidate size and step down if the probe extrapolation
  // under-measured (see the function TSDoc). Skipped at the minPx floor -- there's nothing
  // left to shrink, and the caller's CSS ellipsis is the designed worst-case there.
  for (let i = 0; i < MAX_VERIFY_ITERATIONS && fitPx > minPx; i++) {
    const actualWidthPx =
      measure(text, toCssFont(font, fitPx)) + measureAffixesWidth(affixes, font, fitPx, measure);
    if (actualWidthPx <= 0 || actualWidthPx <= availableWidthPx) break;
    const next = Math.max(minPx, Math.floor(fitPx * (availableWidthPx / actualWidthPx)));
    if (next === fitPx) break;
    fitPx = next;
  }

  return fitPx;
}

/** Tracks per-element observer state so the hook only tears down/rebuilds on element change. */
type ElementTracker = {
  element: HTMLElement | null;
  ro: ResizeObserver | null;
  cancelled: boolean;
  /** Stops the active {@link watchFontAvailability} watch, if any. */
  stopFontWatch: (() => void) | null;
  /** The probe font string the active watch was armed for, to re-arm on font change. */
  watchedProbeFont: string | null;
};

/**
 * Snapshot of everything {@link useAutoFitFontSize}'s `fit()` feeds into
 * {@link computeAutoFitFontSize}. Two equal snapshots are guaranteed to produce the same
 * result (the computation is pure), so `fit()` skips recomputing when nothing changed.
 * Font is captured by its fields, not object identity -- callers typically pass a fresh
 * `font` literal on every render.
 */
type FitInputs = {
  text: string;
  fontFamily: string;
  fontWeight: string | number;
  maxWidthPx: number;
  maxHeightPx: number;
  minPx: number;
  maxPx: number;
  measure: ((text: string, cssFont: string) => number) | undefined;
  /** Value-compared via {@link affixesKeyOf} -- callers pass fresh array literals per render. */
  affixesKey: string;
};

/** Serializes `affixes` by value for snapshot comparison (array identity changes per render). */
function affixesKeyOf(affixes: readonly AutoFitAffix[] | undefined): string {
  return (affixes ?? []).map((affix) => `${affix.text} ${affix.emScale} ${affix.gapPx}`).join('|');
}

function areSameFitInputs(a: FitInputs, b: FitInputs): boolean {
  return (
    a.text === b.text &&
    a.fontFamily === b.fontFamily &&
    a.fontWeight === b.fontWeight &&
    a.maxWidthPx === b.maxWidthPx &&
    a.maxHeightPx === b.maxHeightPx &&
    a.minPx === b.minPx &&
    a.maxPx === b.maxPx &&
    a.measure === b.measure &&
    a.affixesKey === b.affixesKey
  );
}

/**
 * Computes a KPI headline's auto-fit font size, re-measuring the `containerRef` element's
 * box on resize, and once more whenever `text`/`font`/`minPx`/`maxPx` change (even without
 * a resize).
 * @param params - Fit parameters.
 * @param params.containerRef - Ref to the element whose box the text must fit inside.
 * @param params.text - The text to fit.
 * @param params.font - Font family and weight used for measurement.
 * @param params.minPx - Lower bound for the returned font size.
 * @param params.maxPx - Upper bound for the returned font size.
 * @param params.measure - Forwarded to {@link computeAutoFitFontSize}; injectable for tests.
 * @param params.maxHeightPxOverride - When provided, used as the height bound instead of
 * `containerRef.current.clientHeight`. Needed whenever the container's own box is NOT a safe
 * (non-circular) height reference -- e.g. a flex row that grows to fill its sibling's leftover
 * space, whose rendered height would otherwise track the very font size being computed here,
 * oscillating toward `minPx` instead of the true available height. Width is always measured
 * from `containerRef.current.clientWidth`, which has no such circularity.
 * @param params.enabled - Pass `false` when the caller doesn't currently consume the result
 * (e.g. a KPI subcomponent rendered at its fixed 'compact' scale) to skip the ResizeObserver,
 * canvas measurement, and font-availability watch entirely. Defaults to `true`. The hook still
 * runs (rules of hooks); it just returns `minPx` and performs no work.
 * @param params.affixes - Forwarded to {@link computeAutoFitFontSize}: inline decorations
 * (icons, arrows) sharing the text's box, budgeted into the fit. Compared by value across
 * renders -- fresh array literals are fine.
 * @returns The fitted font size, in CSS pixels. `minPx` until the container is measured.
 * @internal
 */
export function useAutoFitFontSize(params: {
  containerRef: RefObject<HTMLElement | null>;
  text: string;
  font: { family: string; weight: string | number };
  minPx: number;
  maxPx: number;
  measure?: (text: string, cssFont: string) => number;
  maxHeightPxOverride?: number;
  enabled?: boolean;
  affixes?: readonly AutoFitAffix[];
}): number {
  const { containerRef, text, font, minPx, maxPx, measure, maxHeightPxOverride, enabled, affixes } =
    params;
  const [fontSizePx, setFontSizePx] = useState<number>(minPx);

  // Holds the latest inputs so the ResizeObserver and font-watch callbacks below -- both set
  // up only once per element attach -- never compute against stale props from whichever
  // render happened to be current when they were created.
  const latestRef = useRef({
    text,
    font,
    minPx,
    maxPx,
    measure,
    maxHeightPxOverride,
    enabled,
    affixes,
  });
  latestRef.current = { text, font, minPx, maxPx, measure, maxHeightPxOverride, enabled, affixes };

  const trackerRef = useRef<ElementTracker>({
    element: null,
    ro: null,
    cancelled: false,
    stopFontWatch: null,
    watchedProbeFont: null,
  });

  // Snapshot of the inputs behind the last computation; `fit()` bails out early when they
  // haven't changed, so unrelated parent re-renders don't pay for a canvas measurement.
  const lastFitInputsRef = useRef<FitInputs | null>(null);

  // Intentionally no dependency array: `containerRef.current` is not reactive (it can
  // transition null -> element across renders without the ref object itself changing --
  // see useLineHeight for the same issue), and `text`/`font`/`minPx`/`maxPx` must also
  // trigger a re-fit without necessarily changing the observed element. The unconditional
  // `fit()` call at the end covers every render (including prop-only changes) and is kept
  // cheap by the input-snapshot bail-out; the tracker guards the one-time-per-element
  // ResizeObserver/font-watch setup above it. The disabled-branch `setFontSizePx` cannot
  // chain updates: it's identity-guarded (functional update returning `prev` when already
  // at `minPx`), so the re-render it triggers runs the effect once more as a no-op.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    // `enabled: false` rides the existing null-element teardown path: the observer and font
    // watch are torn down (or never set up) exactly as if the element had unmounted.
    const element = latestRef.current.enabled === false ? null : containerRef.current;
    const tracker = trackerRef.current;

    const fit = () => {
      if (tracker.cancelled) return;
      const current = containerRef.current;
      if (!current) return;
      const latest = latestRef.current;
      const inputs: FitInputs = {
        text: latest.text,
        fontFamily: latest.font.family,
        fontWeight: latest.font.weight,
        maxWidthPx: current.clientWidth,
        maxHeightPx: latest.maxHeightPxOverride ?? current.clientHeight,
        minPx: latest.minPx,
        maxPx: latest.maxPx,
        measure: latest.measure,
        affixesKey: affixesKeyOf(latest.affixes),
      };
      const last = lastFitInputsRef.current;
      if (last && areSameFitInputs(last, inputs)) return;
      lastFitInputsRef.current = inputs;
      const next = computeAutoFitFontSize({
        text: inputs.text,
        font: latest.font,
        maxWidthPx: inputs.maxWidthPx,
        maxHeightPx: inputs.maxHeightPx,
        minPx: inputs.minPx,
        maxPx: inputs.maxPx,
        measure: inputs.measure,
        affixes: latest.affixes,
      });
      setFontSizePx((prev) => (prev === next ? prev : next));
    };

    // Re-arm when the element changed (appeared, disappeared, or swapped) -- AND when the
    // tracker was poisoned by the unmount-effect cleanup below while the element stayed the
    // same. The latter is exactly React 18 StrictMode's simulated unmount/remount in dev: the
    // cleanup cancels the tracker and disconnects the observer, and the remounted effect would
    // otherwise see an unchanged element and never resurrect them -- freezing the font size at
    // whatever was computed before the poisoning, permanently (the "tiny value until a resize
    // wiggle" UAT bug -- and the wiggle can't even help, since fit() bails on `cancelled`).
    if (element !== tracker.element || (element !== null && tracker.cancelled)) {
      // Tear down whatever observers the previous element (or the pre-poisoning run) had.
      tracker.cancelled = true;
      tracker.ro?.disconnect();
      tracker.ro = null;
      tracker.stopFontWatch?.();
      tracker.stopFontWatch = null;
      tracker.watchedProbeFont = null;
      tracker.element = element;

      if (element) {
        tracker.cancelled = false;

        const ro = new ResizeObserver(fit);
        ro.observe(element);
        tracker.ro = ro;
      }
    }

    if (element) {
      // A web font arriving after a fit changes glyph metrics: the canvas `measure` silently
      // used a fallback family in the meantime, so the computed size is wrong for the glyphs
      // the DOM actually renders (this is the "value ellipsized at 210px" UAT bug). (Re)arm
      // the availability watch whenever the measured font changes; on arrival, the snapshot
      // is invalidated first -- the *inputs* are unchanged, but the widths the measure
      // reports are not, so the bail-out must not swallow the corrective re-measure.
      const probeFont = toCssFont(latestRef.current.font, PROBE_FONT_SIZE_PX);
      if (probeFont !== tracker.watchedProbeFont) {
        tracker.watchedProbeFont = probeFont;
        tracker.stopFontWatch?.();
        tracker.stopFontWatch = watchFontAvailability(
          probeFont,
          latestRef.current.font.family,
          () => {
            lastFitInputsRef.current = null;
            fit();
          },
        );
      }

      fit();
    } else {
      // Disabled (or detached): honor the documented contract -- the hook returns `minPx` and
      // performs no work -- rather than keeping the last computed size around. The snapshot is
      // invalidated too, so a later re-enable with identical inputs recomputes instead of
      // bailing out against a stale last-fit snapshot.
      lastFitInputsRef.current = null;
      const disabledSizePx = latestRef.current.minPx;
      setFontSizePx((prev) => (prev === disabledSizePx ? prev : disabledSizePx));
    }
  });

  // Disconnect on unmount. The no-dep useLayoutEffect above returns no cleanup of its own,
  // so a separate effect handles teardown when the component is removed from the tree.
  useEffect(
    () => () => {
      trackerRef.current.cancelled = true;
      trackerRef.current.ro?.disconnect();
      trackerRef.current.stopFontWatch?.();
    },
    [],
  );

  return fontSizePx;
}
