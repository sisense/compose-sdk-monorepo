import { describe, expect, it } from 'vitest';

import { getCompleteWidgetNarrativeConfig } from '@/domains/narrative/core/widget-narrative-config.js';
import type {
  WidgetDtoNarration,
  WidgetStyle,
} from '@/domains/widgets/components/widget-by-id/types.js';

import {
  extractWidgetNarrativeConfigFromDto,
  mergeWidgetStyleWithNarrativeForDto,
  narrativeConfigToWidgetDtoNarration,
} from './widget-narrative-style.js';

describe('widget-narrative-style', () => {
  describe('getCompleteWidgetNarrativeConfig', () => {
    it('defaults feedback.enabled to false when omitted', () => {
      expect(getCompleteWidgetNarrativeConfig({})).toMatchObject({
        feedback: { enabled: false },
      });
    });

    it('defaults feedback.enabled to false when narrative is undefined', () => {
      expect(getCompleteWidgetNarrativeConfig(undefined)).toMatchObject({
        feedback: { enabled: false },
      });
    });

    it('respects feedback.enabled true', () => {
      expect(getCompleteWidgetNarrativeConfig({ feedback: { enabled: true } })).toMatchObject({
        feedback: { enabled: true },
      });
    });
  });

  describe('extractWidgetNarrativeConfigFromDto', () => {
    it('maps Fusion display and verbosity (medium) to SDK fields', () => {
      expect(
        extractWidgetNarrativeConfigFromDto({
          enabled: false,
          display: 'above',
          verbosity: 'medium',
          format: 'bullets',
        }),
      ).toEqual({
        enabled: false,
        displayLocation: 'above',
        verbosity: 'low',
      });
    });

    it('maps high verbosity and Fusion autoShow', () => {
      expect(
        extractWidgetNarrativeConfigFromDto({
          verbosity: 'high',
          autoShow: true,
        }),
      ).toEqual({
        verbosity: 'high',
        autoShow: true,
      });
    });

    it('maps legacy Fusion displayMode strings to autoShow when autoShow is absent', () => {
      expect(
        extractWidgetNarrativeConfigFromDto({
          verbosity: 'high',
          displayMode: 'onLoad',
        } as unknown as WidgetDtoNarration),
      ).toEqual({
        verbosity: 'high',
        autoShow: true,
      });
    });

    it('maps unknown display string to above', () => {
      expect(
        extractWidgetNarrativeConfigFromDto({
          display: 'unknown-placement',
        }),
      ).toEqual({ displayLocation: 'above' });
    });

    it('maps feedback.enabled from Fusion narration payload', () => {
      expect(
        extractWidgetNarrativeConfigFromDto({
          feedback: { enabled: false },
        }),
      ).toEqual({ feedback: { enabled: false } });
    });

    it('maps Fusion size to SDK height', () => {
      expect(extractWidgetNarrativeConfigFromDto({ size: 0.2596622596153846 })).toEqual({
        heightFraction: 0.2596622596153846,
      });
    });

    it('rejects invalid size values (< 0, > 1, NaN, Infinity) and returns undefined', () => {
      expect(extractWidgetNarrativeConfigFromDto({ size: -0.5 })).toBeUndefined();
      expect(extractWidgetNarrativeConfigFromDto({ size: 1.5 })).toBeUndefined();
      expect(extractWidgetNarrativeConfigFromDto({ size: NaN })).toBeUndefined();
      expect(extractWidgetNarrativeConfigFromDto({ size: Infinity })).toBeUndefined();
    });

    it('returns undefined for empty narration object', () => {
      expect(extractWidgetNarrativeConfigFromDto({})).toBeUndefined();
    });
  });

  describe('narrativeConfigToWidgetDtoNarration', () => {
    it('writes Fusion autoShow only when explicitly present on narrative', () => {
      const withoutAutoShow = narrativeConfigToWidgetDtoNarration({
        enabled: true,
        verbosity: 'low',
        displayLocation: 'below',
      });
      expect(withoutAutoShow).toMatchObject({
        enabled: true,
        verbosity: 'medium',
        display: 'below',
      });
      expect(withoutAutoShow && 'autoShow' in withoutAutoShow).toBe(false);

      const withAutoShow = narrativeConfigToWidgetDtoNarration({
        enabled: true,
        verbosity: 'low',
        displayLocation: 'below',
        autoShow: true,
      });
      expect(withAutoShow).toMatchObject({ autoShow: true });

      const withAutoShowFalse = narrativeConfigToWidgetDtoNarration({
        enabled: true,
        verbosity: 'low',
        displayLocation: 'below',
        autoShow: false,
      });
      expect(withAutoShowFalse).toMatchObject({ autoShow: false });
    });

    it('writes feedback onto narration DTO', () => {
      expect(narrativeConfigToWidgetDtoNarration({ feedback: { enabled: false } })).toEqual({
        feedback: { enabled: false },
      });
    });

    it('maps SDK heightFraction to Fusion size', () => {
      expect(narrativeConfigToWidgetDtoNarration({ heightFraction: 0.3 })).toEqual({ size: 0.3 });
    });

    it('rejects invalid heightFraction values (< 0, > 1, NaN, Infinity) and returns undefined', () => {
      expect(narrativeConfigToWidgetDtoNarration({ heightFraction: -0.5 })).toBeUndefined();
      expect(narrativeConfigToWidgetDtoNarration({ heightFraction: 1.5 })).toBeUndefined();
      expect(narrativeConfigToWidgetDtoNarration({ heightFraction: NaN })).toBeUndefined();
      expect(narrativeConfigToWidgetDtoNarration({ heightFraction: Infinity })).toBeUndefined();
    });

    it('serializes only typed SDK fields (no unknown Fusion passthrough)', () => {
      expect(
        narrativeConfigToWidgetDtoNarration({
          enabled: true,
          verbosity: 'low',
          displayLocation: 'above',
        }),
      ).toEqual({
        enabled: true,
        verbosity: 'medium',
        display: 'above',
      });
    });
  });

  describe('mergeWidgetStyleWithNarrativeForDto', () => {
    it('returns base style unchanged when narrative is absent', () => {
      const base = { legend: { enabled: true } } as WidgetStyle;
      expect(mergeWidgetStyleWithNarrativeForDto(base, undefined)).toBe(base);
    });

    it('merges narration including feedback onto style', () => {
      const base = { legend: { enabled: true } } as WidgetStyle;
      const merged = mergeWidgetStyleWithNarrativeForDto(base, {
        feedback: { enabled: false },
      });
      expect(merged).toEqual({
        legend: { enabled: true },
        narration: { feedback: { enabled: false } },
      });
    });
  });
});
