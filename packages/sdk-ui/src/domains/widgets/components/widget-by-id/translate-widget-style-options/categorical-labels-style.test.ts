import { describe, expect, it } from 'vitest';

import {
  buildFunnelSeriesLabelsFromFusionLabels,
  buildPieSeriesLabelsFromFusionLabels,
  DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING,
  extractCategoricalLabelFormatting,
  getFusionCategoricalLabelsRotation,
  toFusionCategoricalLabelsFromSeriesLabels,
} from './categorical-labels-style.js';

describe('categorical-labels-style', () => {
  const fusionLabels = {
    enabled: true,
    categories: true,
    percent: true,
    value: true,
    decimals: false,
    rotation: 0,
    customRotation: 45,
    prefix: 'P:',
    suffix: '%',
    backgroundColor: '#00bcd4',
    backgroundPadding: 6,
    borderColor: '#333333',
    borderWidth: 2,
    borderRadius: 4,
    xOffset: 3,
    yOffset: -2,
  };

  it('getFusionCategoricalLabelsRotation prefers customRotation', () => {
    expect(getFusionCategoricalLabelsRotation(fusionLabels)).toBe(45);
  });

  it('getFusionCategoricalLabelsRotation falls back to rotation when customRotation is null', () => {
    expect(getFusionCategoricalLabelsRotation({ ...fusionLabels, customRotation: null })).toBe(0);
  });

  it('extractCategoricalLabelFormatting maps borderWidth and padding independently of colors', () => {
    expect(
      extractCategoricalLabelFormatting({
        ...fusionLabels,
        backgroundColor: null,
        backgroundPadding: 6,
        borderColor: null,
        borderWidth: 3,
        borderRadius: 8,
      }),
    ).toEqual(
      expect.objectContaining({
        padding: 6,
        borderWidth: 3,
        borderRadius: 8,
      }),
    );
  });

  it('buildPieSeriesLabelsFromFusionLabels maps formatting fields', () => {
    expect(buildPieSeriesLabelsFromFusionLabels(fusionLabels)).toEqual({
      enabled: true,
      showCategory: true,
      showValue: true,
      percentageLabels: { enabled: true, showDecimals: false },
      rotation: 45,
      prefix: 'P:',
      suffix: '%',
      backgroundColor: '#00bcd4',
      padding: 6,
      borderColor: '#333333',
      borderWidth: 2,
      borderRadius: 4,
      xOffset: 3,
      yOffset: -2,
    });
  });

  it('buildFunnelSeriesLabelsFromFusionLabels maps formatting fields', () => {
    expect(buildFunnelSeriesLabelsFromFusionLabels(fusionLabels)).toEqual({
      enabled: true,
      showCategory: true,
      showValue: true,
      showPercentage: true,
      showPercentDecimals: false,
      rotation: 45,
      prefix: 'P:',
      suffix: '%',
      backgroundColor: '#00bcd4',
      padding: 6,
      borderColor: '#333333',
      borderWidth: 2,
      borderRadius: 4,
      xOffset: 3,
      yOffset: -2,
    });
  });

  it('toFusionCategoricalLabelsFromSeriesLabels round-trips pie seriesLabels', () => {
    const seriesLabels = buildPieSeriesLabelsFromFusionLabels(fusionLabels);
    expect(toFusionCategoricalLabelsFromSeriesLabels(undefined, seriesLabels)).toEqual({
      enabled: true,
      categories: true,
      percent: true,
      value: true,
      decimals: false,
      ...DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING,
      rotation: 45,
      customRotation: null,
      prefix: 'P:',
      suffix: '%',
      backgroundColor: '#00bcd4',
      backgroundPadding: 6,
      borderColor: '#333333',
      borderWidth: 2,
      borderRadius: 4,
      xOffset: 3,
      yOffset: -2,
    });
  });
});
