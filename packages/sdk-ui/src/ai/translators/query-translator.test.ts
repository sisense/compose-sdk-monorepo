import { QueryTranslator } from '@/ai';

describe('QueryTranslator', () => {
  let queryTranslator: QueryTranslator;
  const metadataItem1 = {
    jaql: {
      dim: '[Commerce.Condition]',
      table: 'Commerce',
      column: 'Condition',
      datatype: 'text',
      title: 'Condition',
    },
    panel: 'columns',
  };

  const metadataItem2 = {
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
      title: 'total of Revenue',
    },
    panel: 'measures',
  };

  beforeEach(() => {
    queryTranslator = new QueryTranslator('Sample ECommerce', []);
  });

  it('should simplifyMetadataItemJaql by removing "table", "column", and "datatype"', () => {
    const simplifiedItem = queryTranslator.simplifyMetadataItemJaql(metadataItem1.jaql);
    const expectedItem = {
      dim: '[Commerce.Condition]',
      title: 'Condition',
    };

    expect(simplifiedItem).toEqual(expectedItem);
  });

  // skipped for now
  it.skip('should simplifyMetadataItemJaql by removing "table" and "column" out of context', () => {
    const simplifiedItem = queryTranslator.simplifyMetadataItemJaql(metadataItem2.jaql);

    console.log(simplifiedItem);

    const expectedItem = {
      type: 'measure',
      context: { '[d6fb]': { dim: '[Commerce.Revenue]' } },
      formula: 'sum([d6fb])',
      title: 'total of Revenue',
    };

    expect(simplifiedItem).toEqual(expectedItem);
  });

  it('should simplifyAggFormula by extracting the aggregation function from the match', () => {
    const simplifiedAggFormula = queryTranslator.simplifyAggFormula(metadataItem2.jaql);

    const expectedAggFormula = {
      dim: '[Commerce.Revenue]',
      agg: 'sum',
      title: 'total of Revenue',
    };

    expect(simplifiedAggFormula).toEqual(expectedAggFormula);
  });
});
