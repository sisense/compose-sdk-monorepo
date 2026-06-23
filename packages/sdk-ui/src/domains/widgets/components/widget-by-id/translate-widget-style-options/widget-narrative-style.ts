import type {
  WidgetDtoNarration,
  WidgetStyle,
} from '@/domains/widgets/components/widget-by-id/types.js';
import type { WidgetNarrativeDisplayLocation, WidgetNarrativeOptions } from '@/types.js';

const DISPLAY_LOCATIONS: ReadonlySet<WidgetNarrativeDisplayLocation> = new Set([
  'above',
  'below',
  'alone',
]);

function normalizeNarrativeSize(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  return value >= 0 && value <= 1 ? value : undefined;
}

/**
 * Maps Fusion `style.narration` into SDK {@link WidgetNarrativeOptions},
 * including `feedback` when present on the DTO.
 *
 * Reads boolean `autoShow`; legacy string `displayMode` (`onLoad` / `onClick`) is still accepted for
 * older payloads when `autoShow` is absent.
 *
 * @param dto - Fusion narration payload, if any
 * @returns Partial narrative options, or `undefined` when absent or empty
 * @internal
 */
export function extractWidgetNarrativeOptionsFromDto(
  dto: WidgetDtoNarration | undefined,
): WidgetNarrativeOptions | undefined {
  if (dto == null || Object.keys(dto).length === 0) {
    return undefined;
  }

  const out: WidgetNarrativeOptions = {};

  if ('enabled' in dto && dto.enabled !== undefined) {
    out.enabled = dto.enabled;
  }

  if ('verbosity' in dto && dto.verbosity !== undefined) {
    out.verbosity = dtoVerbosityToSdk(String(dto.verbosity));
  }

  if ('display' in dto && dto.display !== undefined) {
    out.displayLocation = dtoDisplayToSdkLocation(String(dto.display));
  }

  if ('autoShow' in dto && typeof dto.autoShow === 'boolean') {
    out.autoShow = dto.autoShow;
  } else {
    const legacy = dto as Readonly<Record<string, unknown>>;
    const legacyMode = legacy.displayMode;
    if (typeof legacyMode === 'string') {
      if (legacyMode === 'onLoad') {
        out.autoShow = true;
      } else if (legacyMode === 'onClick') {
        out.autoShow = false;
      }
    }
  }

  if ('includeTrendAndForecast' in dto && typeof dto.includeTrendAndForecast === 'boolean') {
    out.includeTrendAndForecast = dto.includeTrendAndForecast;
  }

  if (dto.feedback && typeof dto.feedback.enabled === 'boolean') {
    out.feedback = { enabled: dto.feedback.enabled };
  }

  const normalizedSize = normalizeNarrativeSize(dto.size);
  if (normalizedSize !== undefined) {
    out.heightFraction = normalizedSize;
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

/**
 * Builds Fusion `style.narration` from SDK {@link WidgetNarrativeOptions} only (typed fields).
 *
 * @param narrative - SDK narrative slice from {@link WidgetAiOptions.narrative}
 * @returns Narration DTO, or `undefined` when nothing should be written
 * @internal
 */
export function narrativeOptionsToWidgetDtoNarration(
  narrative: WidgetNarrativeOptions | undefined,
): WidgetDtoNarration | undefined {
  const base: Record<string, unknown> = {};

  if (narrative) {
    if (narrative.enabled !== undefined) {
      base.enabled = narrative.enabled;
    }
    if ('verbosity' in narrative && narrative.verbosity !== undefined) {
      base.verbosity = verbosityToDtoString(narrative.verbosity);
    }
    if (narrative.displayLocation !== undefined) {
      base.display = narrative.displayLocation;
    }
    if ('includeTrendAndForecast' in narrative && narrative.includeTrendAndForecast !== undefined) {
      base.includeTrendAndForecast = narrative.includeTrendAndForecast;
    }
    if ('autoShow' in narrative) {
      base.autoShow = narrative.autoShow;
    }
    if (narrative.feedback && typeof narrative.feedback.enabled === 'boolean') {
      base.feedback = { enabled: narrative.feedback.enabled };
    }
    const normalizedHeight = normalizeNarrativeSize(narrative.heightFraction);
    if (normalizedHeight !== undefined) {
      base.size = normalizedHeight;
    }
  }

  if (Object.keys(base).length === 0) {
    return undefined;
  }
  return base as WidgetDtoNarration;
}

/**
 * Merges narrative options onto a Fusion widget `style` object for {@link toWidgetDto}.
 *
 * @param baseStyle - Chart or pivot style object without narration
 * @param narrative - SDK narrative from {@link WidgetModel.aiOptions}
 * @returns `WidgetStyle` with narration merged, or base style unchanged when narrative is absent
 * @internal
 */
export function mergeWidgetStyleWithNarrativeForDto(
  baseStyle: WidgetStyle,
  narrative: WidgetNarrativeOptions | undefined,
): WidgetStyle {
  const dtoNarration = narrativeOptionsToWidgetDtoNarration(narrative);

  if (dtoNarration === undefined) {
    return baseStyle;
  }

  return {
    ...baseStyle,
    narration: dtoNarration,
  };
}

function dtoVerbosityToSdk(verbosity: string): 'low' | 'high' {
  return verbosity.toLowerCase() === 'high' ? 'high' : 'low';
}

function dtoDisplayToSdkLocation(display: string): WidgetNarrativeDisplayLocation {
  if (DISPLAY_LOCATIONS.has(display as WidgetNarrativeDisplayLocation)) {
    return display as WidgetNarrativeDisplayLocation;
  }
  return 'above';
}

function verbosityToDtoString(sdk: 'low' | 'high'): string {
  return sdk === 'high' ? 'high' : 'medium';
}
