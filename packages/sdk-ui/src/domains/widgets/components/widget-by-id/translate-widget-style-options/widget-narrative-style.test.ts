import { describe, expect, it } from 'vitest';

import { getCompleteWidgetNarrativeOptions } from '@/domains/narrative/core/widget-narrative-options.js';
import type {
  WidgetDtoNarration,
  WidgetStyle,
} from '@/domains/widgets/components/widget-by-id/types.js';

import {
  extractWidgetNarrativeOptionsFromDto,
  mergeWidgetStyleWithNarrativeForDto,
  narrativeOptionsToWidgetDtoNarration,
} from './widget-narrative-style.js';

describe('widget-narrative-style', () => {
  describe('getCompleteWidgetNarrativeOptions', () => {
    it('defaults feedback.enabled to false when omitted', () => {
      expect(getCompleteWidgetNarrativeOptions({})).toMatchObject({
        feedback: { enabled: false },
      });
    });

    it('defaults feedback.enabled to false when narrative is undefined', () => {
      expect(getCompleteWidgetNarrativeOptions(undefined)).toMatchObject({
        feedback: { enabled: false },
      });
    });

    it('respects feedback.enabled true', () => {
      expect(getCompleteWidgetNarrativeOptions({ feedback: { enabled: true } })).toMatchObject({
        feedback: { enabled: true },
      });
    });
  });

  describe('extractWidgetNarrativeOptionsFromDto', () => {
    it('maps Fusion display and verbosity (medium) to SDK fields', () => {
      expect(
        extractWidgetNarrativeOptionsFromDto({
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
        extractWidgetNarrativeOptionsFromDto({
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
        extractWidgetNarrativeOptionsFromDto({
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
        extractWidgetNarrativeOptionsFromDto({
          display: 'unknown-placement',
        }),
      ).toEqual({ displayLocation: 'above' });
    });

    it('maps feedback.enabled from Fusion narration payload', () => {
      expect(
        extractWidgetNarrativeOptionsFromDto({
          feedback: { enabled: false },
        }),
      ).toEqual({ feedback: { enabled: false } });
    });

    it('maps Fusion size to SDK height', () => {
      expect(extractWidgetNarrativeOptionsFromDto({ size: 0.2596622596153846 })).toEqual({
        heightFraction: 0.2596622596153846,
      });
    });

    it('rejects invalid size values (< 0, > 1, NaN, Infinity) and returns undefined', () => {
      expect(extractWidgetNarrativeOptionsFromDto({ size: -0.5 })).toBeUndefined();
      expect(extractWidgetNarrativeOptionsFromDto({ size: 1.5 })).toBeUndefined();
      expect(extractWidgetNarrativeOptionsFromDto({ size: NaN })).toBeUndefined();
      expect(extractWidgetNarrativeOptionsFromDto({ size: Infinity })).toBeUndefined();
    });

    it('returns undefined for empty narration object', () => {
      expect(extractWidgetNarrativeOptionsFromDto({})).toBeUndefined();
    });
  });

  describe('narrativeOptionsToWidgetDtoNarration', () => {
    it('writes Fusion autoShow only when explicitly present on narrative', () => {
      const withoutAutoShow = narrativeOptionsToWidgetDtoNarration({
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

      const withAutoShow = narrativeOptionsToWidgetDtoNarration({
        enabled: true,
        verbosity: 'low',
        displayLocation: 'below',
        autoShow: true,
      });
      expect(withAutoShow).toMatchObject({ autoShow: true });

      const withAutoShowFalse = narrativeOptionsToWidgetDtoNarration({
        enabled: true,
        verbosity: 'low',
        displayLocation: 'below',
        autoShow: false,
      });
      expect(withAutoShowFalse).toMatchObject({ autoShow: false });
    });

    it('writes feedback onto narration DTO', () => {
      expect(narrativeOptionsToWidgetDtoNarration({ feedback: { enabled: false } })).toEqual({
        feedback: { enabled: false },
      });
    });

    it('maps SDK heightFraction to Fusion size', () => {
      expect(narrativeOptionsToWidgetDtoNarration({ heightFraction: 0.3 })).toEqual({ size: 0.3 });
    });

    it('rejects invalid heightFraction values (< 0, > 1, NaN, Infinity) and returns undefined', () => {
      expect(narrativeOptionsToWidgetDtoNarration({ heightFraction: -0.5 })).toBeUndefined();
      expect(narrativeOptionsToWidgetDtoNarration({ heightFraction: 1.5 })).toBeUndefined();
      expect(narrativeOptionsToWidgetDtoNarration({ heightFraction: NaN })).toBeUndefined();
      expect(narrativeOptionsToWidgetDtoNarration({ heightFraction: Infinity })).toBeUndefined();
    });

    it('serializes only typed SDK fields (no unknown Fusion passthrough)', () => {
      expect(
        narrativeOptionsToWidgetDtoNarration({
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
