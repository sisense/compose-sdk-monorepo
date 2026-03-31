/**
 * Schema metadata for formula functions used inside customFormula formula strings
 * (e.g. DDIFF([Leave Time], [Enter Time])). Used by validation and translation.
 *
 * @internal
 */
import { DateLevels } from '@sisense/sdk-data';

/** Category of formula function for validation and translation. */
export type FormulaFunctionCategory =
  | 'xdiff'
  | 'aggregative'
  | 'math'
  | 'growth'
  | 'date'
  | 'window'
  | 'string'
  | 'scalar';

/** Metadata for a formula function (e.g. DDIFF, SUM). */
export interface FormulaFunctionMeta {
  category: FormulaFunctionCategory;
  /** Inclusive minimum number of parenthesized arguments. */
  minArgs: number;
  /** Inclusive maximum number of parenthesized arguments; use Infinity for unbounded (e.g. concat). */
  maxArgs: number;
  /** Required date level for xdiff functions (e.g. DateLevels.Days for DDIFF). */
  requiredDateLevel?: string;
  /** Argument type constraint; 'datetime' means args must be datetime dimensions. */
  argType?: 'datetime';
}

const m = (
  category: FormulaFunctionCategory,
  minArgs: number,
  maxArgs: number,
  extra?: Pick<FormulaFunctionMeta, 'requiredDateLevel' | 'argType'>,
): FormulaFunctionMeta => ({ category, minArgs, maxArgs, ...extra });

/**
 * Formula functions explicitly not supported in custom formulas (engine may expose them elsewhere).
 * Keys are uppercase for lookup.
 */
export const UNSUPPORTED_FORMULA_FUNCTIONS: ReadonlySet<string> = new Set([
  'CORREL',
  'COVARP',
  'COVAR',
  'EXPONDIST',
  'INTERCEPT',
  'LARGEST',
  'NORMDIST',
  'POISSONDIST',
  'SKEWP',
  'SKEW',
  'SLOPE',
  'TDIST',
  'COSH',
  'SINH',
  'TANH',
  'ORDERING',
  'RDOUBLE',
  'RINT',
]);

