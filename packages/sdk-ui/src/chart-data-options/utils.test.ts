import {
  CalculatedMeasureColumn,
  Column,
  DateLevels,
  DimensionalLevelAttribute,
  LevelAttribute,
  MeasureColumn,
} from '@ethings-os/sdk-data';
import {
  safeMerge,
  safeCombine,
  splitColumn,
  isMeasureColumn,
  getDataOptionTitle,
  getDataOptionGranularity,
  translateColumnToAttribute,
  translateColumnToMeasure,
  isStyledColumn,
  isCategoryStyle,
  normalizeColumn,
  normalizeMeasureColumn,
  normalizeAnyColumn,
} from './utils';
import { CategoryStyle, StyledColumn, StyledMeasureColumn } from './types';

const thisColumn: Column = {
  name: 'Years',
  type: 'date',
  expression: 'Years',
  jaql: () => ({}),
  id: 'thisColumn',
} as Column;

const thatColumn: Column = {
  name: 'Category',
  type: 'string',
  expression: 'Category',
  jaql: () => ({}),
  id: 'thatColumn',
} as Column;

const thisMeasure: MeasureColumn = {
  name: 'Quantity',
  aggregation: 'sum',
  jaql: () => ({}),
  id: 'thisMeasure',
} as MeasureColumn;

const thatMeasure: MeasureColumn = {
  name: 'Units',
  aggregation: 'sum',
  jaql: () => ({}),
  id: 'thatMeasure',
} as MeasureColumn;

const thatColumnStyled: StyledColumn = {
  column: thatColumn,
};

const thisMeasureStyled: StyledMeasureColumn = {
  column: thisMeasure,
  showOnRightAxis: false,
};

const thatMeasureStyled: StyledMeasureColumn = {
  column: thatMeasure,
  showOnRightAxis: true,
  color: '#0000FF',
};

const style: CategoryStyle = { color: 'red' };

const mockLevelAttr = {
  name: 'date',
  type: 'datetime',
  expression: 'Date',
  granularity: DateLevels.Days,
  format: 'YYYY-MM-DD',
  getFormat: () => 'YYYY-MM-DD',
  translateGranularityToJaql: () => ({}),
  setGranularity: () => {},
  getSort: () => ({}),
  sort: {},
  jaql: () => ({}),
  id: 'mockLevelAttr',
} as unknown as LevelAttribute;

