import {
  AggregationTypes,
  createAttribute,
  createLevel,
  DateLevels,
  measureFactory,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { buildMeasureRankingTitle, getRankingMeasureDisplayName } from './measure-ranking-title.js';

const t = ((key: string, options?: { columnName?: string }) => {
  const translations: Record<string, string> = {
    'measuresAgg.countDistinct': '# of unique',
    'measuresAgg.count': '# of',
    'measuresAgg.sum': 'Total',
    'attribute.datetimeName.quarters': 'Quarters in {{columnName}}',
  };
  const template = translations[key] ?? key;
  return template.replace('{{columnName}}', options?.columnName ?? '');
}) as Parameters<typeof buildMeasureRankingTitle>[2];

const brandAttribute = createAttribute({
  name: 'Brand',
  type: 'text-attribute',
  expression: '[Brand.Brand]',
  dataSource: { title: 'Sample ECommerce', live: false },
});

describe('measure-ranking-title', () => {
  it('builds countDistinct title from aggregation and attribute name', () => {
    expect(buildMeasureRankingTitle(AggregationTypes.CountDistinct, 'Brand', t)).toBe(
      '# of unique Brand',
    );
  });

  it('builds sum title from aggregation and attribute name', () => {
    expect(buildMeasureRankingTitle(AggregationTypes.Sum, 'Revenue', t)).toBe('Total Revenue');
  });

  it('returns human-readable title for dimensional base measures', () => {
    const measure = measureFactory.countDistinct(brandAttribute, 'countDistinct Brand');
    expect(getRankingMeasureDisplayName(measure, t)).toBe('# of unique Brand');
  });

  it('includes parent date column for level attribute countDistinct measures', () => {
    const quartersLevel = createLevel({
      name: 'Quarters',
      expression: '[Commerce.Date]',
      granularity: DateLevels.Quarters,
      dataSource: { title: 'Sample ECommerce', live: false },
    });
    const measure = measureFactory.countDistinct(quartersLevel, '# of unique Quarters');

    expect(getRankingMeasureDisplayName(measure, t)).toBe('# of unique Quarters in Date');
  });

  it('uses measure name when attribute title already includes aggregation prefix', () => {
    const costAttribute = createAttribute({
      name: 'Total Cost',
      type: 'numeric-attribute',
      expression: '[Commerce.Cost]',
      dataSource: { title: 'Sample ECommerce', live: false },
    });
    const measure = measureFactory.sum(costAttribute, 'Total Cost');

    expect(getRankingMeasureDisplayName(measure, t)).toBe('Total Cost');
  });

  it('returns empty string when measure is null', () => {
    expect(getRankingMeasureDisplayName(null, t)).toBe('');
  });

  it('returns the original measure name for non-dimensional measures', () => {
    const formulaMeasure = {
      name: 'Custom Revenue',
      type: 'calculatedmeasure',
      expression: '1',
    } as unknown as Parameters<typeof getRankingMeasureDisplayName>[0];

    expect(getRankingMeasureDisplayName(formulaMeasure, t)).toBe('Custom Revenue');
  });
});
