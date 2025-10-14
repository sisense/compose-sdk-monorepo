/**
 * Tests for custom formula bracket validation
 */
import { describe, expect, it, vi } from 'vitest';

import { validateCustomFormula, validateFormulaReferences } from './validate-custom-formula.js';

describe('formula-validation', () => {
  describe('validateFormulaReferences', () => {
    const mockContext = {
      totalRevenue: 'mockMeasure',
      cost: 'mockAttribute',
      categoryFilter: 'mockFilter',
    };

    it('should fail when unused context keys exist (default behavior)', () => {
      const formula = '([totalRevenue] - SUM([cost])) / [totalRevenue]';
      const result = validateFormulaReferences(formula, mockContext);

      expect(result.isValid).toBe(false); // Now fails due to unused context
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Context keys [categoryFilter] are defined but not used');
      expect(result.references).toEqual(['totalRevenue', 'cost']);
      expect(result.unusedContextKeys).toEqual(['categoryFilter']);
      expect(result.warnings).toEqual([]);
    });

    it('should detect missing references', () => {
      const formula = '[totalRevenue] + [missingRef] + [cost]';
      const result = validateFormulaReferences(formula, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // Missing reference + unused context
      expect(result.errors[0]).toContain('missingRef');
      expect(result.errors[0]).toContain('Available keys: totalRevenue, cost, categoryFilter');
      expect(result.errors[1]).toContain('Context keys [categoryFilter] are defined but not used');
      expect(result.references).toEqual(['totalRevenue', 'missingRef', 'cost']);
    });

    it('should detect multiple missing references', () => {
      const formula = '[missing1] + [totalRevenue] + [missing2]';
      const result = validateFormulaReferences(formula, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // Missing references + unused context
      expect(result.errors[0]).toContain('missing1], [missing2');
      expect(result.errors[0]).toContain('Available keys');
      expect(result.errors[1]).toContain(
        'Context keys [cost, categoryFilter] are defined but not used',
      );
    });

    it('should handle empty formula', () => {
      const result = validateFormulaReferences('', mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Formula cannot be empty');
    });

    it('should allow empty formula when configured', () => {
      const result = validateFormulaReferences('', mockContext, { allowEmptyFormula: true });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail when no references found but context provided', () => {
      const formula = 'SUM(Revenue) + 100';
      const result = validateFormulaReferences(formula, mockContext);

      expect(result.isValid).toBe(false); // Now fails due to unused context
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain(
        'Context keys [totalRevenue, cost, categoryFilter] are defined but not used',
      );
      expect(result.warnings).toHaveLength(1); // Only warning about no references
      expect(result.warnings[0]).toContain('No bracket references found');
    });

    it('should use warning mode instead of errors when configured', () => {
      const formula = '[totalRevenue] + 100';
      const result = validateFormulaReferences(formula, mockContext, {
        errorOnUnusedContext: false, // Use warning mode
        warnUnusedContext: true,
      });

      expect(result.isValid).toBe(true); // Valid when using warnings
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain(
        'Context keys [cost, categoryFilter] are defined but not used',
      );
      expect(result.errors).toEqual([]);
    });

    it('should disable all unused context checking when configured', () => {
      const formula = '[totalRevenue] + 100';
      const result = validateFormulaReferences(formula, mockContext, {
        errorOnUnusedContext: false,
        warnUnusedContext: false,
      });

      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should use custom error prefix', () => {
      const formula = '';
      const result = validateFormulaReferences(formula, mockContext, {
        errorPrefix: 'Custom Prefix',
      });

      expect(result.errors[0]).toContain('Custom Prefix');
    });

    it('should reject empty context', () => {
      const formula = '[totalRevenue]';
      const result = validateFormulaReferences(formula, {});

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Context cannot be empty');
      expect(result.errors[0]).toContain('custom formulas require context definitions');
    });

    it('should validate complex nested formula with all context used', () => {
      const complexContext = {
        revenue: 'measure1',
        cost: 'measure2',
        categoryFilter: 'filter1',
      };

      const formula = 'RANK(([revenue] - [cost]) / [revenue], "DESC") WHERE [categoryFilter]';
      const result = validateFormulaReferences(formula, complexContext);

      expect(result.isValid).toBe(true);
      expect(result.references).toEqual(['revenue', 'cost', 'categoryFilter']);
      expect(result.unusedContextKeys).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should fail with complex formula that has unused context', () => {
      const complexContext = {
        revenue: 'measure1',
        cost: 'measure2',
        profitMargin: 'measure3', // unused
        categoryFilter: 'filter1',
      };

      const formula = 'RANK(([revenue] - [cost]) / [revenue], "DESC") WHERE [categoryFilter]';
      const result = validateFormulaReferences(formula, complexContext);

      expect(result.isValid).toBe(false);
      expect(result.references).toEqual(['revenue', 'cost', 'categoryFilter']);
      expect(result.unusedContextKeys).toEqual(['profitMargin']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Context keys [profitMargin] are defined but not used');
    });
  });

  describe('validateFormulaReferencesOrThrow', () => {
    const mockContext = {
      totalRevenue: 'mockMeasure',
      cost: 'mockAttribute',
    };

    it('should not throw for valid formula', () => {
      const formula = '[totalRevenue] + [cost]';
      expect(() => {
        validateCustomFormula(formula, mockContext);
      }).not.toThrow();
    });

    it('should throw for invalid formula', () => {
      const formula = '[totalRevenue] + [missingRef]';
      expect(() => {
        validateCustomFormula(formula, mockContext);
      }).toThrow('missingRef');
    });

    it('should throw for empty formula', () => {
      expect(() => {
        validateCustomFormula('', mockContext);
      }).toThrow('Formula cannot be empty');
    });

    it('should throw for unused context keys (default behavior)', () => {
      const formula = '[totalRevenue] + 100'; // cost is unused
      expect(() => {
        validateCustomFormula(formula, mockContext);
      }).toThrow('Context keys [cost] are defined but not used in formula');
    });

    it('should log warnings when error mode disabled', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const formula = '[totalRevenue] + 100'; // cost is unused
      validateCustomFormula(formula, mockContext, {
        errorOnUnusedContext: false,
        warnUnusedContext: true,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Formula validation warnings:',
        expect.stringContaining('not used in formula'),
      );

      consoleSpy.mockRestore();
    });

    it('should include custom error prefix in thrown errors', () => {
      const formula = '[missingRef]';
      expect(() => {
        validateCustomFormula(formula, mockContext, {
          errorPrefix: 'Custom Test Error',
        });
      }).toThrow('Custom Test Error');
    });

    it('should throw for empty context', () => {
      const formula = '[totalRevenue]';
      expect(() => {
        validateCustomFormula(formula, {});
      }).toThrow('Context cannot be empty');
    });
  });

  describe('edge cases', () => {
    it('should handle formulas with special characters', () => {
      const formula = '[ref-with-dash] + [ref.with.dots] + [ref_with_underscore]';
      const context = {
        'ref-with-dash': 'value1',
        'ref.with.dots': 'value2',
        ref_with_underscore: 'value3',
      };

      const result = validateFormulaReferences(formula, context);
      expect(result.isValid).toBe(true);
      expect(result.references).toEqual(['ref-with-dash', 'ref.with.dots', 'ref_with_underscore']);
    });

    it('should handle whitespace around brackets', () => {
      const formula = '  [totalRevenue]  +  [cost]  ';
      const context = { totalRevenue: 'value1', cost: 'value2' };

      // Whitespace around brackets is fine
      const result = validateFormulaReferences(formula, context);
      expect(result.isValid).toBe(true);
      expect(result.references).toEqual(['totalRevenue', 'cost']);
    });

    it('should reject whitespace inside brackets', () => {
      const formula = '[ totalRevenue ] + [cost]';
      const context = { totalRevenue: 'value1', cost: 'value2' };

      // Whitespace inside brackets should not be recognized as valid references
      // Our regex correctly ignores [ totalRevenue ] and only recognizes [cost]
      const result = validateFormulaReferences(formula, context);

      expect(result.isValid).toBe(false); // Invalid due to unused 'totalRevenue' context
      expect(result.references).toEqual(['cost']); // [ totalRevenue ] is ignored
      expect(result.errors).toHaveLength(1); // Error about unused 'totalRevenue' in context
      expect(result.errors[0]).toContain('Context keys [totalRevenue] are defined but not used');
    });

    it('should handle very long formulas', () => {
      const longFormula = Array(50).fill('[totalRevenue]').join(' + ');
      const context = { totalRevenue: 'value1' };

      const result = validateFormulaReferences(longFormula, context);
      expect(result.isValid).toBe(true);
      expect(result.references).toEqual(['totalRevenue']);
    });
  });
});
