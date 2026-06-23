import { TFunction } from '@sisense/sdk-common';
import get from 'lodash/get';

import { translation as enTranslation } from '../../../../../../infra/translation/resources/en';
import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { TreemapChartDesignOptions } from '../design-options';
import { HighchartsDataPointContext } from '../tooltip-utils';
import { treemapTooltipFormatter } from './treemap-tooltip';

const translateMock = ((path: string) => {
  return get(enTranslation, path, '');
}) as TFunction;

describe('Treemap Chart tooltip formatter', () => {
  const dataOptions = {
    y: [{ column: { title: 'test' } }],
  } as CategoricalChartDataOptionsInternal;

  const designOptions = {} as TreemapChartDesignOptions;

  const node1 = {
    val: 1,
    name: 'One',
  };
  const node2 = {
    val: 2,
    name: 'Two',
  };
  const node3 = {
    val: 3,
    name: 'Three',
  };
  const node4 = {
    val: 4,
    name: 'Four',
  };

  it('single category tooltip', () => {
    const context = {
      color: 'red',
      point: {
        node: {
          ...node1,
          parentNode: node2,
        },
      },
    } as unknown as HighchartsDataPointContext;

    expect(
      treemapTooltipFormatter(context, dataOptions, designOptions, translateMock),
    ).toMatchSnapshot();
  });

  it('three categories tooltip', () => {
    const context = {
      color: 'blue',
      point: {
        node: {
          ...node1,
          parentNode: {
            ...node2,
            parentNode: {
              ...node3,
              parentNode: {
                ...node4,
              },
            },
          },
        },
      },
    } as unknown as HighchartsDataPointContext;

    expect(
      treemapTooltipFormatter(context, dataOptions, designOptions, translateMock),
    ).toMatchSnapshot();
  });

  it('should render raw value when defaultNumberFormattingEnabled is false and no explicit config', () => {
    const context = {
      color: 'red',
      point: {
        node: {
          val: 54321,
          name: 'Test Node',
          parentNode: { val: 100000, name: 'Root' },
        },
      },
    } as unknown as HighchartsDataPointContext;

    const result = treemapTooltipFormatter(
      context,
      dataOptions,
      designOptions,
      translateMock,
      undefined,
      false,
    );

    expect(result).toContain('54321');
    expect(result).not.toContain('54.32K');
  });

  it('should format value with explicit numberFormatConfig when defaultNumberFormattingEnabled is false', () => {
    const context = {
      color: 'red',
      point: {
        node: {
          val: 42,
          name: 'Test Node',
          parentNode: { val: 100, name: 'Root' },
        },
      },
    } as unknown as HighchartsDataPointContext;

    const dataOptionsWithConfig = {
      y: [
        { column: { title: 'Revenue' }, numberFormatConfig: { name: 'Percent', decimalScale: 0 } },
      ],
    } as CategoricalChartDataOptionsInternal;

    // 42 * 100 = 4,200% — confirms formatting was applied, not raw String(42)
    const result = treemapTooltipFormatter(
      context,
      dataOptionsWithConfig,
      designOptions,
      translateMock,
      undefined,
      false,
    );

    expect(result).toContain('4,200%');
  });

  it('contribution mode', () => {
    const context = {
      color: 'blue',
      point: {
        node: {
          ...node1,
          parentNode: {
            ...node2,
            parentNode: {
              ...node3,
              parentNode: {
                ...node4,
              },
            },
          },
        },
      },
    } as unknown as HighchartsDataPointContext;
    const designOptionsWithContribution = {
      tooltip: { mode: 'contribution' },
    } as TreemapChartDesignOptions;

    expect(
      treemapTooltipFormatter(context, dataOptions, designOptionsWithContribution, translateMock),
    ).toMatchSnapshot();
  });
});