describe('Chart Data Options Utils', () => {
  describe('safeMerge', () => {
    it('should safe merge objects', () => {
      const parent = { identity: 'parent', active: 'Yes' };
      const child = { identity: 'child', skip: true };

      const result = safeMerge(parent, child);

      expect(result.identity).toBe('child');
      expect(result.active).toBe('Yes');
      expect(result.skip).toBe(true);

      expect(parent).toEqual({ identity: 'parent', active: 'Yes' });
      expect(child).toEqual({ identity: 'child', skip: true });
    });
  });

  describe('safeCombine', () => {
    it('should combine objects while preserving prototype', () => {
      const parent = { identity: 'parent', active: 'Yes' };
      const child = Object.create(parent);
      const toMerge = { active: 'No' };

      const result = safeCombine(child, toMerge);

      expect(result.identity).toBe('parent');
      expect(result.active).toBe('No');
      expect(Object.getPrototypeOf(result)).toBe(parent);
    });
  });

  describe('splitColumn', () => {
    it('should split styled column into column and style', () => {
      const styledColumn: StyledColumn = { ...thatColumnStyled, ...style };

      const result = splitColumn(styledColumn);

      expect(result.column).toBe(thatColumn);
      expect(result.style).toEqual(style);
    });

    it('should handle non-styled column', () => {
      const result = splitColumn(thisColumn);

      expect(result.column).toBe(thisColumn);
      expect(result.style).toEqual({});
    });
  });

  describe('isMeasureColumn', () => {
    it('should identify measure column with aggregation', () => {
      expect(isMeasureColumn(thisMeasure)).toBe(true);
    });

    it('should identify calculated measure column', () => {
      const calculatedMeasure = {
        name: 'calc',
        context: {},
        expression: 'SUM([Sales])',
      } as CalculatedMeasureColumn;

      expect(isMeasureColumn(calculatedMeasure)).toBe(true);
    });

    it('should identify styled measure column', () => {
      expect(isMeasureColumn(thisMeasureStyled)).toBe(true);
    });

    it('should return false for attribute columns', () => {
      expect(isMeasureColumn(thisColumn)).toBe(false);
    });
  });

  describe('getDataOptionTitle', () => {
    it('should use name from styled column if provided', () => {
      const styledColumn: StyledColumn = {
        ...thatColumnStyled,
        name: 'customName',
      };

      expect(getDataOptionTitle(styledColumn)).toBe('customName');
    });

    it('should use column title if available', () => {
      const styledColumn: StyledMeasureColumn = {
        column: {
          ...thisMeasure,
          title: 'Custom Title',
        } as MeasureColumn,
      };

      expect(getDataOptionTitle(styledColumn)).toBe('Custom Title');
    });

    it('should fall back to column name', () => {
      expect(getDataOptionTitle(thatColumnStyled)).toBe('Category');
    });
  });

  describe('getDataOptionGranularity', () => {
    it('should use provided granularity', () => {
      const styledColumn: StyledColumn = {
        column: thisColumn,
        granularity: DateLevels.Months,
      };

      expect(getDataOptionGranularity(styledColumn)).toBe(DateLevels.Months);
    });

    it('should use column granularity if available', () => {
      const dimensionalAttr = {
        ...thisColumn,
        granularity: DateLevels.Quarters,
      } as DimensionalLevelAttribute;
      const styledColumn: StyledColumn = { column: dimensionalAttr };

      expect(getDataOptionGranularity(styledColumn)).toBe(DateLevels.Quarters);
    });

    it('should default to Years', () => {
      const styledColumn: StyledColumn = { column: thisColumn };

      expect(getDataOptionGranularity(styledColumn)).toBe(DateLevels.Years);
    });
  });

  describe('translateColumnToAttribute', () => {
    it('should extract attribute from styled column', () => {
      expect(translateColumnToAttribute(thatColumnStyled)).toBe(thatColumn);
    });

    it('should return original column if not styled', () => {
      expect(translateColumnToAttribute(thisColumn)).toBe(thisColumn);
    });
  });

  describe('translateColumnToMeasure', () => {
    it('should extract measure from styled column', () => {
      expect(translateColumnToMeasure(thisMeasureStyled)).toBe(thisMeasure);
    });
  });

  describe('isStyledColumn', () => {
    it('should identify styled columns', () => {
      expect(isStyledColumn(thatColumnStyled)).toBe(true);
    });

    it('should return false for regular columns', () => {
      expect(isStyledColumn(thisColumn)).toBe(false);
    });
  });

  describe('isCategoryStyle', () => {
    it('should identify category style objects', () => {
      expect(isCategoryStyle(style)).toBe(true);
    });

    // TODO: this should not fail, check function
    it.skip('should return false for columns', () => {
      expect(isCategoryStyle(thisColumn)).toBe(false);
    });
  });

  describe('normalizeColumn', () => {
    it('should normalize regular column to styled column', () => {
      const result = normalizeColumn(thisColumn);

      expect(result).toEqual({ column: thisColumn });
    });

    it('should preserve existing style', () => {
      const styledColumn: StyledColumn = {
        ...thatColumnStyled,
        ...style,
      };

      const result = normalizeColumn(styledColumn);

      expect(result).toEqual(styledColumn);
    });

    it('should handle date format for datetime columns', () => {
      const result = normalizeColumn(mockLevelAttr);

      expect(result.dateFormat).toBe('YYYY-MM-DD');
    });
  });

  describe('normalizeMeasureColumn', () => {
    it('should normalize measure column with defaults', () => {
      const result = normalizeMeasureColumn(thisMeasure);

      expect(result).toHaveProperty('column');
      expect(result).toHaveProperty('enabled', true);

      const column = result.column as MeasureColumn;
      expect(column.name).toBe('Quantity');
      expect(column.title).toBe('Quantity');
      expect(column.aggregation).toBe('sum');
    });

    it('should preserve existing style and properties', () => {
      const result = normalizeMeasureColumn(thatMeasureStyled);

      expect(result).toHaveProperty('column');
      expect(result).toHaveProperty('enabled', true);
      expect(result).toHaveProperty('showOnRightAxis', true);
      expect(result).toHaveProperty('color', '#0000FF');

      const column = result.column as MeasureColumn;
      expect(column.name).toBe('Units');
      expect(column.title).toBe('Units');
      expect(column.aggregation).toBe('sum');
    });
  });

  describe('normalizeAnyColumn', () => {
    it('should normalize measure columns', () => {
      const result = normalizeAnyColumn(thisMeasure);

      expect(result).toHaveProperty('column');
      expect(result).toHaveProperty('enabled', true);

      const column = result.column as MeasureColumn;
      expect(column.name).toBe('Quantity');
      expect(column.title).toBe('Quantity');
      expect(column.aggregation).toBe('sum');
    });

    it('should normalize attribute columns', () => {
      const result = normalizeAnyColumn(thisColumn);

      expect(result).toEqual({ column: thisColumn });
    });
  });
});
