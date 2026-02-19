import { CalculatedMeasure, filterFactory, Measure, measureFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { areMeasuresChanged } from './measures-comparator';

const createCountriesBeginningWithAMeasure = (): CalculatedMeasure => {
  // This is a calculated measure that uses a filter in its context
  return measureFactory.customFormula('startsWith A', '(DUPCOUNT([countryDim]), [countryFilter])', {
    countryDim: DM.Country.Country,
    countryFilter: filterFactory.startsWith(DM.Country.Country, 'A'),
  });
};

const createMoreThen4000Measure = (): CalculatedMeasure => {
  // This is a calculated measure that uses another calculated measure in its context
  const countriesBeginningWithA = createCountriesBeginningWithAMeasure();
  return measureFactory.customFormula(' > 4000', 'IF ( [filteredCountryCount] > 4000, 1, 0)', {
    filteredCountryCount: countriesBeginningWithA,
  });
};

const createRegularMeasure = (): Measure => {
  // This is a regular measure
  return measureFactory.count(DM.Country.Country, '# Countries');
};

describe('measures-comparator', () => {
  describe('areMeasuresChanged', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should return false when both measures are undefined', () => {
      expect(areMeasuresChanged(undefined, undefined)).toBe(false);
    });

    it('should return true when only prevMeasures is undefined', () => {
      const newMeasures: Measure[] = [createCountriesBeginningWithAMeasure()];
      expect(areMeasuresChanged(undefined, newMeasures)).toBe(true);
    });

    it('should return true when only newMeasures is undefined', () => {
      const prevMeasures: Measure[] = [createCountriesBeginningWithAMeasure()];
      expect(areMeasuresChanged(prevMeasures, undefined)).toBe(true);
    });

    it('should return false when both measures are empty arrays', () => {
      expect(areMeasuresChanged([], [])).toBe(false);
    });

    it('should return true when measures have different lengths', () => {
      const prevMeasures: Measure[] = [createCountriesBeginningWithAMeasure()];
      const newMeasures: Measure[] = [
        createCountriesBeginningWithAMeasure(),
        createCountriesBeginningWithAMeasure(),
      ];
      expect(areMeasuresChanged(prevMeasures, newMeasures)).toBe(true);
    });

    it('should return false when calculated measures are created with the same params', () => {
      const measure1 = createCountriesBeginningWithAMeasure();
      const measure2 = createCountriesBeginningWithAMeasure();
      const prevMeasures: Measure[] = [measure1];
      const newMeasures: Measure[] = [measure2];
      expect(areMeasuresChanged(prevMeasures, newMeasures)).toBe(false);
    });

    describe('for calculated measures which has another calculated measures in context', () => {
      it('should return false when calculated measures are created with the same params', () => {
        const measure1 = createMoreThen4000Measure();
        const measure2 = createMoreThen4000Measure();
        const prevMeasures: Measure[] = [measure1];
        const newMeasures: Measure[] = [measure2];
        expect(areMeasuresChanged(prevMeasures, newMeasures)).toBe(false);
      });
    });

    describe('for regular measures', () => {
      it('should return false when regular measures are created with the same params', () => {
        const measure1 = createRegularMeasure();
        const measure2 = createRegularMeasure();
        const prevMeasures: Measure[] = [measure1];
        const newMeasures: Measure[] = [measure2];
        expect(areMeasuresChanged(prevMeasures, newMeasures)).toBe(false);
      });
    });

    it('should return true when at least one measure is different', () => {
      const prevMeasures: Measure[] = [
        createCountriesBeginningWithAMeasure(),
        createRegularMeasure(),
      ];
      const newMeasures: Measure[] = [
        createCountriesBeginningWithAMeasure(),
        createMoreThen4000Measure(),
      ];
      expect(areMeasuresChanged(prevMeasures, newMeasures)).toBe(true);
    });
  });
});
