import { createDimensionalElementFromMetadataItem, createJaqlElement } from './jaql-element.js';
import { MetadataItem } from './types.js';

describe('createJaqlElement', () => {
  it('should create JaqlElement with correct Category or Value type', () => {
    const metadata = [
      {
        jaql: {
          dim: '[Commerce.Condition]',
          table: 'Commerce',
          column: 'Condition',
          datatype: 'text',
          title: 'Condition',
        },
        panel: 'columns',
      },
      {
        jaql: {
          type: 'measure',
          context: {
            '[d6fb]': {
              dim: '[Commerce.Revenue]',
              table: 'Commerce',
              column: 'Revenue',
            },
          },
          formula: 'sum([d6fb])',
          title: 'Total Revenue',
        },
        panel: 'measures',
      },
    ];

    metadata.forEach((metadataItem) => {
      const jaqlElement = createJaqlElement(metadataItem);
      expect(jaqlElement.jaql()).toEqual(metadataItem);
      expect(jaqlElement.jaql(false)).toEqual(metadataItem);
      expect(jaqlElement.jaql(true)).toEqual(metadataItem.jaql);
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

describe('createDimensionalElementFromMetadataItem', () => {
  it('should create DimensionalElement with Attribute', () => {
    const metadata = [
      {
        jaql: {
          dim: '[Commerce.Condition]',
          datatype: 'text',
          title: 'Condition',
        },
      },
      {
        jaql: {
          dim: '[Commerce.Revenue]',
          agg: 'sum',
          datatype: 'numeric',
          title: 'Revenue',
        },
      },
      {
        jaql: {
          formula: 'QUARTILE([28B80-CD8], 2)',
          context: {
            '[28B80-CD8]': {
              dim: '[Commerce.Revenue]',
              datatype: 'numeric',
              title: 'Revenue',
            },
          },
          title: 'Revenue Median',
        },
      },
      {
        jaql: {
          invalidProp: 'invalid-value',
        },
      },
    ];

    metadata.forEach((metadataItem) => {
      const dimensionalElement = createDimensionalElementFromMetadataItem(metadataItem);
      expect(dimensionalElement.jaql()).toEqual(metadataItem);
    });
  });
});
