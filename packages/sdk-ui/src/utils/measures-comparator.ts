import { Element, CalculatedMeasure, Filter, Measure, MeasureContext } from '@ethings-os/sdk-data';

import isEqual from 'lodash-es/isEqual';

import { areFiltersEqual } from './filters-comparator';

/**
 * Checks if the measures have changed by deep comparison.
 */
export const areMeasuresChanged = (
  prevMeasures: Measure[] | undefined,
  newMeasures: Measure[] | undefined,
): boolean => {
  // if both measures are undefined, nothing has changed
  if (prevMeasures === undefined && newMeasures === undefined) {
    return false;
  }
  // if one of the measures is undefined, and other not - changed
  if ([prevMeasures, newMeasures].some((measures) => measures === undefined)) {
    return true;
  }
  // if the length of the measures is different - changed
  if (prevMeasures!.length !== newMeasures!.length) {
    return true;
  }
  // if both measures are empty - nothing has changed
  if (prevMeasures!.length === 0 && newMeasures!.length === 0) {
    return false;
  }

  const wasChangesDetectedPerMeasure: boolean[] = prevMeasures!.map((prevMeasure, i) => {
    const newMeasure = newMeasures![i];
    return !areMeasuresEqual(prevMeasure, newMeasure);
  });
  return wasChangesDetectedPerMeasure.includes(true);
};

function isCalculatedMeasure(measure: Measure): measure is CalculatedMeasure {
  return 'context' in measure && 'expression' in measure;
}

/**
 * Compares two measures
 */
function areMeasuresEqual(measureA: Measure, measureB: Measure): boolean {
  // calculated measures can contain filters in their contexts so need to be compared separately
  if (isCalculatedMeasure(measureA) && isCalculatedMeasure(measureB)) {
    return areCalculatedMeasuresEqual(measureA, measureB);
  }

  return isEqual(measureA, measureB);
}

/**
 * Compares two calculated measures
 */
function areCalculatedMeasuresEqual(
  measureA: CalculatedMeasure,
  measureB: CalculatedMeasure,
): boolean {
  // calculated measures can contain filters in their contexts
  // so we need to compare contexts separately with considering filters comparison rules
  const { context: contextA, ...restA } = measureA;
  const { context: contextB, ...restB } = measureB;

  return areContextsEqual(contextA, contextB) && isEqual(restA, restB);
}

/** Checks if the provided entity is a Filter. */
const isFilter = (maybeFilter: unknown): maybeFilter is Filter => {
  return isElement(maybeFilter) && maybeFilter.type === 'filter';
};

/** Checks if the provided entity is an Element. */
const isElement = (maybeElement: unknown): maybeElement is Element => {
  return typeof maybeElement === 'object' && !!maybeElement && 'type' in maybeElement;
};

/**
 * Compares two contexts of calculated measures.
 */
function areContextsEqual(contextA: MeasureContext, contextB: MeasureContext): boolean {
  // compare keys first
  const contextAKeys = Object.keys(contextA);
  const contextBKeys = Object.keys(contextB);
  const areKeysEqual = isEqual(contextAKeys, contextBKeys);
  if (!areKeysEqual) {
    return false;
  }
  // compare values
  return contextAKeys.every((key) => {
    const valueA = contextA[key];
    const valueB = contextB[key];
    // MeasureContext of calculated measure can recursively contain other calculated measures
    if (isCalculatedMeasure(valueA) && isCalculatedMeasure(valueB)) {
      return areCalculatedMeasuresEqual(valueA, valueB);
    }
    // compare filters with special rules
    if (isFilter(valueA) && isFilter(valueB)) {
      return areFiltersEqual(valueA, valueB);
    }
    return isEqual(valueA, valueB);
  });
}
