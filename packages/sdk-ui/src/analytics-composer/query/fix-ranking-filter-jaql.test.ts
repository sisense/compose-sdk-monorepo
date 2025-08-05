import { MetadataItem } from '@sisense/sdk-data';
import { fixRankingFilterJaql } from './fix-ranking-filter-jaql';

describe('fixRankingFilterJaql', () => {
  const mockRowsDimension: MetadataItem = {
    jaql: {
      dim: '[Ingredient.IngredientName]',
      table: 'Ingredient',
      column: 'IngredientName',
      datatype: 'text',
      title: 'IngredientName',
    },
    panel: 'rows',
  };

  const mockMeasureItem: MetadataItem = {
    jaql: {
      type: 'measure',
      context: {
        '[7022]': {
          dim: '[SauceProductionFact.Revenue]',
          table: 'SauceProductionFact',
          column: 'Revenue',
          datatype: 'numeric',
        },
      },
      formula: 'sum([7022])',
      title: 'total of Revenue',
    },
    panel: 'measures',
  };

  describe('when problematic ranking filter exists', () => {
    it('should transform problematic top ranking filter to correct structure', () => {
      // Problematic structure (Structure 2)
      const problematicItems = [
        mockRowsDimension,
        {
          jaql: {
            type: 'measure',
            context: {
              '[7022]': {
                dim: '[SauceProductionFact.Revenue]',
                table: 'SauceProductionFact',
                column: 'Revenue',
                datatype: 'numeric',
              },
            },
            formula: 'sum([7022])',
            filter: {
              top: 10,
            },
            title: 'top 10 by total of Revenue',
          },
          panel: 'scope',
        },
        mockMeasureItem,
      ] as MetadataItem[];

      const result = fixRankingFilterJaql(problematicItems);

      // Should transform to correct structure (Structure 1)
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockRowsDimension); // rows item unchanged
      expect(result[2]).toEqual(mockMeasureItem); // measures item unchanged

      // Check transformed scope item
      const transformedScopeItem = result[1];
      expect(transformedScopeItem.panel).toBe('scope');
      expect(transformedScopeItem.jaql.dim).toBe('[Ingredient.IngredientName]');
      expect(transformedScopeItem.jaql.table).toBe('Ingredient');
      expect(transformedScopeItem.jaql.column).toBe('IngredientName');
      expect(transformedScopeItem.jaql.datatype).toBe('text');
      expect(transformedScopeItem.jaql.title).toBe('top 10 by total of Revenue');
      expect(transformedScopeItem.jaql.type).toBeUndefined(); // type should be removed

      // Check filter structure
      expect(transformedScopeItem.jaql.filter).toEqual({
        top: 10,
        by: {
          type: 'measure',
          context: {
            '[7022]': {
              dim: '[SauceProductionFact.Revenue]',
              table: 'SauceProductionFact',
              column: 'Revenue',
              datatype: 'numeric',
            },
          },
          formula: 'sum([7022])',
        },
      });
    });

    it('should transform problematic bottom ranking filter to correct structure', () => {
      const problematicItems = [
        mockRowsDimension,
        {
          jaql: {
            type: 'measure',
            context: {
              '[7022]': {
                dim: '[SauceProductionFact.Revenue]',
                table: 'SauceProductionFact',
                column: 'Revenue',
                datatype: 'numeric',
              },
            },
            formula: 'sum([7022])',
            filter: {
              bottom: 5,
            },
            title: 'bottom 5 by total of Revenue',
          },
          panel: 'scope',
        },
        mockMeasureItem,
      ] as MetadataItem[];

      const result = fixRankingFilterJaql(problematicItems);
      const transformedScopeItem = result[1];

      expect(transformedScopeItem.jaql.filter).toEqual({
        bottom: 5,
        by: {
          type: 'measure',
          context: {
            '[7022]': {
              dim: '[SauceProductionFact.Revenue]',
              table: 'SauceProductionFact',
              column: 'Revenue',
              datatype: 'numeric',
            },
          },
          formula: 'sum([7022])',
        },
      });
    });
  });

  describe('when no transformation needed', () => {
    it('should return items unchanged when already in correct structure', () => {
      // Correct structure (Structure 1)
      const correctItems = [
        mockRowsDimension,
        {
          jaql: {
            dim: '[Ingredient.IngredientName]',
            table: 'Ingredient',
            column: 'IngredientName',
            datatype: 'text',
            filter: {
              top: 10,
              by: {
                type: 'measure',
                context: {
                  '[7022]': {
                    dim: '[SauceProductionFact.Revenue]',
                    table: 'SauceProductionFact',
                    column: 'Revenue',
                    datatype: 'numeric',
                  },
                },
                formula: 'sum([7022])',
              },
            },
            title: 'top 10 by total of Revenue',
          },
          panel: 'scope',
        },
        mockMeasureItem,
      ] as MetadataItem[];

      const result = fixRankingFilterJaql(correctItems);

      expect(result).toEqual(correctItems);
    });

    it('should return items unchanged when no ranking filters exist', () => {
      const itemsWithoutRanking = [
        mockRowsDimension,
        {
          jaql: {
            type: 'measure',
            formula: 'sum([Revenue])',
            title: 'Total Revenue',
          },
          panel: 'scope',
        },
        mockMeasureItem,
      ] as MetadataItem[];

      const result = fixRankingFilterJaql(itemsWithoutRanking);

      expect(result).toEqual(itemsWithoutRanking);
    });
  });

  describe('edge cases', () => {
    it('should return original items when no rows dimension exists', () => {
      const itemsWithoutRows = [
        {
          jaql: {
            type: 'measure',
            filter: {
              top: 10,
            },
            formula: 'sum([Revenue])',
            title: 'Top 10 Revenue',
          },
          panel: 'scope',
        },
        mockMeasureItem,
      ] as MetadataItem[];

      const result = fixRankingFilterJaql(itemsWithoutRows);

      expect(result).toEqual(itemsWithoutRows);
    });

    it('should return original items when input is empty', () => {
      const result = fixRankingFilterJaql([]);
      expect(result).toEqual([]);
    });

    it('should not transform items that are not in scope panel', () => {
      const itemsWithRankingInMeasures = [
        mockRowsDimension,
        {
          jaql: {
            type: 'measure',
            filter: {
              top: 10,
            },
            formula: 'sum([Revenue])',
            title: 'Top 10 Revenue',
          },
          panel: 'measures', // not scope
        },
      ] as MetadataItem[];

      const result = fixRankingFilterJaql(itemsWithRankingInMeasures);

      expect(result).toEqual(itemsWithRankingInMeasures);
    });

    it('should not transform ranking filters that already have by clause', () => {
      const itemsWithCorrectRanking = [
        mockRowsDimension,
        {
          jaql: {
            type: 'measure',
            filter: {
              top: 10,
              by: {
                type: 'measure',
                formula: 'sum([Revenue])',
              },
            },
            formula: 'sum([Revenue])',
            title: 'Top 10 Revenue',
          },
          panel: 'scope',
        },
      ] as MetadataItem[];

      const result = fixRankingFilterJaql(itemsWithCorrectRanking);

      expect(result).toEqual(itemsWithCorrectRanking);
    });
  });
});
