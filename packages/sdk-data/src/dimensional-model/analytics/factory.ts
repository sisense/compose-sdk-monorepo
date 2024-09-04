import cloneDeep from 'lodash-es/cloneDeep.js';
import type { Attribute, Measure } from '../interfaces.js';
import { customFormula } from '../measures/factory.js';

/** @internal */
export const BOX_WHISKER = {
  BOX_MIN_VALUE_NAME: 'Box Min',
  BOX_MEDIAN_VALUE_NAME: 'Box Median',
  BOX_MAX_VALUE_NAME: 'Box Max',
  WHISKER_MIN_VALUE_NAME: 'Whisker Min',
  WHISKER_MAX_VALUE_NAME: 'Whisker Max',
  OUTLIER_COUNT_VALUE_NAME: 'Outlier Count',
  OUTLIER_MIN_VALUE_NAME: 'Outlier Min',
  OUTLIER_MAX_VALUE_NAME: 'Outlier Max',
};

function boxWhiskerCommonValues(target: Attribute) {
  return [
    customFormula(BOX_WHISKER.BOX_MIN_VALUE_NAME, 'QUARTILE([Attr], 1)', {
      Attr: target,
    }),
    customFormula(BOX_WHISKER.BOX_MEDIAN_VALUE_NAME, 'MEDIAN([Attr])', {
      Attr: target,
    }),
    customFormula(BOX_WHISKER.BOX_MAX_VALUE_NAME, 'QUARTILE([Attr], 3)', {
      Attr: target,
    }),
  ] as Measure[];
}

/**
 * Returns an array of values for box whisker plot using interquartile range (IQR) calculations.
 *
 * @param {Attribute} target - The target attribute for calculations.
 * @returns {Measure[]} An array of measures representing IQR values for box whisker plots.
 */
export function boxWhiskerIqrValues(target: Attribute) {
  return [
    ...boxWhiskerCommonValues(target),
    customFormula(BOX_WHISKER.WHISKER_MIN_VALUE_NAME, 'LOWERWHISKERMAX_IQR([Attr])', {
      Attr: target,
    }),
    customFormula(BOX_WHISKER.WHISKER_MAX_VALUE_NAME, 'UPPERWHISKERMIN_IQR([Attr])', {
      Attr: target,
    }),
    customFormula(BOX_WHISKER.OUTLIER_COUNT_VALUE_NAME, 'OUTLIERSCOUNT_IQR([Attr])', {
      Attr: target,
    }),
  ] as Measure[];
}

/**
 * Returns an array of extremum values for box whisker plot.
 *
 * @param {Attribute} target - The target attribute for calculations.
 * @returns {Measure[]} An array of measures representing extremum values for box whisker plots.
 */
export function boxWhiskerExtremumsValues(target: Attribute) {
  return [
    ...boxWhiskerCommonValues(target),
    customFormula(BOX_WHISKER.WHISKER_MIN_VALUE_NAME, 'MIN([Attr])', {
      Attr: target,
    }),
    customFormula(BOX_WHISKER.WHISKER_MAX_VALUE_NAME, 'MAX([Attr])', {
      Attr: target,
    }),
  ] as Measure[];
}

/**
 * Returns an array of values for box whisker plot using standard deviation calculations.
 *
 * @param {Attribute} target - The target attribute for calculations.
 * @returns {Measure[]} An array of measures representing standard deviation values for box whisker plots.
 */
export function boxWhiskerStdDevValues(target: Attribute) {
  return [
    ...boxWhiskerCommonValues(target),
    customFormula(BOX_WHISKER.WHISKER_MIN_VALUE_NAME, 'LOWERWHISKERMAX_STDEVP([Attr])', {
      Attr: target,
    }),
    customFormula(BOX_WHISKER.WHISKER_MAX_VALUE_NAME, 'UPPERWHISKERMIN_STDEVP([Attr])', {
      Attr: target,
    }),
    customFormula(BOX_WHISKER.OUTLIER_COUNT_VALUE_NAME, 'OUTLIERSCOUNT_STDEVP([Attr])', {
      Attr: target,
    }),
  ] as Measure[];
}

/**
 * Returns an attribute representing outlier points based on interquartile range (IQR) calculations.
 *
 * @param {Attribute} target - The target attribute for calculations.
 * @returns {Attribute} An attribute representing outliers for box whisker plots using IQR.
 */
export const boxWhiskerIqrOutliers = (target: Attribute): Attribute => {
  const outliersAttrWithInnerFilter = cloneDeep(target);
  const outliersMax = customFormula(
    BOX_WHISKER.OUTLIER_MAX_VALUE_NAME,
    '(UPPERWHISKERMIN_IQR([Attr]), all([Attr]))',
    {
      Attr: target,
    },
  ) as Measure;
  const outliersMin = customFormula(
    BOX_WHISKER.OUTLIER_MIN_VALUE_NAME,
    '(LOWERWHISKERMAX_IQR([Attr]), all([Attr]))',
    {
      Attr: target,
    },
  ) as Measure;

  outliersAttrWithInnerFilter.name = `${outliersAttrWithInnerFilter.name} (Outliers)`;

  outliersAttrWithInnerFilter.jaql = (nested?: boolean) => {
    const jaql = {
      ...target.jaql(true),
      filter: {
        or: [
          {
            fromNotEqual: outliersMax.jaql(true),
          },
          {
            toNotEqual: outliersMin.jaql(true),
          },
        ],
      },
    };

    return nested ? jaql : { jaql };
  };

  return outliersAttrWithInnerFilter;
};

/**
 * Returns an attribute representing outlier points based on standard deviation calculations.
 *
 * @param {Attribute} target - The target attribute for calculations.
 * @returns {Attribute} An attribute representing outliers for box whisker plots using standard deviation.
 */
export const boxWhiskerStdDevOutliers = (target: Attribute): Attribute => {
  const outliersAttrWithInnerFilter = cloneDeep(target);
  const outliersMax = customFormula(
    BOX_WHISKER.OUTLIER_MAX_VALUE_NAME,
    '(UPPERWHISKERMIN_STDEVP([Attr]), all([Attr]))',
    {
      Attr: target,
    },
  ) as Measure;
  const outliersMin = customFormula(
    BOX_WHISKER.OUTLIER_MIN_VALUE_NAME,
    '(LOWERWHISKERMAX_STDEVP([Attr]), all([Attr]))',
    {
      Attr: target,
    },
  ) as Measure;

  outliersAttrWithInnerFilter.jaql = (nested?: boolean) => {
    const jaql = {
      ...target.jaql(true),
      filter: {
        or: [
          {
            fromNotEqual: outliersMax.jaql(true),
          },
          {
            toNotEqual: outliersMin.jaql(true),
          },
        ],
      },
    };

    return nested ? jaql : { jaql };
  };

  return outliersAttrWithInnerFilter;
};