/** Registry keyed by formula function name (uppercase). */
export const FORMULA_FUNCTION_SCHEMAS: Record<string, FormulaFunctionMeta> = {
  // ── X-diff (datetime difference operators) ──
  SDIFF: m('xdiff', 2, 2, {
    requiredDateLevel: DateLevels.Seconds,
    argType: 'datetime',
  }),
  MNDIFF: m('xdiff', 2, 2, {
    requiredDateLevel: DateLevels.Minutes,
    argType: 'datetime',
  }),
  HDIFF: m('xdiff', 2, 2, {
    requiredDateLevel: DateLevels.Hours,
    argType: 'datetime',
  }),
  DDIFF: m('xdiff', 2, 2, {
    requiredDateLevel: DateLevels.Days,
    argType: 'datetime',
  }),
  MDIFF: m('xdiff', 2, 2, {
    requiredDateLevel: DateLevels.Months,
    argType: 'datetime',
  }),
  QDIFF: m('xdiff', 2, 2, {
    requiredDateLevel: DateLevels.Quarters,
    argType: 'datetime',
  }),
  YDIFF: m('xdiff', 2, 2, {
    requiredDateLevel: DateLevels.Years,
    argType: 'datetime',
  }),

  // ── Aggregation ──
  ANYVALUE: m('aggregative', 1, 1),
  SUM: m('aggregative', 1, 2),
  AVG: m('aggregative', 1, 2),
  MIN: m('aggregative', 1, 2),
  MAX: m('aggregative', 1, 2),
  COUNT: m('aggregative', 1, 2),
  DUPCOUNT: m('aggregative', 1, 1),
  COUNTDUPLICATES: m('aggregative', 1, 1),
  STDEV: m('aggregative', 1, 2),
  STDEVP: m('aggregative', 1, 2),
  VAR: m('aggregative', 1, 2),
  VARP: m('aggregative', 1, 2),
  MEDIAN: m('aggregative', 1, 2),
  QUARTILE: m('aggregative', 2, 3),
  PERCENTILE: m('aggregative', 2, 3),
  LOWERWHISKERMAX_IQR: m('aggregative', 1, 1),
  LOWERWHISKERMAX_STDEVP: m('aggregative', 1, 1),
  UPPERWHISKERMIN_IQR: m('aggregative', 1, 1),
  UPPERWHISKERMIN_STDEVP: m('aggregative', 1, 1),
  OUTLIERSCOUNT_IQR: m('aggregative', 1, 1),
  OUTLIERSCOUNT_STDEVP: m('aggregative', 1, 1),
  MODE: m('aggregative', 1, 1),
  NOAGGFUNCTION: m('aggregative', 1, 1),

  // ── Window ──
  RANK: m('window', 0, Number.POSITIVE_INFINITY),
  RSUM: m('window', 1, 2),
  RAVG: m('window', 1, 2),
  YTDSUM: m('window', 1, 1),
  QTDSUM: m('window', 1, 1),
  MTDSUM: m('window', 1, 1),
  WTDSUM: m('window', 1, 1),
  YTDAVG: m('window', 1, 1),
  QTDAVG: m('window', 1, 1),
  MTDAVG: m('window', 1, 1),
  WTDAVG: m('window', 1, 1),

  // ── String ──
  CONCAT: m('string', 2, Number.POSITIVE_INFINITY),
  LEFT: m('string', 2, 2),
  RIGHT: m('string', 2, 2),

  // ── Scalar / math ──
  ABS: m('scalar', 1, 1),
  ACOS: m('scalar', 1, 1),
  ASIN: m('scalar', 1, 1),
  ATAN: m('scalar', 1, 1),
  CEILING: m('scalar', 1, 1),
  CONTRIBUTION: m('scalar', 1, 1),
  COS: m('scalar', 1, 1),
  COT: m('scalar', 1, 1),
  DIFFPASTDAY: m('scalar', 1, 1),
  DIFFPASTMONTH: m('scalar', 1, 1),
  DIFFPASTPERIOD: m('scalar', 1, 1),
  DIFFPASTQUARTER: m('scalar', 1, 1),
  DIFFPASTWEEK: m('scalar', 1, 1),
  DIFFPASTYEAR: m('scalar', 1, 1),
  EXP: m('scalar', 1, 1),
  FLOOR: m('scalar', 1, 1),
  GROWTH: m('growth', 1, 1),
  GROWTHPASTMONTH: m('growth', 1, 1),
  GROWTHPASTQUARTER: m('growth', 1, 1),
  GROWTHPASTWEEK: m('growth', 1, 1),
  GROWTHPASTYEAR: m('growth', 1, 1),
  GROWTHRATE: m('growth', 1, 1),
  LN: m('scalar', 1, 1),
  LOG10: m('scalar', 1, 1),
  MINUS: m('scalar', 1, 1),
  MOD: m('scalar', 2, 2),
  QUOTIENT: m('scalar', 2, 2),
  PASTDAY: m('date', 1, 2),
  PASTMONTH: m('date', 1, 2),
  PASTPERIOD: m('date', 1, 2),
  PASTQUARTER: m('date', 1, 2),
  PASTWEEK: m('date', 1, 2),
  PASTYEAR: m('date', 1, 2),
  PERCENTILEDISCFORINTERNALUSEONLY: m('scalar', 1, 1),
  PERCENTILECONTFORINTERNALUSEONLY: m('scalar', 1, 1),
  POWER: m('scalar', 2, 2),
  ROUND: m('scalar', 2, 2),
  SIN: m('scalar', 1, 1),
  SQRT: m('scalar', 1, 1),
  TAN: m('scalar', 1, 1),
};

const XDIFF_FORMULA_NAMES = Object.keys(FORMULA_FUNCTION_SCHEMAS).filter(
  (name) => FORMULA_FUNCTION_SCHEMAS[name].category === 'xdiff',
);

/**
 * Returns inclusive arg bounds for a known formula function, or undefined if not in the registry.
 */
export function getFormulaFunctionArgBounds(
  formulaFunctionName: string,
): Pick<FormulaFunctionMeta, 'minArgs' | 'maxArgs'> | undefined {
  const meta = FORMULA_FUNCTION_SCHEMAS[formulaFunctionName.toUpperCase()];
  if (!meta) return undefined;
  return { minArgs: meta.minArgs, maxArgs: meta.maxArgs };
}

/**
 * Returns formula function names that are xdiff (SDIFF, MNDIFF, HDIFF, DDIFF, MDIFF, QDIFF, YDIFF).
 */
export function getXDiffFormulaFunctions(): readonly string[] {
  return XDIFF_FORMULA_NAMES;
}

/**
 * Returns the required date level for an xdiff function, or undefined if not an xdiff function.
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

/**
 * Human-readable arity text for validation errors (e.g. "1 or 2 parameters", "at least 2 parameters").
 */
export function formatFormulaFunctionArityMessage(minArgs: number, maxArgs: number): string {
  if (minArgs === maxArgs) {
    return minArgs === 1 ? '1 parameter' : `${minArgs} parameters`;
  }
  if (maxArgs === Number.POSITIVE_INFINITY) {
    return minArgs <= 1 ? 'any number of parameters' : `at least ${minArgs} parameters`;
  }
  return `${minArgs} or ${maxArgs} parameters`;
}
