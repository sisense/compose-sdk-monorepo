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

    it('should allow formulas with no references even when context is provided', () => {
      const formula = 'SUM(Revenue) + 100';
      const result = validateFormulaReferences(formula, mockContext);

      // When no bracket references exist, empty context is allowed and unused context is not checked
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toHaveLength(1); // Warning about no references
      expect(result.warnings[0]).toContain('No bracket references found');
      expect(result.references).toEqual([]);
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

    it('should reject empty context when formula has bracket references', () => {
      const formula = '[totalRevenue]';
      const result = validateFormulaReferences(formula, {});

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Context cannot be empty');
      expect(result.errors[0]).toContain('custom formulas require context definitions');
    });

    it('should allow empty context when formula has no bracket references', () => {
      const formula = 'MOD(10, 7)';
      const result = validateFormulaReferences(formula, {});

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.references).toEqual([]);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('No bracket references found');
    });

    it('should validate complex nested formula with all context used', () => {
      const complexContext = {
        revenue: 'measure1',
        cost: 'measure2',
      };

      const formula = 'RANK(([revenue] - [cost]) / [revenue], "DESC")';
      const result = validateFormulaReferences(formula, complexContext);

      expect(result.isValid).toBe(true);
      expect(result.references).toEqual(['revenue', 'cost']);
      expect(result.unusedContextKeys).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should fail with complex formula that has unused context', () => {
      const complexContext = {
        revenue: 'measure1',
        cost: 'measure2',
        profitMargin: 'measure3', // unused
      };

      const formula = 'RANK(([revenue] - [cost]) / [revenue], "DESC")';
      const result = validateFormulaReferences(formula, complexContext);

      expect(result.isValid).toBe(false);
      expect(result.references).toEqual(['revenue', 'cost']);
      expect(result.unusedContextKeys).toEqual(['profitMargin']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Context keys [profitMargin] are defined but not used');
    });

    describe('operator syntax validation', () => {
      it('should fail for COUNT(DISTINCT [date])', () => {
        const formula = 'COUNT(DISTINCT [date])';
        const context = { date: 'DM.Commerce.Date' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('Invalid syntax');
        expect(result.errors[0]).toContain("'DISTINCT'");
        expect(result.errors[0]).toContain(
          'operator cannot be used before bracket reference without parentheses',
        );
      });

      it('should fail for ALL [revenue]', () => {
        const formula = 'ALL [revenue]';
        const context = {
          revenue: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
        };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('Invalid syntax');
        expect(result.errors[0]).toContain("'ALL'");
      });

      it('should fail for SUM(ALL [field])', () => {
        const formula = 'SUM(ALL [field])';
        const context = { field: 'DM.Commerce.Field' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('Invalid syntax');
        expect(result.errors[0]).toContain("'ALL'");
      });

      it('should fail for case-insensitive operators (lowercase)', () => {
        const formula = 'count(distinct [date])';
        const context = { date: 'DM.Commerce.Date' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain("'distinct'");
      });

      it('should fail for case-insensitive operators (mixed case)', () => {
        const formula = 'Distinct [field]';
        const context = {
          field: { function: 'measureFactory.sum', args: ['DM.Commerce.Field'] },
        };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain("'Distinct'");
      });

      it('should pass for COUNT([date]) - no operator', () => {
        const formula = 'COUNT([date])';
        const context = { date: 'DM.Commerce.Date' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(true);
        expect(result.errors.filter((e) => e.includes('Invalid syntax'))).toHaveLength(0);
      });

      it('should pass for ALL([revenue]) - operator has parentheses', () => {
        const formula = 'ALL([revenue])';
        // Use a measure so the formula satisfies the aggregative requirement (ALL is not aggregative)
        const context = {
          revenue: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
        };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(true);
        expect(result.errors.filter((e) => e.includes('Invalid syntax'))).toHaveLength(0);
      });
    });

    describe('aggregate function requirement validation', () => {
      it('should fail for [roomNumber] + [bedCount] - no function calls', () => {
        const formula = '[roomNumber] + [bedCount]';
        const context = { roomNumber: 'DM.Rooms.Room_number', bedCount: 'DM.Rooms.Bed_count' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('aggregative function');
      });

      it('should fail for [revenue] - [cost] - no function calls', () => {
        const formula = '[revenue] - [cost]';
        const context = { revenue: 'DM.Commerce.Revenue', cost: 'DM.Commerce.Cost' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('aggregative function');
      });

      it('should fail for [field] - single bracket reference without function call', () => {
        const formula = '[field]';
        const context = { field: 'DM.Commerce.Field' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('aggregative function');
      });

      it('should fail when any ref is raw attribute and no aggregative call - mix of measure and raw', () => {
        const formula = '([totalRevenue] - [cost]) / [totalRevenue]';
        const context = {
          totalRevenue: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
          cost: 'DM.Commerce.Cost',
        };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('aggregative function');
        expect(result.errors[0]).toContain('[cost]');
        expect(result.errors[0]).toContain('raw attributes');
        expect(result.errors[0]).toContain('aggregative function');
      });

      it('should pass for SUM([revenue]) - has function call', () => {
        const formula = 'SUM([revenue])';
        const context = { revenue: 'DM.Commerce.Revenue' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(true);
        expect(result.errors.filter((e) => e.includes('aggregate function calls'))).toHaveLength(0);
      });

      it('should pass for SUM([revenue]) + [cost] - has function call', () => {
        const formula = 'SUM([revenue]) + [cost]';
        const context = { revenue: 'DM.Commerce.Revenue', cost: 'DM.Commerce.Cost' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(true);
        expect(result.errors.filter((e) => e.includes('aggregate function calls'))).toHaveLength(0);
      });

      it('should pass for SUM([revenue]) / COUNT([date]) - has function calls', () => {
        const formula = 'SUM([revenue]) / COUNT([date])';
        const context = { revenue: 'DM.Commerce.Revenue', date: 'DM.Commerce.Date' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(true);
        expect(result.errors.filter((e) => e.includes('aggregate function calls'))).toHaveLength(0);
      });

      // Only known Sisense aggregative functions (SUM, AVG, etc.) satisfy the rule; unknown
      // function names do not count as aggregative.
      it('should fail for CustomFunc([revenue]) - unknown function is not aggregative', () => {
        const formula = 'CustomFunc([revenue])';
        const context = { revenue: 'DM.Commerce.Revenue' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('aggregative function');
      });

      it('should fail for CustomFunc1(CustomFunc2([revenue])) - nested unknown functions', () => {
        const formula = 'CustomFunc1(CustomFunc2([revenue]))';
        const context = { revenue: 'DM.Commerce.Revenue' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('aggregative function');
      });

      it('should fail for ABS([revenue]) - non-aggregative function with raw attribute ref', () => {
        const formula = 'ABS([revenue])';
        const context = { revenue: 'DM.Commerce.Revenue' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('ABS is not an aggregative function');
        expect(result.errors[0]).toContain('[revenue]');
        expect(result.errors[0]).toContain('raw attributes');
      });

      it('should fail for IF([x] > 0, 1, 0) - non-aggregative function with raw attribute ref', () => {
        const formula = 'IF([x] > 0, 1, 0)';
        const context = { x: 'DM.Some.Attr' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('aggregative function');
      });

      it('should fail for ROUND([cost], 2) - non-aggregative function with raw attribute ref', () => {
        const formula = 'ROUND([cost], 2)';
        const context = { cost: 'DM.Commerce.Cost' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('aggregative function');
      });

      it('should pass for ABS(SUM([revenue])) - aggregative call wraps raw attribute ref', () => {
        const formula = 'ABS(SUM([revenue]))';
        const context = { revenue: 'DM.Commerce.Revenue' };
        const result = validateFormulaReferences(formula, context);

        expect(result.isValid).toBe(true);
        expect(result.errors.filter((e) => e.includes('aggregate function calls'))).toHaveLength(0);
      });

      it('should pass for MOD(10, 7) - no bracket references, function call not required', () => {
        const formula = 'MOD(10, 7)';
        const result = validateFormulaReferences(formula, {});

        expect(result.isValid).toBe(true);
        expect(result.errors.filter((e) => e.includes('aggregate function calls'))).toHaveLength(0);
      });
    });
  });

  describe('validateFormulaReferencesOrThrow', () => {
    const mockContext = {
      totalRevenue: 'mockMeasure',
      cost: 'mockAttribute',
    };

    it('should not throw for valid formula', () => {
      const formula = 'SUM([totalRevenue]) + SUM([cost])';
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

    it('should throw for empty context when formula has bracket references', () => {
      const formula = '[totalRevenue]';
      expect(() => {
        validateCustomFormula(formula, {});
      }).toThrow('Context cannot be empty');
    });

    it('should not throw for empty context when formula has no bracket references', () => {
      const formula = 'MOD(10, 7)';
      expect(() => {
        validateCustomFormula(formula, {});
      }).not.toThrow();
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
