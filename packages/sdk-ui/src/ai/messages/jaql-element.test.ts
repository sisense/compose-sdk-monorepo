import MOCK_NLQ_RESPONSE from '@/ai/__mocks__/nlq-response';
import { createJaqlElement } from '@/ai/messages/jaql-element';
import { isMeasureColumn } from '@/chart-data-options/utils';
import { MetadataItem } from '@sisense/sdk-query-client';

describe('createJaqlElement', () => {
  it('should create JaqlElement with correct Category or Value type', () => {
    MOCK_NLQ_RESPONSE.jaql.metadata.forEach((metadataItem) => {
      const jaqlElement = createJaqlElement(metadataItem);
      expect('formula' in metadataItem.jaql).toEqual(isMeasureColumn(jaqlElement));
    });
  });

  it('should create JaqlElement with correct sortType', () => {
    const item: MetadataItem = {
      jaql: {
        dim: '[Commerce.Revenue]',
        agg: 'sum',
        sort: 'desc',
        title: 'Total Revenue',
      },
    };
    expect(createJaqlElement(item).sortType).toBe('sortDesc');

    delete item.jaql.sort;
    expect(createJaqlElement(item).sortType).toBeUndefined();
  });
});
