import { ColoringService } from '../../../chart-data-options/coloring';
import { IndicatorDataOptions, DataColorOptions } from '../../../types';
import { LegacyIndicatorChartOptions } from '../types';
import {
  getValueColorOptions,
  overrideWithValueColor,
  isAllowedIndicatorColorOptions,
  AllowedIndicatorColoringTypes,
} from './override_with_value_color';
import { numericSimpleLegacyChartOptionsWithDarkTheme } from './__mocks__/legacy_chart_options';
import cloneDeep from 'lodash/cloneDeep';
import '../../../chart-data-options/coloring';
import { IndicatorTypeOptions } from './indicator_legacy_chart_options';

const getColorMock = vi.fn().mockReturnValue('red');
const coloringServiceMock: ColoringService<AllowedIndicatorColoringTypes> = {
  type: 'Static',
  getColor: getColorMock,
};

vi.mock('../../../chart-data-options/coloring', () => {
  return {
    __esModule: true,
    getColoringServiceByColorOptions: () => coloringServiceMock,
  };
});

describe('getValueColorOptions', () => {
  it('should return the color options from IndicatorDataOptions', () => {
    const dataOptions: IndicatorDataOptions = {
      value: [
        {
          name: 'Some Data',
          color: 'red',
        },
      ],
    };

    const result = getValueColorOptions(dataOptions);

    expect(result).toBe('red');
  });

  it('should return undefined if color options are not found', () => {
    const dataOptions: IndicatorDataOptions = {
      value: [
        {
          name: 'Some Data',
        },
      ],
    };

    const result = getValueColorOptions(dataOptions);

    expect(result).toBeUndefined();
  });
});

describe('isAllowedIndicatorColorOptions', () => {
  it('should return true for allowed indicator color options', () => {
    const colorOptions1: DataColorOptions = 'red';
    const colorOptions2: DataColorOptions = {
      type: 'uniform',
      color: 'blue',
    };
    const colorOptions3: DataColorOptions = {
      type: 'conditional',
      conditions: [],
    };

    const result1 = isAllowedIndicatorColorOptions(colorOptions1);
    const result2 = isAllowedIndicatorColorOptions(colorOptions2);
    const result3 = isAllowedIndicatorColorOptions(colorOptions3);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });

  it('should return false for disallowed indicator color options', () => {
    const unallowedColorOptions: DataColorOptions = {
      type: 'range',
      minValue: 0,
      maxValue: 100,
      minColor: 'blue',
      maxColor: 'red',
    };

    expect(isAllowedIndicatorColorOptions(unallowedColorOptions)).toBe(false);
  });
});

describe('overrideWithValueColor', () => {
  it('should return the modified legacy chart options with the specified color', () => {
    const colorOptions: DataColorOptions = {
      type: 'uniform',
      color: 'red',
    };

    getColorMock.mockReturnValue('red');

    const legacyChartOptions: LegacyIndicatorChartOptions = cloneDeep(
      numericSimpleLegacyChartOptionsWithDarkTheme,
    );

    const expectedChartOptions: LegacyIndicatorChartOptions = {
      ...legacyChartOptions,
      value: {
        ...legacyChartOptions.value,
        color: 'red',
      },
    };

    const typeOptions = {
      type: 'numeric',
      numericSubtype: 'numericSimple',
    } as IndicatorTypeOptions;

    const result = overrideWithValueColor(colorOptions, 10, legacyChartOptions, typeOptions);
    expect(result).toEqual(expectedChartOptions);
  });

  it("should return the unmodified legacy chart options if unallowed color options passed (like 'range')", () => {
    const unallowedColorOptions: DataColorOptions = {
      type: 'range',
      minValue: 0,
      maxValue: 100,
      minColor: 'blue',
      maxColor: 'red',
    };
    const legacyChartOptions: LegacyIndicatorChartOptions = cloneDeep(
      numericSimpleLegacyChartOptionsWithDarkTheme,
    );
    const typeOptions = {
      type: 'numeric',
      numericSubtype: 'numericSimple',
    } as IndicatorTypeOptions;
    const result = overrideWithValueColor(
      unallowedColorOptions,
      10,
      legacyChartOptions,
      typeOptions,
    );
    expect(result).toEqual(legacyChartOptions);
  });

  it("should return the unmodified legacy chart options if the coloring service can't return color for value", () => {
    const colorOptions: DataColorOptions = {
      type: 'uniform',
      color: 'red',
    };

    getColorMock.mockReturnValue(undefined);

    const legacyChartOptions: LegacyIndicatorChartOptions = cloneDeep(
      numericSimpleLegacyChartOptionsWithDarkTheme,
    );
    const typeOptions = {
      type: 'numeric',
      numericSubtype: 'numericSimple',
    } as IndicatorTypeOptions;

    const result = overrideWithValueColor(colorOptions, 10, legacyChartOptions, typeOptions);
    expect(result).toEqual(legacyChartOptions);
  });
});
