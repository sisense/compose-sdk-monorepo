import { describe, it, expect } from 'vitest';
import { generateTooltipLines, trimUnnecessaryBrackets } from './tooltip-utils';
import { TFunction } from '@ethings-os/sdk-common';
import { ReactNode } from 'react';
import { FilterRelationsDescription } from '@/utils/filter-relations';

describe('tooltip-utils', () => {
  describe('generateTooltipLines', () => {
    const mockT = ((key: string) => {
      const translations: Record<string, string> = {
        'filterRelations.and': 'AND',
        'filterRelations.or': 'OR',
      };
      return translations[key] || key;
    }) as unknown as TFunction;

    it('should generate tooltip with attributes and operators', () => {
      const filterRelationsDescription: FilterRelationsDescription = [
        { nodeType: 'openBracket' },
        { nodeType: 'attribute', attribute: 'Age' },
        { nodeType: 'operator', operator: 'AND' },
        { nodeType: 'attribute', attribute: 'Salary' },
        { nodeType: 'closeBracket' },
      ];

      const result: ReactNode[] = generateTooltipLines(filterRelationsDescription, mockT);

      expect(result).toMatchSnapshot();
    });

    it('should handle multiple operators and brackets', () => {
      const filterRelationsDescription: FilterRelationsDescription = [
        { nodeType: 'openBracket' },
        { nodeType: 'attribute', attribute: 'Age' },
        { nodeType: 'operator', operator: 'OR' },
        { nodeType: 'attribute', attribute: 'Salary' },
        { nodeType: 'closeBracket' },
        { nodeType: 'operator', operator: 'AND' },
        { nodeType: 'attribute', attribute: 'Location' },
      ];

      const result: ReactNode[] = generateTooltipLines(filterRelationsDescription, mockT);

      expect(result).toMatchSnapshot();
    });

    it('should handle empty description', () => {
      const filterRelationsDescription: FilterRelationsDescription = [];

      const result: ReactNode[] = generateTooltipLines(filterRelationsDescription, mockT);

      expect(result).toMatchObject([<></>]);
    });
  });

  describe('trimUnnecessaryBrackets', () => {
    it('should remove outermost unnecessary brackets', () => {
      const filterRelationsDescription: FilterRelationsDescription = [
        { nodeType: 'openBracket' },
        { nodeType: 'attribute', attribute: 'Age' },
        { nodeType: 'operator', operator: 'AND' },
        { nodeType: 'attribute', attribute: 'Salary' },
        { nodeType: 'closeBracket' },
      ];

      const result = trimUnnecessaryBrackets(filterRelationsDescription);

      expect(result).toEqual([
        { nodeType: 'attribute', attribute: 'Age' },
        { nodeType: 'operator', operator: 'AND' },
        { nodeType: 'attribute', attribute: 'Salary' },
      ]);
    });

    it('should return the original description if fewer than two nodes', () => {
      const filterRelationsDescription: FilterRelationsDescription = [
        { nodeType: 'attribute', attribute: 'Age' },
      ];

      const result = trimUnnecessaryBrackets(filterRelationsDescription);

      expect(result).toEqual(filterRelationsDescription);
    });

    it('should handle deeply nested brackets', () => {
      const filterRelationsDescription: FilterRelationsDescription = [
        { nodeType: 'openBracket' },
        { nodeType: 'openBracket' },
        { nodeType: 'attribute', attribute: 'Age' },
        { nodeType: 'closeBracket' },
        { nodeType: 'closeBracket' },
      ];

      const result = trimUnnecessaryBrackets(filterRelationsDescription);

      expect(result).toEqual([{ nodeType: 'attribute', attribute: 'Age' }]);
    });
  });
});
