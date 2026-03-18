/**
 * Schema metadata for formula functions used inside customFormula formula strings
 * (e.g. DDIFF([Leave Time], [Enter Time])). Used by validation and translation.
 *
 * @internal
 */
import { DateLevels } from '@sisense/sdk-data';

/** Category of formula function for validation and translation. */
export type FormulaFunctionCategory = 'time-diff' | 'aggregative' | 'math' | 'growth' | 'date';

/** Metadata for a formula function (e.g. DDIFF, SUM). */
export interface FormulaFunctionMeta {
  category: FormulaFunctionCategory;
  argCount: number;
  /** Required date level for time-diff functions (e.g. DateLevels.Days for DDIFF). */
  requiredDateLevel?: string;
  /** Argument type constraint; 'datetime' means args must be datetime dimensions. */
  argType?: 'datetime';
}

/** Registry keyed by formula function name (uppercase). */
export const FORMULA_FUNCTION_SCHEMAS: Record<string, FormulaFunctionMeta> = {
  SDIFF: {
    category: 'time-diff',
    argCount: 2,
    requiredDateLevel: DateLevels.Seconds,
    argType: 'datetime',
  },
  MNDIFF: {
    category: 'time-diff',
    argCount: 2,
    requiredDateLevel: DateLevels.Minutes,
    argType: 'datetime',
  },
  HDIFF: {
    category: 'time-diff',
    argCount: 2,
    requiredDateLevel: DateLevels.Hours,
    argType: 'datetime',
  },
  DDIFF: {
    category: 'time-diff',
    argCount: 2,
    requiredDateLevel: DateLevels.Days,
    argType: 'datetime',
  },
  MDIFF: {
    category: 'time-diff',
    argCount: 2,
    requiredDateLevel: DateLevels.Months,
    argType: 'datetime',
  },
  QDIFF: {
    category: 'time-diff',
    argCount: 2,
    requiredDateLevel: DateLevels.Quarters,
    argType: 'datetime',
  },
  YDIFF: {
    category: 'time-diff',
    argCount: 2,
    requiredDateLevel: DateLevels.Years,
    argType: 'datetime',
  },
};

const TIME_DIFF_NAMES = Object.keys(FORMULA_FUNCTION_SCHEMAS).filter(
  (name) => FORMULA_FUNCTION_SCHEMAS[name].category === 'time-diff',
);

/**
 * Returns formula function names that are time-diff (SDIFF, MNDIFF, HDIFF, DDIFF, MDIFF, QDIFF, YDIFF).
 */
export function getTimeDiffFormulaFunctions(): readonly string[] {
  return TIME_DIFF_NAMES;
}

/**
 * Returns the required date level for a time-diff function, or undefined if not a time-diff function.
 */
export function getRequiredDateLevel(formulaFunctionName: string): string | undefined {
  const meta = FORMULA_FUNCTION_SCHEMAS[formulaFunctionName.toUpperCase()];
  return meta?.requiredDateLevel;
}

/**
 * Returns formula function names for a given category.
 */
export function getFormulaFunctionsByCategory(
  category: FormulaFunctionCategory,
): readonly string[] {
  return Object.keys(FORMULA_FUNCTION_SCHEMAS).filter(
    (name) => FORMULA_FUNCTION_SCHEMAS[name].category === category,
  );
}
